import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError, PaginatedResult, QuerySpec } from '../common/query.interface.js';

/**
 * Supported content ingestion sources for reflective learning topics.
 */
export type ReflectiveSourceKind = 'wikipedia' | 'raw_text' | 'markdown' | 'pdf' | 'epub';

/**
 * Topic ingestion lifecycle status.
 */
export type ReflectiveIngestionStatus =
  | 'pending'
  | 'scraping'
  | 'extracting'
  | 'generating'
  | 'ready'
  | 'failed';

/**
 * Semantic grading band for subjective assessment answers.
 */
export type ReflectiveGradeBand = 'correct' | 'likely_ok' | 'likely_wrong' | 'wrong';

/**
 * Paragraph within a topic chapter.
 */
export interface ReflectiveParagraphDTO {
  /** Zero-based paragraph index across the topic. */
  readonly index: number;
  /** Optional section heading associated with this paragraph. */
  readonly heading?: string | null;
  /** Cleaned paragraph body text. */
  readonly text: string;
}

/**
 * Request payload to ingest a new topic from Wikipedia, raw text/Markdown, or PDF/EPUB.
 */
export interface IngestTopicInput {
  /** Human-readable topic title. */
  readonly title: string;
  /** Content source category (defaults to `'wikipedia'`). */
  readonly sourceKind?: ReflectiveSourceKind;
  /** Optional Wikipedia query or remote/local URI. */
  readonly queryOrUri?: string;
  /** Optional raw text or Markdown content when `sourceKind` is `'raw_text'` or `'markdown'`. */
  readonly rawContent?: string;
  /** Whether to enable LLM-powered conceptual question & rubric generation. */
  readonly useLlm?: boolean;
}

/**
 * Response returned when an asynchronous topic ingestion job is accepted.
 */
export interface IngestTopicAcceptedDTO {
  /** Assigned topic identifier. */
  readonly topicId: string;
  /** Topic title. */
  readonly title: string;
  /** Source kind used for ingestion. */
  readonly sourceKind: ReflectiveSourceKind;
  /** Current ingestion lifecycle status. */
  readonly status: ReflectiveIngestionStatus;
}

/**
 * Real-time ingestion progress event delivered via Server-Sent Events (SSE).
 */
export interface IngestionProgressEvent {
  /** Target topic identifier. */
  readonly topicId: string;
  /** Current ingestion stage. */
  readonly status: ReflectiveIngestionStatus;
  /** Progress percentage in the range `[0, 100]`. */
  readonly progressPercent: number;
  /** Optional human-readable status message or failure reason. */
  readonly message?: string;
}

/**
 * Summary metadata for a reflective learning topic in the catalog.
 */
export interface ReflectiveTopicSummaryDTO {
  /** Unique topic identifier. */
  readonly id: string;
  /** Display title. */
  readonly title: string;
  /** URL-safe topic slug. */
  readonly slug: string;
  /** Source kind from which the topic was ingested. */
  readonly sourceKind: ReflectiveSourceKind;
  /** Total number of cleaned paragraphs. */
  readonly paragraphCount: number;
  /** Total extracted keywords. */
  readonly keywordCount: number;
  /** Number of teacher-approved keywords. */
  readonly approvedKeywordCount: number;
  /** Current ingestion status. */
  readonly status: ReflectiveIngestionStatus;
  /** ISO-8601 timestamp of last update. */
  readonly updatedAt: string;
}

/**
 * Paginated chapter paragraphs response (10 paragraphs per chapter by default).
 */
export interface TopicChapterPageDTO {
  /** Topic identifier. */
  readonly topicId: string;
  /** 1-based chapter page index. */
  readonly page: number;
  /** Number of paragraphs per chapter page. */
  readonly pageSize: number;
  /** Total paragraphs in the topic. */
  readonly totalParagraphs: number;
  /** Total chapters in the topic. */
  readonly totalChapters: number;
  /** Paragraphs belonging to the requested chapter. */
  readonly paragraphs: ReadonlyArray<ReflectiveParagraphDTO>;
}

/**
 * Extracted domain keyword candidate for a topic.
 */
