import {
  BaseReflectiveLearningService,
  createDataAccessError,
  type DataAccessError,
  type ExtractorComparisonDTO,
  type IngestTopicAcceptedDTO,
  type IngestTopicInput,
  type IngestionProgressEvent,
  type McqAnswerSubmissionItem,
  type McqQuizSubmissionResultDTO,
  type PaginatedResult,
  type QuerySpec,
  type ReflectiveKeywordDTO,
  type ReflectiveMcqQuizSessionDTO,
  type ReflectiveSubjectiveGradeResultDTO,
  type ReflectiveSubjectiveQuestionDTO,
  type ReflectiveTopicSummaryDTO,
  type TopicChapterPageDTO,
} from '@mono-magic/data-access-ts-interfaces';
import { AppError, err, ok, retryWithBackoff, type Result } from '@mono-magic/utils-ts-core';
import {
  extractErrorMessageFromBody,
  mapHttpStatusToErrorCode,
  normalizeReflectiveApiError,
} from './reflective-api-error.js';
import type {
  ReflectiveApiClientConfig,
  ReflectiveFetchFn,
  ReflectiveHttpRequestInit,
} from './reflective-api-types.js';

/**
 * Typed REST + Server-Sent Events (SSE) client adapter implementing {@link IReflectiveLearningService}.
 *
 * Uses `@mono-magic/utils-ts-core` `Result` and `retryWithBackoff` for resilient transport,
 * normalizes all failures into `DataAccessError`, and supports injectable `fetch` and `EventSource`
 * factories for deterministic unit testing and cross-platform compatibility.
 */
export class ReflectiveLearningApiClient extends BaseReflectiveLearningService {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;
  private readonly config: ReflectiveApiClientConfig;

  public constructor(config: ReflectiveApiClientConfig) {
    super();
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiPrefix = (config.apiPrefix ?? '/api/v1').replace(/\/+$/, '');
    this.config = config;
  }

