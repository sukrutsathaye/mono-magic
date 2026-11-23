import { createDataAccessError } from '@mono-magic/data-access-ts-interfaces';
import {
  expectOk,
  runReflectiveLearningServiceContractTests,
} from '@mono-magic/data-access-ts-interfaces/testing';
import { AppError } from '@mono-magic/utils-ts-core';
import { describe, expect, it } from 'vitest';
import {
  ReflectiveLearningApiClient,
  createInMemoryReflectiveTransport,
  extractErrorMessageFromBody,
  isDataAccessError,
  mapHttpStatusToErrorCode,
  normalizeReflectiveApiError,
} from '../index.js';

runReflectiveLearningServiceContractTests(async () => {
  const transport = createInMemoryReflectiveTransport();
  const client = new ReflectiveLearningApiClient({
    baseUrl: 'http://localhost:8000',
    fetchFn: transport.fetchFn,
    eventSourceFactory: transport.eventSourceFactory,
    retryOptions: { maxAttempts: 2, baseDelayMs: 1, jitter: false },
  });
  return client;
});

describe('ReflectiveLearningApiClient', () => {
  it('retries transient HTTP 503 / 429 failures using retryWithBackoff and succeeds', async () => {
    const transport = createInMemoryReflectiveTransport();
    transport.queueFailureResponse(503, { detail: 'Worker warming up' }, 2);

    const client = new ReflectiveLearningApiClient({
      baseUrl: 'http://localhost:8000/',
      apiPrefix: '/api/v1/',
      getAuthToken: async () => 'jwt-token-123',
      defaultHeaders: { 'X-Client': 'mono-magic-spec' },
      fetchFn: transport.fetchFn,
      eventSourceFactory: transport.eventSourceFactory,
      retryOptions: { maxAttempts: 3, baseDelayMs: 1, jitter: false },
    });

    const topics = expectOk(
      await client.listTopics({
        filters: [
          { field: 'title', operator: 'contains', value: 'Black' },
          { field: 'status', operator: 'eq', value: 'ready' },
        ],
        sort: [{ field: 'title', direction: 'asc' }],
        limit: 5,
        offset: 0,
      }),
    );

    expect(topics.items).toHaveLength(1);
    expect(topics.items[0]?.title).toBe('Black Hole');
  });

  it('does not retry non-retryable HTTP 404 or 422 errors and normalizes DataAccessError codes', async () => {
    const transport = createInMemoryReflectiveTransport();
    const client = new ReflectiveLearningApiClient({
      baseUrl: 'http://localhost:8000',
      fetchFn: transport.fetchFn,
      retryOptions: { maxAttempts: 3, baseDelayMs: 1, jitter: false },
    });

    const missingChapter = await client.getChapters('non-existent-topic', 1, 10);
    expect(missingChapter.ok).toBe(false);
    if (!missingChapter.ok) {
      expect(missingChapter.error.code).toBe('NOT_FOUND');
      expect(missingChapter.error.retryable).toBe(false);
    }

    transport.queueFailureResponse(401, { message: 'Invalid token' }, 1);
    const unauthorized = await client.listTopics();
    expect(unauthorized.ok).toBe(false);
    if (!unauthorized.ok) {
      expect(unauthorized.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('validates input arguments locally before issuing network requests', async () => {
    const transport = createInMemoryReflectiveTransport();
    const client = new ReflectiveLearningApiClient({
      baseUrl: 'http://localhost:8000',
      fetchFn: transport.fetchFn,
    });

    const emptyIngest = await client.ingestTopic({ title: '   ' });
    expect(!emptyIngest.ok && emptyIngest.error.code).toBe('VALIDATION');

    const emptySseTopic = await client.subscribeIngestionEvents('  ', () => undefined);
    expect(!emptySseTopic.ok && emptySseTopic.error.code).toBe('VALIDATION');

    const noSseFactory = await client.subscribeIngestionEvents('topic-seed', () => undefined);
    expect(!noSseFactory.ok && noSseFactory.error.code).toBe('UNAVAILABLE');

    const badChaptersTopic = await client.getChapters('', 1, 10);
    expect(!badChaptersTopic.ok && badChaptersTopic.error.code).toBe('VALIDATION');

    const badChaptersPage = await client.getChapters('topic-seed', 0, 10);
    expect(!badChaptersPage.ok && badChaptersPage.error.code).toBe('VALIDATION');

    const badMcqTopic = await client.createMcqQuiz('', 5, 3);
    expect(!badMcqTopic.ok && badMcqTopic.error.code).toBe('VALIDATION');

    const badMcqCount = await client.createMcqQuiz('topic-seed', -1, 0);
    expect(!badMcqCount.ok && badMcqCount.error.code).toBe('VALIDATION');

    const badSubmitId = await client.submitMcqQuiz('  ', [
      { questionId: 'q1', selectedAnswer: 'a' },
    ]);
    expect(!badSubmitId.ok && badSubmitId.error.code).toBe('VALIDATION');

    const emptySubmit = await client.submitMcqQuiz('sess-1', []);
    expect(!emptySubmit.ok && emptySubmit.error.code).toBe('VALIDATION');

    const badSubjList = await client.listSubjectiveQuestions('');
    expect(!badSubjList.ok && badSubjList.error.code).toBe('VALIDATION');

    const badGradeQid = await client.gradeSubjectiveAnswer('', 'answer');
    expect(!badGradeQid.ok && badGradeQid.error.code).toBe('VALIDATION');

    const badGradeAns = await client.gradeSubjectiveAnswer('sq-1', '   ');
    expect(!badGradeAns.ok && badGradeAns.error.code).toBe('VALIDATION');

    const badKwList = await client.listKeywordsForCuration(' ');
    expect(!badKwList.ok && badKwList.error.code).toBe('VALIDATION');

    const badKwCurate = await client.curateKeyword('topic-seed', '', true);
    expect(!badKwCurate.ok && badKwCurate.error.code).toBe('VALIDATION');

    const badSqCurate = await client.curateSubjectiveQuestion('', 'sq-1', { approved: true });
    expect(!badSqCurate.ok && badSqCurate.error.code).toBe('VALIDATION');

    const badCompare = await client.compareExtractors(' ');
    expect(!badCompare.ok && badCompare.error.code).toBe('VALIDATION');
  });

  it('streams SSE events and reports malformed JSON and stream errors via onError', async () => {
    const transport = createInMemoryReflectiveTransport();
    const client = new ReflectiveLearningApiClient({
      baseUrl: 'http://localhost:8000',
      fetchFn: transport.fetchFn,
      eventSourceFactory: transport.eventSourceFactory,
    });

    const received: string[] = [];
    const errors: string[] = [];

    const unsubscribe = expectOk(
      await client.subscribeIngestionEvents(
        'topic-seed',
        (event) => received.push(`${event.status}:${event.progressPercent}`),
        (error) => errors.push(error.code),
      ),
    );

    transport.emitIngestionEvent({
      topicId: 'topic-seed',
      status: 'extracting',
      progressPercent: 50,
    });
    transport.emitRawSseData('topic-seed', '{malformed-json');
    transport.emitSseError('topic-seed', new Error('SSE socket reset'));

    expect(received).toContain('extracting:50');
    expect(errors).toEqual(['INTERNAL', 'UNAVAILABLE']);

    unsubscribe();
  });

  it('handles non-JSON text error bodies and wrong MCQ answers with explanations', async () => {
    const transport = createInMemoryReflectiveTransport();
    const client = new ReflectiveLearningApiClient({
      baseUrl: 'http://localhost:8000',
      fetchFn: transport.fetchFn,
      retryOptions: { maxAttempts: 1 },
    });

    const session = expectOk(await client.createMcqQuiz('topic-seed', 9, 1));
    const wrongResult = expectOk(
      await client.submitMcqQuiz(session.sessionId, [
        { questionId: session.questions[0].id, selectedAnswer: 'nebula' },
      ]),
    );
    expect(wrongResult.correctCount).toBe(0);
    expect(wrongResult.evaluations[0]?.isCorrect).toBe(false);
    expect(wrongResult.evaluations[0]?.explanation).toContain('Spacetime');

    const lowGrade = expectOk(
      await client.gradeSubjectiveAnswer('topic-seed-sq-1', 'unrelated answer'),
    );
    expect(lowGrade.band).toBe('likely_wrong');
  });

  it('normalizes HTTP status codes, error payloads, and runtime exceptions', () => {
    expect(mapHttpStatusToErrorCode(400)).toBe('VALIDATION');
    expect(mapHttpStatusToErrorCode(422)).toBe('VALIDATION');
    expect(mapHttpStatusToErrorCode(401)).toBe('UNAUTHORIZED');
    expect(mapHttpStatusToErrorCode(403)).toBe('FORBIDDEN');
    expect(mapHttpStatusToErrorCode(404)).toBe('NOT_FOUND');
    expect(mapHttpStatusToErrorCode(408)).toBe('TIMEOUT');
    expect(mapHttpStatusToErrorCode(504)).toBe('TIMEOUT');
    expect(mapHttpStatusToErrorCode(409)).toBe('CONFLICT');
    expect(mapHttpStatusToErrorCode(429)).toBe('RATE_LIMITED');
    expect(mapHttpStatusToErrorCode(502)).toBe('UNAVAILABLE');
    expect(mapHttpStatusToErrorCode(503)).toBe('UNAVAILABLE');
    expect(mapHttpStatusToErrorCode(500)).toBe('UNAVAILABLE');
    expect(mapHttpStatusToErrorCode(418)).toBe('INTERNAL');

    expect(extractErrorMessageFromBody({ message: 'msg' }, 'fb').message).toBe('msg');
    expect(extractErrorMessageFromBody({ detail: 'dtl' }, 'fb').message).toBe('dtl');
    expect(extractErrorMessageFromBody({ error: 'err' }, 'fb').message).toBe('err');
    expect(extractErrorMessageFromBody({ other: 1 }, 'fb').message).toBe('fb');
    expect(extractErrorMessageFromBody('raw text error', 'fb').message).toBe('raw text error');
    expect(extractErrorMessageFromBody(null, 'fb').message).toBe('fb');

    const existing = createDataAccessError('CONFLICT', 'already exists');
    expect(isDataAccessError(existing)).toBe(true);
    expect(isDataAccessError(null)).toBe(false);
    expect(normalizeReflectiveApiError(existing)).toBe(existing);

    const appErr = new AppError('rate limited', { code: 'RATE_LIMITED', retryable: true });
    expect(normalizeReflectiveApiError(appErr).code).toBe('RATE_LIMITED');

    const timeoutErr = new Error('Request timed out');
    timeoutErr.name = 'TimeoutError';
    expect(normalizeReflectiveApiError(timeoutErr).code).toBe('TIMEOUT');

    const netErr = new Error('ECONNREFUSED');
    expect(normalizeReflectiveApiError(netErr).code).toBe('UNAVAILABLE');

    expect(normalizeReflectiveApiError('opaque string').code).toBe('INTERNAL');
  });
});
