import type {
  ExtractorComparisonDTO,
  IngestTopicAcceptedDTO,
  IngestionProgressEvent,
  McqQuizSubmissionResultDTO,
  PaginatedResult,
  ReflectiveKeywordDTO,
  ReflectiveMcqQuizSessionDTO,
  ReflectiveParagraphDTO,
  ReflectiveSubjectiveGradeResultDTO,
  ReflectiveSubjectiveQuestionDTO,
  ReflectiveTopicSummaryDTO,
  TopicChapterPageDTO,
} from '@mono-magic/data-access-ts-interfaces';
import type {
  EventSourceFactory,
  EventSourceLike,
  ReflectiveFetchFn,
  ReflectiveHttpResponseLike,
  SseMessageEventLike,
} from './reflective-api-types.js';

interface TopicRecord {
  summary: ReflectiveTopicSummaryDTO;
  paragraphs: ReflectiveParagraphDTO[];
  keywords: ReflectiveKeywordDTO[];
  subjectiveQuestions: ReflectiveSubjectiveQuestionDTO[];
}

/**
 * Controller returned by {@link createInMemoryReflectiveTransport} for simulating
 * server-side SSE emissions, transient HTTP failures, and inspecting state in tests.
 */
export interface InMemoryReflectiveTransport {
  /** Injectable fetch implementation wired to the in-memory Reflective Learning backend. */
  readonly fetchFn: ReflectiveFetchFn;
  /** Injectable EventSource factory wired to the in-memory SSE hub. */
  readonly eventSourceFactory: EventSourceFactory;
  /** Emits a progress event to all active SSE subscribers for `topicId`. */
  emitIngestionEvent(event: IngestionProgressEvent): void;
  /** Emits a raw SSE message string (useful for testing malformed JSON handling). */
  emitRawSseData(topicId: string, rawData: string): void;
  /** Emits a transport error to all active SSE subscribers for `topicId`. */
  emitSseError(topicId: string, error: unknown): void;
  /** Queues a one-off HTTP failure response for the next `count` fetch requests. */
  queueFailureResponse(status: number, body: unknown, count?: number): void;
}

function jsonResponse(status: number, payload: unknown): ReflectiveHttpResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 || status === 202 ? 'OK' : 'Error',
    async json() {
      return payload;
    },
    async text() {
      return typeof payload === 'string' ? payload : JSON.stringify(payload);
    },
  };
}

/**
 * Creates a deterministic in-memory REST + SSE transport for {@link ReflectiveLearningApiClient}.
 */
