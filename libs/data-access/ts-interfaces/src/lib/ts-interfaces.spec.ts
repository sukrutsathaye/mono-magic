import { err, ok, type Result } from '@mono-magic/utils-ts-core';
import { describe, expect, it } from 'vitest';
import {
  BaseAuthProvider,
  BaseDataRepository,
  BasePaymentProvider,
  BaseRealtimeProvider,
  BaseReflectiveLearningService,
  BaseStorageProvider,
  createDataAccessError,
  type AuthSession,
  type CreatePaymentIntentInput,
  type DataAccessError,
  type ExtractorComparisonDTO,
  type IngestTopicAcceptedDTO,
  type IngestTopicInput,
  type IngestionProgressEvent,
  type McqAnswerSubmissionItem,
  type McqQuizSubmissionResultDTO,
  type OAuthProvider,
  type PaginatedResult,
  type PaymentIntent,
  type PresenceState,
  type QuerySpec,
  type RealtimeEnvelope,
  type ReflectiveKeywordDTO,
  type ReflectiveMcqQuizSessionDTO,
  type ReflectiveSubjectiveGradeResultDTO,
  type ReflectiveSubjectiveQuestionDTO,
  type ReflectiveTopicSummaryDTO,
  type SignInWithEmailInput,
  type SignUpWithEmailInput,
  type SignedUrlOptions,
  type SignedUrlResponse,
  type StorageObjectMeta,
  type TopicChapterPageDTO,
  type UploadOptions,
  type UserClaims,
} from '../index.js';
import {
  expectOk,
  runAuthProviderContractTests,
  runDataRepositoryContractTests,
  runReflectiveLearningServiceContractTests,
  runStorageProviderContractTests,
  type ContractTestEntity,
} from '../testing.js';

class InMemoryRepository extends BaseDataRepository<ContractTestEntity, string> {
  private readonly store = new Map<string, ContractTestEntity>();
  private seq = 0;

  public async findById(id: string): Promise<Result<ContractTestEntity | null, DataAccessError>> {
    return ok(this.store.get(id) ?? null);
  }

  public async findMany(
    query?: QuerySpec<ContractTestEntity>,
  ): Promise<Result<PaginatedResult<ContractTestEntity>, DataAccessError>> {
    let items = [...this.store.values()];
    if (query?.filters) {
      for (const filter of query.filters) {
        if (filter.operator === 'eq') {
          items = items.filter((item) => item[filter.field] === filter.value);
        }
      }
    }
    const limit = query?.limit ?? items.length;
    const sliced = items.slice(0, limit);
    return ok({
      items: sliced,
      total: items.length,
      hasMore: items.length > sliced.length,
    });
  }

  public async create(
    entity: Omit<ContractTestEntity, 'id'> & { readonly id?: string },
  ): Promise<Result<ContractTestEntity, DataAccessError>> {
    this.seq += 1;
    const created: ContractTestEntity = {
      id: entity.id ?? `id-${this.seq}`,
      name: entity.name,
      score: entity.score,
    };
    this.store.set(created.id, created);
    return ok(created);
  }

  public async update(
    id: string,
    patch: Partial<ContractTestEntity>,
  ): Promise<Result<ContractTestEntity, DataAccessError>> {
    const existing = this.store.get(id);
    if (!existing) {
      return err(createDataAccessError('NOT_FOUND', `Missing ${id}`));
    }
    const updated: ContractTestEntity = { ...existing, ...patch, id };
    this.store.set(id, updated);
    return ok(updated);
  }

  public async delete(id: string): Promise<Result<void, DataAccessError>> {
    this.store.delete(id);
    return ok(undefined);
  }
}

