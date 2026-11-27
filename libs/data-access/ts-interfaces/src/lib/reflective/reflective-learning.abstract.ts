import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError, PaginatedResult, QuerySpec } from '../common/query.interface.js';
import type {
  ExtractorComparisonDTO,
  IngestTopicAcceptedDTO,
  IngestTopicInput,
  IngestionProgressEvent,
  IReflectiveLearningService,
  McqAnswerSubmissionItem,
  McqQuizSubmissionResultDTO,
  ReflectiveKeywordDTO,
  ReflectiveMcqQuizSessionDTO,
  ReflectiveSubjectiveGradeResultDTO,
  ReflectiveSubjectiveQuestionDTO,
  ReflectiveTopicSummaryDTO,
  TopicChapterPageDTO,
} from './reflective-learning.interface.js';

/**
 * Abstract base class for {@link IReflectiveLearningService} implementations.
 */
export abstract class BaseReflectiveLearningService implements IReflectiveLearningService {
  public abstract ingestTopic(
    input: IngestTopicInput,
  ): Promise<Result<IngestTopicAcceptedDTO, DataAccessError>>;

  public abstract subscribeIngestionEvents(
    topicId: string,
    listener: (event: IngestionProgressEvent) => void,
    onError?: (error: DataAccessError) => void,
  ): Promise<Result<() => void, DataAccessError>>;

  public abstract listTopics(
    query?: QuerySpec<ReflectiveTopicSummaryDTO>,
  ): Promise<Result<PaginatedResult<ReflectiveTopicSummaryDTO>, DataAccessError>>;

  public abstract getChapters(
    topicId: string,
    page?: number,
    pageSize?: number,
  ): Promise<Result<TopicChapterPageDTO, DataAccessError>>;

  public abstract createMcqQuiz(
    topicId: string,
    maxParagraphIndex: number,
    count?: number,
  ): Promise<Result<ReflectiveMcqQuizSessionDTO, DataAccessError>>;

  public abstract submitMcqQuiz(
    sessionId: string,
    answers: ReadonlyArray<McqAnswerSubmissionItem>,
  ): Promise<Result<McqQuizSubmissionResultDTO, DataAccessError>>;

  public abstract listSubjectiveQuestions(
    topicId: string,
  ): Promise<Result<ReadonlyArray<ReflectiveSubjectiveQuestionDTO>, DataAccessError>>;

  public abstract gradeSubjectiveAnswer(
    questionId: string,
    userAnswer: string,
  ): Promise<Result<ReflectiveSubjectiveGradeResultDTO, DataAccessError>>;

  public abstract listKeywordsForCuration(
    topicId: string,
  ): Promise<Result<ReadonlyArray<ReflectiveKeywordDTO>, DataAccessError>>;

  public abstract curateKeyword(
    topicId: string,
    keywordId: string,
    approved: boolean,
  ): Promise<Result<ReflectiveKeywordDTO, DataAccessError>>;

  public abstract curateSubjectiveQuestion(
    topicId: string,
    questionId: string,
    patch: { readonly prompt?: string; readonly approved: boolean },
  ): Promise<Result<ReflectiveSubjectiveQuestionDTO, DataAccessError>>;

  public abstract compareExtractors(
    topicId: string,
  ): Promise<Result<ExtractorComparisonDTO, DataAccessError>>;
}