export function createInMemoryReflectiveTransport(): InMemoryReflectiveTransport {
  const topics = new Map<string, TopicRecord>();
  const quizSessions = new Map<
    string,
    {
      session: ReflectiveMcqQuizSessionDTO;
      correctByQuestionId: Map<string, string>;
    }
  >();
  const sseSubscribers = new Map<string, Set<EventSourceLike>>();
  const queuedFailures: Array<{ status: number; body: unknown }> = [];
  let seq = 0;

  const seedDefaultTopic = (id: string, title: string): TopicRecord => {
    const paragraphs: ReflectiveParagraphDTO[] = [
      {
        index: 0,
        heading: 'Introduction',
        text: 'A black hole is a region of spacetime where gravity is so strong that nothing can escape.',
      },
      {
        index: 1,
        heading: 'Event Horizon',
        text: 'The event horizon is the boundary beyond which events cannot affect an outside observer.',
      },
    ];
    const keywords: ReflectiveKeywordDTO[] = [
      {
        id: `${id}-kw-1`,
        term: 'spacetime',
        paragraphIndices: [0],
        isPerson: false,
        posPattern: 'NOUN',
        frequency: 3,
        approved: null,
      },
      {
        id: `${id}-kw-2`,
        term: 'event horizon',
        paragraphIndices: [1],
        isPerson: false,
        posPattern: 'NOUN NOUN',
        frequency: 2,
        approved: true,
      },
    ];
    const subjectiveQuestions: ReflectiveSubjectiveQuestionDTO[] = [
      {
        id: `${id}-sq-1`,
        keyword: 'spacetime',
        prompt: 'What is a black hole in spacetime?',
        referenceSentences: [paragraphs[0].text],
        approved: true,
      },
    ];
    const summary: ReflectiveTopicSummaryDTO = {
      id,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      sourceKind: 'wikipedia',
      paragraphCount: paragraphs.length,
      keywordCount: keywords.length,
      approvedKeywordCount: 1,
      status: 'ready',
      updatedAt: new Date(0).toISOString(),
    };
    const record: TopicRecord = {
      summary,
      paragraphs,
      keywords,
      subjectiveQuestions,
    };
    topics.set(id, record);
    return record;
  };

  seedDefaultTopic('topic-seed', 'Black Hole');

  const eventSourceFactory: EventSourceFactory = (url) => {
    const match = /\/topics\/([^/]+)\/events/.exec(url);
    const topicId = decodeURIComponent(match?.[1] ?? 'unknown');
    let bucket = sseSubscribers.get(topicId);
    if (!bucket) {
      bucket = new Set();
      sseSubscribers.set(topicId, bucket);
    }

    const source: EventSourceLike = {
      onmessage: null,
      onerror: null,
      close() {
        bucket?.delete(source);
      },
    };
    bucket.add(source);

    queueMicrotask(() => {
      const event: IngestionProgressEvent = {
        topicId,
        status: 'ready',
        progressPercent: 100,
        message: 'Ingestion complete',
      };
      source.onmessage?.({ data: JSON.stringify(event) });
    });

    return source;
  };

  const fetchFn: ReflectiveFetchFn = async (url, init) => {
    const queued = queuedFailures.shift();
    if (queued) {
      return jsonResponse(queued.status, queued.body);
    }

    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.replace(/^\/api\/v1/, '');
    const body = init.body ? (JSON.parse(init.body) as Record<string, unknown>) : {};

    if (init.method === 'POST' && path === '/topics/ingest') {
      seq += 1;
      const topicId = `topic-${seq}`;
      const title = typeof body['title'] === 'string' ? body['title'] : 'Untitled';
      const record = seedDefaultTopic(topicId, title);
      const accepted: IngestTopicAcceptedDTO = {
        topicId,
        title: record.summary.title,
        sourceKind:
          (body['sourceKind'] as IngestTopicAcceptedDTO['sourceKind']) ?? 'wikipedia',
        status: 'pending',
      };
      return jsonResponse(202, accepted);
    }

    if (init.method === 'GET' && path === '/topics') {
      let items = [...topics.values()].map((t) => t.summary);
      const search = parsedUrl.searchParams.get('search');
      if (search) {
        const lower = search.toLowerCase();
        items = items.filter((item) => item.title.toLowerCase().includes(lower));
      }
      const limitParam = parsedUrl.searchParams.get('limit');
      const offsetParam = parsedUrl.searchParams.get('offset');
      const offset = offsetParam ? Number(offsetParam) : 0;
      const limit = limitParam ? Number(limitParam) : items.length || 10;
      const pageItems = items.slice(offset, offset + limit);
      const result: PaginatedResult<ReflectiveTopicSummaryDTO> = {
        items: pageItems,
        total: items.length,
        hasMore: offset + pageItems.length < items.length,
      };
      return jsonResponse(200, result);
    }

    const chaptersMatch = /^\/topics\/([^/]+)\/chapters$/.exec(path);
    if (init.method === 'GET' && chaptersMatch) {
      const topicId = decodeURIComponent(chaptersMatch[1]);
      const record = topics.get(topicId);
      if (!record) {
        return jsonResponse(404, { detail: `Topic ${topicId} not found` });
      }
      const page = Number(parsedUrl.searchParams.get('page') ?? '1');
      const pageSize = Number(parsedUrl.searchParams.get('pageSize') ?? '10');
      const start = (page - 1) * pageSize;
      const pageParagraphs = record.paragraphs.slice(start, start + pageSize);
      const chapterPage: TopicChapterPageDTO = {
        topicId,
        page,
        pageSize,
        totalParagraphs: record.paragraphs.length,
        totalChapters: Math.max(1, Math.ceil(record.paragraphs.length / pageSize)),
        paragraphs: pageParagraphs,
      };
      return jsonResponse(200, chapterPage);
    }

    const mcqCreateMatch = /^\/topics\/([^/]+)\/quizzes\/mcq$/.exec(path);
    if (init.method === 'POST' && mcqCreateMatch) {
      const topicId = decodeURIComponent(mcqCreateMatch[1]);
      const record = topics.get(topicId);
      if (!record) {
        return jsonResponse(404, { detail: `Topic ${topicId} not found` });
      }
      seq += 1;
      const sessionId = `session-${seq}`;
      const maxParagraphIndex = Number(body['maxParagraphIndex'] ?? 9);
      const qId = `${sessionId}-q1`;
      const session: ReflectiveMcqQuizSessionDTO = {
        sessionId,
        topicId,
        maxParagraphIndex,
        questions: [
          {
            id: qId,
            paragraphIndex: 0,
            keyword: 'spacetime',
            prompt: 'A black hole is a region of ____ where gravity is strong.',
            options: [
              { id: 'opt-1', text: 'spacetime' },
              { id: 'opt-2', text: 'photon sphere' },
              { id: 'opt-3', text: 'accretion disk' },
              { id: 'opt-4', text: 'nebula' },
            ],
          },
        ],
      };
      quizSessions.set(sessionId, {
        session,
        correctByQuestionId: new Map([[qId, 'spacetime']]),
      });
      return jsonResponse(200, session);
    }

    const mcqSubmitMatch = /^\/quizzes\/mcq\/([^/]+)\/submit$/.exec(path);
    if (init.method === 'POST' && mcqSubmitMatch) {
      const sessionId = decodeURIComponent(mcqSubmitMatch[1]);
      const stored = quizSessions.get(sessionId);
      if (!stored) {
        return jsonResponse(404, { detail: `Quiz session ${sessionId} not found` });
      }
      const answers = (body['answers'] as Array<{
        questionId: string;
        selectedAnswer: string;
      }>) ?? [];
      const evaluations = answers.map((ans) => {
        const expected = stored.correctByQuestionId.get(ans.questionId) ?? 'spacetime';
        const isCorrect = ans.selectedAnswer === expected;
        return {
          questionId: ans.questionId,
          prompt: 'A black hole is a region of ____ where gravity is strong.',
          selectedAnswer: ans.selectedAnswer,
          correctAnswer: expected,
          isCorrect,
          explanation: isCorrect ? undefined : 'Spacetime is the four-dimensional manifold.',
        };
      });
      const correctCount = evaluations.filter((e) => e.isCorrect).length;
      const result: McqQuizSubmissionResultDTO = {
        sessionId,
        correctCount,
        totalCount: evaluations.length,
        scorePercent:
          evaluations.length > 0 ? Math.round((correctCount / evaluations.length) * 100) : 0,
        evaluations,
      };
      return jsonResponse(200, result);
    }

    const subjListMatch = /^\/topics\/([^/]+)\/subjective-questions$/.exec(path);
    if (init.method === 'GET' && subjListMatch) {
      const topicId = decodeURIComponent(subjListMatch[1]);
      const record = topics.get(topicId);
      if (!record) {
        return jsonResponse(404, { detail: `Topic ${topicId} not found` });
      }
      return jsonResponse(200, record.subjectiveQuestions);
    }

    const subjGradeMatch = /^\/subjective-questions\/([^/]+)\/grade$/.exec(path);
    if (init.method === 'POST' && subjGradeMatch) {
      const questionId = decodeURIComponent(subjGradeMatch[1]);
      const userAnswer = typeof body['userAnswer'] === 'string' ? body['userAnswer'] : '';
      const hasKeywords = /spacetime|gravity/i.test(userAnswer);
      const score = hasKeywords ? 0.86 : 0.25;
      const grade: ReflectiveSubjectiveGradeResultDTO = {
        questionId,
        similarityScore: score,
        band: score >= 0.75 ? 'correct' : 'likely_wrong',
        referenceAnswer:
          'A black hole is a region of spacetime where gravity is so strong that nothing can escape.',
        feedback: `Semantic match: ${Math.round(score * 100)}%`,
      };
      return jsonResponse(200, grade);
    }

    const kwListMatch = /^\/topics\/([^/]+)\/curation\/keywords$/.exec(path);
    if (init.method === 'GET' && kwListMatch) {
      const topicId = decodeURIComponent(kwListMatch[1]);
      const record = topics.get(topicId);
      if (!record) {
        return jsonResponse(404, { detail: `Topic ${topicId} not found` });
      }
      return jsonResponse(200, record.keywords);
    }

    const kwCurateMatch = /^\/topics\/([^/]+)\/curation\/keywords\/([^/]+)$/.exec(path);
    if (init.method === 'PATCH' && kwCurateMatch) {
      const topicId = decodeURIComponent(kwCurateMatch[1]);
      const keywordId = decodeURIComponent(kwCurateMatch[2]);
      const record = topics.get(topicId);
      const kwIndex = record?.keywords.findIndex((k) => k.id === keywordId) ?? -1;
      if (!record || kwIndex < 0) {
        return jsonResponse(404, { detail: `Keyword ${keywordId} not found` });
      }
      const updated: ReflectiveKeywordDTO = {
        ...record.keywords[kwIndex],
        approved: Boolean(body['approved']),
      };
      record.keywords[kwIndex] = updated;
      return jsonResponse(200, updated);
    }

    const sqCurateMatch = /^\/topics\/([^/]+)\/curation\/questions\/([^/]+)$/.exec(path);
    if (init.method === 'PATCH' && sqCurateMatch) {
      const topicId = decodeURIComponent(sqCurateMatch[1]);
      const questionId = decodeURIComponent(sqCurateMatch[2]);
      const record = topics.get(topicId);
      const sqIndex =
        record?.subjectiveQuestions.findIndex((q) => q.id === questionId) ?? -1;
      if (!record || sqIndex < 0) {
        return jsonResponse(404, { detail: `Subjective question ${questionId} not found` });
      }
      const existing = record.subjectiveQuestions[sqIndex];
      const updated: ReflectiveSubjectiveQuestionDTO = {
        ...existing,
        prompt: typeof body['prompt'] === 'string' ? body['prompt'] : existing.prompt,
        approved: Boolean(body['approved']),
      };
      record.subjectiveQuestions[sqIndex] = updated;
      return jsonResponse(200, updated);
    }

    const debugMatch = /^\/topics\/([^/]+)\/debug\/extractors$/.exec(path);
    if (init.method === 'GET' && debugMatch) {
      const topicId = decodeURIComponent(debugMatch[1]);
      if (!topics.has(topicId)) {
        return jsonResponse(404, { detail: `Topic ${topicId} not found` });
      }
      const comparison: ExtractorComparisonDTO = {
        topicId,
        extractors: {
          yake: ['spacetime', 'event horizon'],
          textrank: ['spacetime', 'gravity'],
          tfidf: ['black hole', 'spacetime'],
        },
      };
      return jsonResponse(200, comparison);
    }

    return jsonResponse(404, { message: `Unhandled route ${init.method} ${path}` });
  };

  return {
    fetchFn,
    eventSourceFactory,
    emitIngestionEvent(event: IngestionProgressEvent) {
      const subs = sseSubscribers.get(event.topicId);
      if (!subs) return;
      const msg: SseMessageEventLike = { data: JSON.stringify(event) };
      for (const sub of subs) {
        sub.onmessage?.(msg);
      }
    },
    emitRawSseData(topicId: string, rawData: string) {
      const subs = sseSubscribers.get(topicId);
      if (!subs) return;
      for (const sub of subs) {
        sub.onmessage?.({ data: rawData });
      }
    },
    emitSseError(topicId: string, error: unknown) {
      const subs = sseSubscribers.get(topicId);
      if (!subs) return;
      for (const sub of subs) {
        sub.onerror?.(error);
      }
    },
    queueFailureResponse(status: number, body: unknown, count = 1) {
      for (let i = 0; i < count; i += 1) {
        queuedFailures.push({ status, body });
      }
    },
  };
}