class InMemoryAuthProvider extends BaseAuthProvider {
  private readonly users = new Map<string, { password: string; claims: UserClaims }>();
  private readonly listeners = new Set<(session: AuthSession | null) => void>();
  private current: AuthSession | null = null;

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.current);
    }
  }

  public async signUpWithEmail(
    input: SignUpWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>> {
    const claims: UserClaims = {
      userId: `user-${this.users.size + 1}`,
      email: input.email,
      displayName: input.displayName,
      roles: ['member'],
    };
    this.users.set(input.email, { password: input.password, claims });
    this.current = {
      accessToken: `token-${claims.userId}`,
      refreshToken: `refresh-${claims.userId}`,
      expiresAtEpochMs: Date.now() + 3600_000,
      user: claims,
    };
    this.notify();
    return ok(this.current);
  }

  public async signInWithEmail(
    input: SignInWithEmailInput,
  ): Promise<Result<AuthSession, DataAccessError>> {
    const record = this.users.get(input.email);
    if (!record || record.password !== input.password) {
      return err(createDataAccessError('UNAUTHORIZED', 'Invalid credentials'));
    }
    this.current = {
      accessToken: `token-${record.claims.userId}`,
      refreshToken: `refresh-${record.claims.userId}`,
      expiresAtEpochMs: Date.now() + 3600_000,
      user: record.claims,
    };
    this.notify();
    return ok(this.current);
  }

  public async signInWithOAuth(
    provider: OAuthProvider,
  ): Promise<Result<AuthSession, DataAccessError>> {
    const claims: UserClaims = { userId: `oauth-${provider}`, roles: ['member'] };
    this.current = {
      accessToken: `token-${claims.userId}`,
      expiresAtEpochMs: Date.now() + 3600_000,
      user: claims,
    };
    this.notify();
    return ok(this.current);
  }

  public async signOut(): Promise<Result<void, DataAccessError>> {
    this.current = null;
    this.notify();
    return ok(undefined);
  }

  public async getCurrentSession(): Promise<Result<AuthSession | null, DataAccessError>> {
    return ok(this.current);
  }

  public async refreshToken(): Promise<Result<AuthSession, DataAccessError>> {
    if (!this.current) {
      return err(createDataAccessError('UNAUTHORIZED', 'No session'));
    }
    this.current = { ...this.current, accessToken: `${this.current.accessToken}-refreshed` };
    return ok(this.current);
  }

  public async verifyToken(): Promise<Result<UserClaims, DataAccessError>> {
    if (!this.current) {
      return err(createDataAccessError('UNAUTHORIZED', 'Invalid token'));
    }
    return ok(this.current.user);
  }

  public onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

class InMemoryStorageProvider extends BaseStorageProvider {
  private readonly objects = new Map<string, { data: Uint8Array; meta: StorageObjectMeta }>();

  public async upload(
    key: string,
    data: Uint8Array,
    options?: UploadOptions,
  ): Promise<Result<StorageObjectMeta, DataAccessError>> {
    const meta: StorageObjectMeta = {
      key,
      sizeBytes: data.byteLength,
      contentType: options?.contentType ?? 'application/octet-stream',
      updatedAtEpochMs: Date.now(),
      metadata: options?.metadata,
    };
    this.objects.set(key, { data, meta });
    return ok(meta);
  }

  public async download(key: string): Promise<Result<Uint8Array, DataAccessError>> {
    const item = this.objects.get(key);
    return item ? ok(item.data) : err(createDataAccessError('NOT_FOUND', `Missing ${key}`));
  }

  public async getSignedUrl(
    key: string,
    options: SignedUrlOptions,
  ): Promise<Result<SignedUrlResponse, DataAccessError>> {
    return ok({
      url: `https://storage.local/${key}?action=${options.action ?? 'read'}`,
      expiresAtEpochMs: Date.now() + options.expiresInSeconds * 1000,
    });
  }

  public async delete(key: string): Promise<Result<void, DataAccessError>> {
    this.objects.delete(key);
    return ok(undefined);
  }

  public async list(
    prefix = '',
  ): Promise<Result<PaginatedResult<StorageObjectMeta>, DataAccessError>> {
    const items = [...this.objects.values()]
      .map((entry) => entry.meta)
      .filter((meta) => meta.key.startsWith(prefix));
    return ok({ items, total: items.length, hasMore: false });
  }
}

class InMemoryRealtimeProvider extends BaseRealtimeProvider {
  private readonly subs = new Map<string, Set<(msg: RealtimeEnvelope<unknown>) => void>>();

  public async publish<TPayload>(
    channel: string,
    event: string,
    payload: TPayload,
  ): Promise<Result<void, DataAccessError>> {
    const envelope: RealtimeEnvelope<TPayload> = {
      channel,
      event,
      payload,
      sentAtEpochMs: Date.now(),
    };
    for (const listener of this.subs.get(channel) ?? []) {
      listener(envelope);
    }
    return ok(undefined);
  }

  public async subscribe<TPayload>(
    channel: string,
    listener: (message: RealtimeEnvelope<TPayload>) => void,
  ): Promise<Result<() => Promise<void>, DataAccessError>> {
    let bucket = this.subs.get(channel);
    if (!bucket) {
      bucket = new Set();
      this.subs.set(channel, bucket);
    }
    const wrapped = listener as (msg: RealtimeEnvelope<unknown>) => void;
    bucket.add(wrapped);
    return ok(async () => {
      bucket.delete(wrapped);
    });
  }

  public async presence(): Promise<Result<ReadonlyArray<PresenceState>, DataAccessError>> {
    return ok([{ userId: 'u1', status: 'online', updatedAtEpochMs: Date.now() }]);
  }
}

class InMemoryPaymentProvider extends BasePaymentProvider {
  private readonly intents = new Map<string, PaymentIntent>();

  public async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<Result<PaymentIntent, DataAccessError>> {
    const intent: PaymentIntent = {
      id: `pi_${this.intents.size + 1}`,
      amount: input.amount,
      status: 'requires_confirmation',
      metadata: input.metadata,
    };
    this.intents.set(intent.id, intent);
    return ok(intent);
  }

  public async confirmPaymentIntent(
    intentId: string,
  ): Promise<Result<PaymentIntent, DataAccessError>> {
    const intent = this.intents.get(intentId);
    if (!intent) return err(createDataAccessError('NOT_FOUND', 'Missing intent'));
    const updated: PaymentIntent = { ...intent, status: 'succeeded' };
    this.intents.set(intentId, updated);
    return ok(updated);
  }

  public async getPaymentIntent(
    intentId: string,
  ): Promise<Result<PaymentIntent, DataAccessError>> {
    const intent = this.intents.get(intentId);
    return intent ? ok(intent) : err(createDataAccessError('NOT_FOUND', 'Missing intent'));
  }

  public async refundPayment(
    intentId: string,
  ): Promise<Result<PaymentIntent, DataAccessError>> {
    const intent = this.intents.get(intentId);
    if (!intent) return err(createDataAccessError('NOT_FOUND', 'Missing intent'));
    const updated: PaymentIntent = { ...intent, status: 'refunded' };
    this.intents.set(intentId, updated);
    return ok(updated);
  }
}

describe('createDataAccessError', () => {
  it('applies retryable defaults and preserves optional fields', () => {
    const transient = createDataAccessError('RATE_LIMITED', 'slow down', {
      details: { retryAfterMs: 500 },
    });
    const validation = createDataAccessError('VALIDATION', 'invalid', { retryable: false });

    expect(transient.retryable).toBe(true);
    expect(transient.details).toEqual({ retryAfterMs: 500 });
    expect(validation.retryable).toBe(false);
    expect(() => expectOk(err(validation))).toThrow('Expected ok result, got VALIDATION: invalid');
  });
});

runDataRepositoryContractTests(async () => new InMemoryRepository());
runAuthProviderContractTests(async () => new InMemoryAuthProvider());
runStorageProviderContractTests(async () => new InMemoryStorageProvider());

class InMemoryReflectiveLearningService extends BaseReflectiveLearningService {
  public async ingestTopic(
    input: IngestTopicInput,
  ): Promise<Result<IngestTopicAcceptedDTO, DataAccessError>> {
    return ok({
      topicId: 'topic-1',
      title: input.title,
      sourceKind: input.sourceKind ?? 'wikipedia',
      status: 'pending',
    });
  }

  public async subscribeIngestionEvents(
    topicId: string,
    listener: (event: IngestionProgressEvent) => void,
  ): Promise<Result<() => void, DataAccessError>> {
    listener({ topicId, status: 'ready', progressPercent: 100 });
    return ok(() => undefined);
  }

  public async listTopics(): Promise<
    Result<PaginatedResult<ReflectiveTopicSummaryDTO>, DataAccessError>
  > {
    return ok({
      items: [
        {
          id: 'topic-1',
          title: 'Black Hole',
          slug: 'black-hole',
          sourceKind: 'wikipedia',
          paragraphCount: 10,
          keywordCount: 5,
          approvedKeywordCount: 3,
          status: 'ready',
          updatedAt: new Date(0).toISOString(),
        },
      ],
      total: 1,
      hasMore: false,
    });
  }

  public async getChapters(
    topicId: string,
    page = 1,
    pageSize = 10,
  ): Promise<Result<TopicChapterPageDTO, DataAccessError>> {
    return ok({
      topicId,
      page,
      pageSize,
      totalParagraphs: 1,
      totalChapters: 1,
      paragraphs: [{ index: 0, heading: 'Intro', text: 'A black hole is a region of spacetime.' }],
    });
  }

  public async createMcqQuiz(
    topicId: string,
    maxParagraphIndex: number,
  ): Promise<Result<ReflectiveMcqQuizSessionDTO, DataAccessError>> {
    return ok({
      sessionId: 'sess-1',
      topicId,
      maxParagraphIndex,
      questions: [
        {
          id: 'q-1',
          paragraphIndex: 0,
          keyword: 'spacetime',
          prompt: 'A black hole is a region of ____.',
          options: [
            { id: 'opt-1', text: 'spacetime' },
            { id: 'opt-2', text: 'vacuum' },
            { id: 'opt-3', text: 'plasma' },
            { id: 'opt-4', text: 'nebula' },
          ],
        },
      ],
    });
  }

  public async submitMcqQuiz(
    sessionId: string,
    answers: ReadonlyArray<McqAnswerSubmissionItem>,
  ): Promise<Result<McqQuizSubmissionResultDTO, DataAccessError>> {
    return ok({
      sessionId,
      correctCount: answers.length,
      totalCount: answers.length,
      scorePercent: 100,
      evaluations: answers.map((a) => ({
        questionId: a.questionId,
        prompt: 'A black hole is a region of ____.',
        selectedAnswer: a.selectedAnswer,
        correctAnswer: 'spacetime',
        isCorrect: true,
      })),
    });
  }

  public async listSubjectiveQuestions(): Promise<
    Result<ReadonlyArray<ReflectiveSubjectiveQuestionDTO>, DataAccessError>
  > {
    return ok([
      {
        id: 'sq-1',
        keyword: 'black hole',
        prompt: 'What is a black hole?',
        referenceSentences: ['A black hole is a region of spacetime.'],
        approved: true,
      },
    ]);
  }

  public async gradeSubjectiveAnswer(
    questionId: string,
  ): Promise<Result<ReflectiveSubjectiveGradeResultDTO, DataAccessError>> {
    return ok({
      questionId,
      similarityScore: 0.9,
      band: 'correct',
      referenceAnswer: 'A black hole is a region of spacetime.',
    });
  }

  public async listKeywordsForCuration(): Promise<
    Result<ReadonlyArray<ReflectiveKeywordDTO>, DataAccessError>
  > {
    return ok([
      {
        id: 'kw-1',
        term: 'spacetime',
        paragraphIndices: [0],
        isPerson: false,
        posPattern: 'NOUN',
        frequency: 2,
        approved: null,
      },
    ]);
  }

  public async curateKeyword(
    _topicId: string,
    keywordId: string,
    approved: boolean,
  ): Promise<Result<ReflectiveKeywordDTO, DataAccessError>> {
    return ok({
      id: keywordId,
      term: 'spacetime',
      paragraphIndices: [0],
      isPerson: false,
      posPattern: 'NOUN',
      frequency: 2,
      approved,
    });
  }

  public async curateSubjectiveQuestion(
    _topicId: string,
    questionId: string,
    patch: { readonly prompt?: string; readonly approved: boolean },
  ): Promise<Result<ReflectiveSubjectiveQuestionDTO, DataAccessError>> {
    return ok({
      id: questionId,
      keyword: 'black hole',
      prompt: patch.prompt ?? 'What is a black hole?',
      referenceSentences: ['A black hole is a region of spacetime.'],
      approved: patch.approved,
    });
  }

  public async compareExtractors(
    topicId: string,
  ): Promise<Result<ExtractorComparisonDTO, DataAccessError>> {
    return ok({
      topicId,
      extractors: {
        yake: ['spacetime'],
        textrank: ['spacetime'],
      },
    });
  }
}

runReflectiveLearningServiceContractTests(async () => new InMemoryReflectiveLearningService());

describe('Realtime and Payment Base Providers', () => {
  it('supports publish/subscribe/presence on BaseRealtimeProvider', async () => {
    const rt = new InMemoryRealtimeProvider();
    const received: string[] = [];
    const sub = await rt.subscribe<{ text: string }>('room-1', (msg) =>
      received.push(msg.payload.text),
    );
    expect(sub.ok).toBe(true);

    await rt.publish('room-1', 'chat', { text: 'hi' });
    expect(received).toEqual(['hi']);

    const presence = await rt.presence();
    expect(presence.ok).toBe(true);
    if (sub.ok) await sub.value();
  });

  it('supports create/confirm/get/refund on BasePaymentProvider', async () => {
    const payments = new InMemoryPaymentProvider();
    const created = await payments.createPaymentIntent({
      amount: { amountMinor: 1999, currency: 'USD' },
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const confirmed = await payments.confirmPaymentIntent(created.value.id);
    expect(confirmed.ok && confirmed.value.status).toBe('succeeded');

    const fetched = await payments.getPaymentIntent(created.value.id);
    expect(fetched.ok && fetched.value.id).toBe(created.value.id);

    const refunded = await payments.refundPayment(created.value.id);
    expect(refunded.ok && refunded.value.status).toBe('refunded');
  });
});
