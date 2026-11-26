import { create, fromBinary, fromJson, toBinary, toJson } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';
import { aiPb, cachePb, reflectivePb } from '../../proto.js';

describe('Generated Protobuf wire contracts (@mono-magic/data-access-ts-interfaces/proto)', () => {
  it('round-trips CacheEntry over binary and JSON encodings', () => {
    const entry = create(cachePb.CacheEntrySchema, {
      key: 'session:42',
      value: '{"ok":true}',
      ttlSeconds: BigInt(300),
      createdAt: '2026-11-25T00:00:00Z',
    });

    const decoded = fromBinary(cachePb.CacheEntrySchema, toBinary(cachePb.CacheEntrySchema, entry));
    expect(decoded.key).toBe('session:42');
    expect(decoded.ttlSeconds).toBe(BigInt(300));

    const json = toJson(cachePb.CacheEntrySchema, entry);
    const fromJsonEntry = fromJson(cachePb.CacheEntrySchema, json);
    expect(fromJsonEntry.value).toBe('{"ok":true}');
  });

  it('round-trips LLMCompletionRequest and TopicRecord', () => {
    const req = create(aiPb.LLMCompletionRequestSchema, {
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      maxTokens: 512,
      messages: [
        create(aiPb.ChatMessageSchema, {
          role: aiPb.ChatRole.USER,
          content: 'Summarize SOLID principles.',
        }),
      ],
    });
    const decodedReq = fromBinary(
      aiPb.LLMCompletionRequestSchema,
      toBinary(aiPb.LLMCompletionRequestSchema, req),
    );
    expect(decodedReq.model).toBe('gemini-2.5-flash');
    expect(decodedReq.messages[0]?.role).toBe(aiPb.ChatRole.USER);

    const topic = create(reflectivePb.TopicRecordSchema, {
      id: 'topic-1',
      title: 'Distributed Systems',
      sourceType: reflectivePb.ContentSourceType.WIKIPEDIA,
      chapterCount: 4,
      keywords: ['consensus', 'raft'],
    });
    const decodedTopic = fromBinary(
      reflectivePb.TopicRecordSchema,
      toBinary(reflectivePb.TopicRecordSchema, topic),
    );
    expect(decodedTopic.sourceType).toBe(reflectivePb.ContentSourceType.WIKIPEDIA);
    expect(decodedTopic.keywords).toEqual(['consensus', 'raft']);
  });
});