export interface ReflectiveKeywordDTO {
  /** Unique keyword identifier. */
  readonly id: string;
  /** Canonical keyword or concept term. */
  readonly term: string;
  /** Paragraph indices where the keyword appears. */
  readonly paragraphIndices: ReadonlyArray<number>;
  /** Whether the keyword refers to a person entity. */
  readonly isPerson: boolean;
  /** POS pattern tag (e.g., `'NOUN'`, `'PROPN PROPN'`). */
  readonly posPattern: string;
  /** Corpus frequency count across the topic. */
  readonly frequency: number;
  /** Teacher curation decision (`null` or `undefined` when pending review). */
  readonly approved?: boolean | null;
}

/**
 * Shuffled option item presented in an MCQ quiz question.
 */
export interface ReflectiveMcqOptionDTO {
  /** Option identifier. */
  readonly id: string;
  /** Option display text. */
  readonly text: string;
}

/**
 * Multiple-choice question item delivered in an active MCQ quiz session.
 */
export interface ReflectiveMcqQuestionDTO {
  /** Unique question identifier. */
  readonly id: string;
  /** Source paragraph index. */
  readonly paragraphIndex: number;
  /** Underlying concept/keyword tested. */
  readonly keyword: string;
  /** Question stem or sentence with blank placeholder. */
  readonly prompt: string;
  /** Shuffled 4 options presented to the student. */
  readonly options: ReadonlyArray<ReflectiveMcqOptionDTO>;
}

/**
 * Created MCQ quiz session gated by the student's read chapters.
 */
export interface ReflectiveMcqQuizSessionDTO {
  /** Quiz session identifier. */
  readonly sessionId: string;
  /** Topic identifier. */
  readonly topicId: string;
  /** Maximum paragraph index included in the quiz pool. */
  readonly maxParagraphIndex: number;
  /** Sampled questions with server-shuffled options. */
  readonly questions: ReadonlyArray<ReflectiveMcqQuestionDTO>;
}

/**
 * Student's selected answer for a single MCQ item.
 */
export interface McqAnswerSubmissionItem {
  /** Question identifier. */
  readonly questionId: string;
  /** Selected option text or option identifier. */
  readonly selectedAnswer: string;
}

/**
 * Per-question evaluation breakdown after submitting an MCQ quiz.
 */
export interface McqQuestionEvaluationDTO {
  /** Question identifier. */
  readonly questionId: string;
  /** Question prompt. */
  readonly prompt: string;
  /** Answer selected by the student. */
  readonly selectedAnswer: string;
  /** Canonical correct answer. */
  readonly correctAnswer: string;
  /** Whether the student's selection is correct. */
  readonly isCorrect: boolean;
  /** Optional misconception explanation when a distractor was chosen. */
  readonly explanation?: string;
}

/**
 * Scored MCQ quiz submission summary.
 */
export interface McqQuizSubmissionResultDTO {
  /** Quiz session identifier. */
  readonly sessionId: string;
  /** Number of correct answers. */
  readonly correctCount: number;
  /** Total number of questions in the submission. */
  readonly totalCount: number;
  /** Percentage score in `[0, 100]`. */
  readonly scorePercent: number;
  /** Per-question evaluation details. */
  readonly evaluations: ReadonlyArray<McqQuestionEvaluationDTO>;
}

/**
 * Open-ended subjective question DTO.
 */
export interface ReflectiveSubjectiveQuestionDTO {
  /** Unique subjective question identifier. */
  readonly id: string;
  /** Associated keyword or concept. */
  readonly keyword: string;
  /** Open-ended question prompt (`"What is ...?"`, `"Who is ...?"`, `"Why ...?"`). */
  readonly prompt: string;
  /** Reference source sentences or model answer excerpts. */
  readonly referenceSentences: ReadonlyArray<string>;
  /** Whether the question is approved by a teacher. */
  readonly approved: boolean;
}

/**
 * Semantic grading result for a student's free-text subjective answer.
 */