  /**
   * Builds a full endpoint URL for a path relative to `apiPrefix` with optional query parameters.
   */
  public buildUrl(
    path: string,
    queryParams?: Readonly<Record<string, string | number | boolean | undefined>>,
  ): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const fullBase = `${this.baseUrl}${this.apiPrefix}${normalizedPath}`;
    if (!queryParams) {
      return fullBase;
    }
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        search.set(key, String(value));
      }
    }
    const qs = search.toString();
    return qs.length > 0 ? `${fullBase}?${qs}` : fullBase;
  }

  private resolveFetch(): ReflectiveFetchFn {
    if (this.config.fetchFn) {
      return this.config.fetchFn;
    }
    if (typeof globalThis.fetch === 'function') {
      return (url, init) => globalThis.fetch(url, init);
    }
    throw new AppError('No fetch implementation available', {
      code: 'INTERNAL',
      retryable: false,
    });
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
    };
    if (this.config.getAuthToken) {
      const token = await this.config.getAuthToken();
      if (token && token.trim().length > 0) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }
    }
    return headers;
  }

  private async requestJson<TResponse>(
    method: ReflectiveHttpRequestInit['method'],
    path: string,
    options?: {
      readonly query?: Readonly<Record<string, string | number | boolean | undefined>>;
      readonly body?: unknown;
      readonly signal?: AbortSignal;
    },
  ): Promise<Result<TResponse, DataAccessError>> {
    try {
      const fetchFn = this.resolveFetch();
      const url = this.buildUrl(path, options?.query);
      const headers = await this.buildHeaders();
      const serializedBody =
        options?.body !== undefined ? JSON.stringify(options.body) : undefined;

      const payload = await retryWithBackoff<TResponse>(
        async () => {
          const response = await fetchFn(url, {
            method,
            headers,
            body: serializedBody,
            signal: options?.signal,
          });

          let parsedBody: unknown = null;
          try {
            parsedBody = await response.json();
          } catch {
            if (typeof response.text === 'function') {
              parsedBody = await response.text();
            }
          }

          if (!response.ok) {
            const code = mapHttpStatusToErrorCode(response.status);
            const fallback = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;
            const { message, details } = extractErrorMessageFromBody(parsedBody, fallback);
            throw new AppError(message, {
              code,
              details: { status: response.status, ...details },
              retryable:
                code === 'RATE_LIMITED' || code === 'TIMEOUT' || code === 'UNAVAILABLE',
            });
          }

          return parsedBody as TResponse;
        },
        this.config.retryOptions,
      );

      return ok(payload);
    } catch (error) {
      return err(normalizeReflectiveApiError(error));
    }
  }

  /**
   * Enqueues asynchronous topic ingestion from Wikipedia, Raw Text/Markdown, or PDF/EPUB.
   */
  public async ingestTopic(
    input: IngestTopicInput,
  ): Promise<Result<IngestTopicAcceptedDTO, DataAccessError>> {
    if (!input.title.trim()) {
      return err(
        createDataAccessError('VALIDATION', 'Topic title must not be empty.', {
          retryable: false,
        }),
      );
    }
    return this.requestJson<IngestTopicAcceptedDTO>('POST', '/topics/ingest', {
      body: {
        title: input.title.trim(),
        sourceKind: input.sourceKind ?? 'wikipedia',
        queryOrUri: input.queryOrUri,
        rawContent: input.rawContent,
        useLlm: input.useLlm ?? false,
      },
    });
  }

  /**
   * Subscribes to Server-Sent Events (SSE) ingestion progress updates for a topic.
   */
  public async subscribeIngestionEvents(
    topicId: string,
    listener: (event: IngestionProgressEvent) => void,
    onError?: (error: DataAccessError) => void,
  ): Promise<Result<() => void, DataAccessError>> {
    if (!topicId.trim()) {
      return err(
        createDataAccessError('VALIDATION', 'topicId must not be empty.', {
          retryable: false,
        }),
      );
    }
    if (!this.config.eventSourceFactory) {
      return err(
        createDataAccessError(
          'UNAVAILABLE',
          'No eventSourceFactory configured for SSE ingestion events.',
          { retryable: false },
        ),
      );
    }

    try {
      const headers = await this.buildHeaders();
      const url = this.buildUrl(`/topics/${encodeURIComponent(topicId)}/events`);
      const source = this.config.eventSourceFactory(url, headers);

      source.onmessage = (rawEvent) => {
        try {
          const parsed = JSON.parse(rawEvent.data) as IngestionProgressEvent;
          listener(parsed);
        } catch (parseErr) {
          onError?.(
            createDataAccessError('INTERNAL', 'Failed to parse SSE ingestion progress event.', {
              retryable: false,
              cause: parseErr,
            }),
          );
        }
      };

      source.onerror = (streamErr) => {
        onError?.(
          normalizeReflectiveApiError(streamErr, 'SSE ingestion event stream encountered an error.'),
        );
      };

      return ok(() => {
        source.close();
      });
    } catch (error) {
      return err(normalizeReflectiveApiError(error));
    }
  }

  /**
   * Lists or searches reflective learning topics with optional query filtering and pagination.
   */
  public async listTopics(
    query?: QuerySpec<ReflectiveTopicSummaryDTO>,
  ): Promise<Result<PaginatedResult<ReflectiveTopicSummaryDTO>, DataAccessError>> {
    const searchFilter = query?.filters?.find(
      (f) => f.field === 'title' || f.field === 'slug',
    );
    const statusFilter = query?.filters?.find((f) => f.field === 'status');
    const firstSort = query?.sort?.[0];

    return this.requestJson<PaginatedResult<ReflectiveTopicSummaryDTO>>('GET', '/topics', {
      query: {
        limit: query?.limit,
        offset: query?.offset,
        cursor: query?.cursor,
        search: typeof searchFilter?.value === 'string' ? searchFilter.value : undefined,
        status: typeof statusFilter?.value === 'string' ? statusFilter.value : undefined,
        sortBy: firstSort?.field,
        sortDir: firstSort?.direction,
      },
    });
  }

  /**
   * Fetches a paginated chapter of paragraphs for a topic (10 paragraphs per chapter by default).
   */
  public async getChapters(
    topicId: string,
    page = 1,
    pageSize = 10,
  ): Promise<Result<TopicChapterPageDTO, DataAccessError>> {
    if (!topicId.trim()) {
      return err(createDataAccessError('VALIDATION', 'topicId is required.'));
    }
    if (page < 1 || pageSize < 1) {
      return err(
        createDataAccessError('VALIDATION', 'page and pageSize must be positive integers.'),
      );
    }
    return this.requestJson<TopicChapterPageDTO>(
      'GET',
      `/topics/${encodeURIComponent(topicId)}/chapters`,
      {
        query: { page, pageSize },
      },
    );
  }

  /**
   * Generates a chapter-gated MCQ quiz session with server-shuffled options.
   */
  public async createMcqQuiz(
    topicId: string,
    maxParagraphIndex: number,
    count = 5,
  ): Promise<Result<ReflectiveMcqQuizSessionDTO, DataAccessError>> {
    if (!topicId.trim()) {
      return err(createDataAccessError('VALIDATION', 'topicId is required.'));
    }
    if (maxParagraphIndex < 0 || count < 1) {
      return err(
        createDataAccessError(
          'VALIDATION',
          'maxParagraphIndex must be >= 0 and count must be >= 1.',
        ),
      );
    }
    return this.requestJson<ReflectiveMcqQuizSessionDTO>(
      'POST',
      `/topics/${encodeURIComponent(topicId)}/quizzes/mcq`,
      {
        body: { maxParagraphIndex, count },
      },
    );
  }

  /**
   * Submits MCQ quiz answers and returns the scored breakdown.
   */
  public async submitMcqQuiz(
    sessionId: string,
    answers: ReadonlyArray<McqAnswerSubmissionItem>,
  ): Promise<Result<McqQuizSubmissionResultDTO, DataAccessError>> {
    if (!sessionId.trim()) {
      return err(createDataAccessError('VALIDATION', 'sessionId is required.'));
    }
    if (answers.length === 0) {
      return err(
        createDataAccessError('VALIDATION', 'At least one MCQ answer must be submitted.'),
      );
    }
    return this.requestJson<McqQuizSubmissionResultDTO>(
      'POST',
      `/quizzes/mcq/${encodeURIComponent(sessionId)}/submit`,
      {
        body: { answers },
      },
    );
  }

  /**
   * Lists teacher-approved or auto-generated subjective open-ended questions for a topic.
   */
  public async listSubjectiveQuestions(
    topicId: string,
  ): Promise<Result<ReadonlyArray<ReflectiveSubjectiveQuestionDTO>, DataAccessError>> {
    if (!topicId.trim()) {
      return err(createDataAccessError('VALIDATION', 'topicId is required.'));
    }
    return this.requestJson<ReadonlyArray<ReflectiveSubjectiveQuestionDTO>>(
      'GET',
      `/topics/${encodeURIComponent(topicId)}/subjective-questions`,
    );
  }

  /**
   * Grades a student's free-text answer against a subjective question using two-tier hybrid grading.
   */
  public async gradeSubjectiveAnswer(
    questionId: string,
    userAnswer: string,
  ): Promise<Result<ReflectiveSubjectiveGradeResultDTO, DataAccessError>> {
    if (!questionId.trim()) {
      return err(createDataAccessError('VALIDATION', 'questionId is required.'));
    }
    if (!userAnswer.trim()) {
      return err(createDataAccessError('VALIDATION', 'userAnswer cannot be empty.'));
    }
    return this.requestJson<ReflectiveSubjectiveGradeResultDTO>(
      'POST',
      `/subjective-questions/${encodeURIComponent(questionId)}/grade`,
      {
        body: { userAnswer: userAnswer.trim() },
      },
    );
  }

  /**
   * Lists extracted keywords for teacher curation.
   */
  public async listKeywordsForCuration(
    topicId: string,
  ): Promise<Result<ReadonlyArray<ReflectiveKeywordDTO>, DataAccessError>> {
    if (!topicId.trim()) {
      return err(createDataAccessError('VALIDATION', 'topicId is required.'));
    }
    return this.requestJson<ReadonlyArray<ReflectiveKeywordDTO>>(
      'GET',
      `/topics/${encodeURIComponent(topicId)}/curation/keywords`,
    );
  }

  /**
   * Approves or rejects an extracted keyword during teacher curation.
   */
  public async curateKeyword(
    topicId: string,
    keywordId: string,
    approved: boolean,
  ): Promise<Result<ReflectiveKeywordDTO, DataAccessError>> {
    if (!topicId.trim() || !keywordId.trim()) {
      return err(createDataAccessError('VALIDATION', 'topicId and keywordId are required.'));
    }
    return this.requestJson<ReflectiveKeywordDTO>(
      'PATCH',
      `/topics/${encodeURIComponent(topicId)}/curation/keywords/${encodeURIComponent(keywordId)}`,
      {
        body: { approved },
      },
    );
  }

  /**
   * Approves or edits a subjective question during teacher curation.
   */
  public async curateSubjectiveQuestion(
    topicId: string,
    questionId: string,
    patch: { readonly prompt?: string; readonly approved: boolean },
  ): Promise<Result<ReflectiveSubjectiveQuestionDTO, DataAccessError>> {
    if (!topicId.trim() || !questionId.trim()) {
      return err(createDataAccessError('VALIDATION', 'topicId and questionId are required.'));
    }
    return this.requestJson<ReflectiveSubjectiveQuestionDTO>(
      'PATCH',
      `/topics/${encodeURIComponent(topicId)}/curation/questions/${encodeURIComponent(questionId)}`,
      {
        body: patch,
      },
    );
  }

  /**
   * Compares keyword extraction algorithms side-by-side for admin diagnostics.
   */
  public async compareExtractors(
    topicId: string,
  ): Promise<Result<ExtractorComparisonDTO, DataAccessError>> {
    if (!topicId.trim()) {
      return err(createDataAccessError('VALIDATION', 'topicId is required.'));
    }
    return this.requestJson<ExtractorComparisonDTO>(
      'GET',
      `/topics/${encodeURIComponent(topicId)}/debug/extractors`,
    );
  }
}
