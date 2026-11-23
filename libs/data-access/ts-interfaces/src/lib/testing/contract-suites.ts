import type { Result } from '@mono-magic/utils-ts-core';
import { describe, expect, it } from 'vitest';
import type { IAuthProvider } from '../auth/auth.interface.js';
import type { DataAccessError } from '../common/query.interface.js';
import type { IDataRepository } from '../repository/repository.interface.js';
import type { IStorageProvider } from '../storage/storage.interface.js';
import type { IReflectiveLearningService } from '../reflective/reflective-learning.interface.js';


/**
 * Base entity shape required by {@link runDataRepositoryContractTests}.
 */
export interface ContractTestEntity {
  readonly id: string;
  readonly name: string;
  readonly score: number;
}

/**
 * Unwraps a {@link Result} in contract tests, failing with a descriptive error if `ok` is `false`.
 */
export function expectOk<T>(result: Result<T, DataAccessError>): T {
  if (!result.ok) {
    throw new Error(`Expected ok result, got ${result.error.code}: ${result.error.message}`);
  }
  return result.value;
}

/**
 * Shared Liskov Substitution compliance suite for {@link IDataRepository} adapters.
 */
export function runDataRepositoryContractTests(
  createRepository: () => Promise<IDataRepository<ContractTestEntity, string>>,
): void {
  describe('IDataRepository Contract Compliance', () => {
    it('performs create, findById, update, findMany, transaction, and delete', async () => {
      const repo = await createRepository();

      const created = expectOk(await repo.create({ name: 'Alpha', score: 10 }));
      const found = expectOk(await repo.findById(created.id));
      expect(found).toEqual(created);

      const updated = expectOk(await repo.update(created.id, { score: 25 }));
      expect(updated.score).toBe(25);

      const listed = expectOk(
        await repo.findMany({
          filters: [{ field: 'name', operator: 'eq', value: 'Alpha' }],
          limit: 10,
        }),
      );
      expect(listed.items.length).toBeGreaterThanOrEqual(1);

      const txResult = expectOk(
        await repo.transaction(async (txRepo) => txRepo.findById(created.id)),
      );
      expect(txResult).toEqual(updated);

      expectOk(await repo.delete(created.id));

      const missing = expectOk(await repo.findById(created.id));
      expect(missing).toBeNull();
    });
  });
}

/**
 * Shared Liskov Substitution compliance suite for {@link IAuthProvider} adapters.
 */
export function runAuthProviderContractTests(
  createAuthProvider: () => Promise<IAuthProvider>,
): void {
  describe('IAuthProvider Contract Compliance', () => {
    it('supports signUp, signIn, getCurrentSession, verifyToken, refreshToken, and signOut', async () => {
      const auth = await createAuthProvider();
      const events: Array<unknown> = [];
      const unsubscribe = auth.onAuthStateChanged((session) => {
        events.push(session);
      });

      const signedUp = expectOk(
        await auth.signUpWithEmail({
          email: 'contract@example.com',
          password: 'StrongPassword123!',
          displayName: 'Contract User',
        }),
      );

      const session = expectOk(await auth.getCurrentSession());
      expect(session?.user.email).toBe('contract@example.com');

      const verified = expectOk(await auth.verifyToken(signedUp.accessToken));
      expect(verified.email).toBe('contract@example.com');

      const refreshed = expectOk(await auth.refreshToken(signedUp.refreshToken));
      expect(refreshed.accessToken).toBeTruthy();

      expectOk(await auth.signOut());

      const afterOut = expectOk(await auth.getCurrentSession());
      expect(afterOut).toBeNull();

      const signedIn = expectOk(
        await auth.signInWithEmail({
          email: 'contract@example.com',
          password: 'StrongPassword123!',
        }),
      );
      expect(signedIn.user.email).toBe('contract@example.com');

      unsubscribe();
      expect(events.length).toBeGreaterThanOrEqual(1);
    });
  });
}

/**
 * Shared Liskov Substitution compliance suite for {@link IStorageProvider} adapters.
 */
