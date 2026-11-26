"""Unit tests verifying generated Python Protobuf wire contracts in py-interfaces."""

from __future__ import annotations

from py_data_access_interfaces.proto import ai_pb2, cache_pb2, reflective_pb2


def test_cache_entry_round_trip() -> None:
    """CacheEntry serializes and deserializes cleanly over Protobuf wire bytes."""
    entry = cache_pb2.CacheEntry(
        key="session:99",
        value='{"active":true}',
        ttl_seconds=600,
        created_at="2026-11-25T00:00:00Z",
    )
    decoded = cache_pb2.CacheEntry()
    decoded.ParseFromString(entry.SerializeToString())

    assert decoded.key == "session:99"
    assert decoded.ttl_seconds == 600
    assert decoded.value == '{"active":true}'


def test_ai_and_reflective_round_trip() -> None:
    """LLMCompletionRequest and TopicRecord round-trip cleanly via generated stubs."""
    req = ai_pb2.LLMCompletionRequest(
        model="gemini-2.5-flash",
        temperature=0.1,
        max_tokens=256,
        messages=[
            ai_pb2.ChatMessage(
                role=ai_pb2.CHAT_ROLE_USER,
                content="Explain Dependency Inversion.",
            )
        ],
    )
    decoded_req = ai_pb2.LLMCompletionRequest()
    decoded_req.ParseFromString(req.SerializeToString())
    assert decoded_req.model == "gemini-2.5-flash"
    assert decoded_req.messages[0].role == ai_pb2.CHAT_ROLE_USER

    topic = reflective_pb2.TopicRecord(
        id="topic-42",
        title="Reinforcement Learning",
        source_type=reflective_pb2.CONTENT_SOURCE_TYPE_WIKIPEDIA,
        chapter_count=3,
        keywords=["bellman", "policy"],
    )
    decoded_topic = reflective_pb2.TopicRecord()
    decoded_topic.ParseFromString(topic.SerializeToString())
    assert decoded_topic.source_type == reflective_pb2.CONTENT_SOURCE_TYPE_WIKIPEDIA
    assert list(decoded_topic.keywords) == ["bellman", "policy"]