export interface ReflectiveSubjectiveGradeResultDTO {
  /** Graded subjective question identifier. */
  readonly questionId: string;
  /** Cosine similarity score in `[0.0, 1.0]`. */
  readonly similarityScore: number;
  /** Categorized grade band (`'correct'`, `'likely_ok'`, `'likely_wrong'`, `'wrong'`). */
  readonly band: ReflectiveGradeBand;
  /** Reference definition or model answer. */
  readonly referenceAnswer: string;
  /** Optional actionable rubric or semantic feedback. */
  readonly feedback?: string | null;
}

/**
 * Side-by-side keyword extractor diagnostic comparison for admin debugging.
 */
export interface ExtractorComparisonDTO {
  /** Topic identifier. */
  readonly topicId: string;
  /** Mapping of extractor algorithm name (`'yake'`, `'textrank'`, `'tfidf'`) to extracted terms. */
  readonly extractors: Readonly<Record<string, ReadonlyArray<string>>>;
}

/**
 * Contract for the Reflective Learning domain data-access service (REST + SSE).
 */
export interface IReflectiveLearningService {
  /** Enqueues asynchronous topic ingestion from Wikipedia, Raw Text/Markdown, or PDF/EPUB. */
  ingestTopic(
    input: IngestTopicInput,
  ): Promise<Result<IngestTopicAcceptedDTO, DataAccessError>>;

  /** Subscribes to Server-Sent Events (SSE) ingestion progress updates for a topic. */
  subscribeIngestionEvents(
    topicId: string,
    listener: (event: IngestionProgressEvent) => void,
    onError?: (error: DataAccessError) => void,
  ): Promise<Result<() => void, DataAccessError>>;

  /** Lists or searches reflective learning topics. */
  listTopics(
    query?: QuerySpec<ReflectiveTopicSummaryDTO>,
  ): Promise<Result<PaginatedResult<ReflectiveTopicSummaryDTO>, DataAccessError>>;

  /** Fetches a paginated chapter of paragraphs for a topic. */
  getChapters(
    topicId: string,
    page?: number,
    pageSize?: number,
  ): Promise<Result<TopicChapterPageDTO, DataAccessError>>;

  /** Generates a chapter-gated MCQ quiz session with shuffled options. */
  createMcqQuiz(
    topicId: string,
    maxParagraphIndex: number,
    count?: number,
  ): Promise<Result<ReflectiveMcqQuizSessionDTO, DataAccessError>>;

  /** Submits MCQ quiz answers and returns the scored breakdown. */
  submitMcqQuiz(
    sessionId: string,
    answers: ReadonlyArray<McqAnswerSubmissionItem>,
  ): Promise<Result<McqQuizSubmissionResultDTO, DataAccessError>>;

  /** Lists subjective open-ended questions for a topic. */
  listSubjectiveQuestions(
    topicId: string,
  ): Promise<Result<ReadonlyArray<ReflectiveSubjectiveQuestionDTO>, DataAccessError>>;

  /** Grades a student's free-text answer against a subjective question. */
  gradeSubjectiveAnswer(
    questionId: string,
    userAnswer: string,
  ): Promise<Result<ReflectiveSubjectiveGradeResultDTO, DataAccessError>>;

  /** Lists extracted keywords for teacher curation. */
  listKeywordsForCuration(
    topicId: string,
  ): Promise<Result<ReadonlyArray<ReflectiveKeywordDTO>, DataAccessError>>;

  /** Approves or rejects an extracted keyword during teacher curation. */
  curateKeyword(
    topicId: string,
    keywordId: string,
    approved: boolean,
  ): Promise<Result<ReflectiveKeywordDTO, DataAccessError>>;

  /** Approves or edits a subjective question during teacher curation. */
  curateSubjectiveQuestion(
    topicId: string,
    questionId: string,
    patch: { readonly prompt?: string; readonly approved: boolean },
  ): Promise<Result<ReflectiveSubjectiveQuestionDTO, DataAccessError>>;

  /** Compares keyword extraction algorithms side-by-side for admin diagnostics. */
  compareExtractors(
    topicId: string,
  ): Promise<Result<ExtractorComparisonDTO, DataAccessError>>;
}