export function runStorageProviderContractTests(
  createStorageProvider: () => Promise<IStorageProvider>,
): void {
  describe('IStorageProvider Contract Compliance', () => {
    it('supports upload, download, getSignedUrl, list, and delete', async () => {
      const storage = await createStorageProvider();
      const key = 'contracts/sample.txt';
      const payload = new TextEncoder().encode('hello contract');

      const uploaded = expectOk(
        await storage.upload(key, payload, { contentType: 'text/plain' }),
      );
      expect(uploaded.key).toBe(key);

      const downloaded = expectOk(await storage.download(key));
      expect(new TextDecoder().decode(downloaded)).toBe('hello contract');

      const signedUrl = expectOk(
        await storage.getSignedUrl(key, { expiresInSeconds: 60, action: 'read' }),
      );
      expect(signedUrl.url).toContain(key);

      const listed = expectOk(await storage.list('contracts/'));
      expect(listed.items.some((item) => item.key === key)).toBe(true);

      expectOk(await storage.delete(key));
    });
  });
}

/**
 * Shared Liskov Substitution compliance suite for {@link IReflectiveLearningService} adapters.
 */
export function runReflectiveLearningServiceContractTests(
  createService: () => Promise<IReflectiveLearningService>,
): void {
  describe('IReflectiveLearningService Contract Compliance', () => {
    it('supports topic ingestion, SSE events, chapters, MCQ & subjective quizzes, curation, and diagnostics', async () => {
      const service = await createService();

      const accepted = expectOk(
        await service.ingestTopic({
          title: 'Black Hole',
          sourceKind: 'wikipedia',
        }),
      );
      expect(accepted.topicId).toBeTruthy();

      const events: string[] = [];
      const unsubscribe = expectOk(
        await service.subscribeIngestionEvents(accepted.topicId, (ev) => {
          events.push(ev.status);
        }),
      );
      unsubscribe();
      expect(events.length).toBeGreaterThanOrEqual(1);

      const topics = expectOk(await service.listTopics({ limit: 10 }));
      expect(topics.items.length).toBeGreaterThanOrEqual(1);

      const chapter = expectOk(await service.getChapters(accepted.topicId, 1, 10));
      expect(chapter.topicId).toBe(accepted.topicId);
      expect(chapter.paragraphs.length).toBeGreaterThanOrEqual(1);

      const quiz = expectOk(await service.createMcqQuiz(accepted.topicId, 9, 2));
      expect(quiz.questions.length).toBeGreaterThanOrEqual(1);

      const firstQuestion = quiz.questions[0];
      const submission = expectOk(
        await service.submitMcqQuiz(quiz.sessionId, [
          {
            questionId: firstQuestion.id,
            selectedAnswer: firstQuestion.options[0]?.text ?? '',
          },
        ]),
      );
      expect(submission.totalCount).toBe(1);

      const subjQuestions = expectOk(await service.listSubjectiveQuestions(accepted.topicId));
      expect(subjQuestions.length).toBeGreaterThanOrEqual(1);

      const graded = expectOk(
        await service.gradeSubjectiveAnswer(
          subjQuestions[0].id,
          'A black hole is a region of spacetime where gravity prevents anything from escaping.',
        ),
      );
      expect(graded.questionId).toBe(subjQuestions[0].id);
      expect(graded.similarityScore).toBeGreaterThanOrEqual(0);

      const keywords = expectOk(await service.listKeywordsForCuration(accepted.topicId));
      expect(keywords.length).toBeGreaterThanOrEqual(1);

      const curatedKw = expectOk(
        await service.curateKeyword(accepted.topicId, keywords[0].id, true),
      );
      expect(curatedKw.approved).toBe(true);

      const curatedSq = expectOk(
        await service.curateSubjectiveQuestion(accepted.topicId, subjQuestions[0].id, {
          prompt: 'What is a Black Hole?',
          approved: true,
        }),
      );
      expect(curatedSq.approved).toBe(true);

      const comparison = expectOk(await service.compareExtractors(accepted.topicId));
      expect(comparison.topicId).toBe(accepted.topicId);
    });
  });
}

