"""ContentSourceProvider implementations for Wikipedia, Markdown/Raw Text, and PDF/EPUB books."""

from __future__ import annotations

import asyncio
import re
from pathlib import Path
from typing import Any

import httpx
from py_data_access_interfaces import DataAccessError, Err, ErrorCode, Result, err, ok
from py_utils_nlp import clean_text, split_paragraphs

from .protocols import ContentSourceProvider, DocumentParserAdapter
from .schemas import ContentSourceRequest, ParagraphDTO, SourceKind

_WIKI_HEADING_RE = re.compile(r"^(={2,6})\s*(.+?)\s*\1$")
_MD_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


class WikipediaApiSource:
    """Async MediaWiki Action API content source provider replacing legacy HTML scraping."""

    BASE_URL = "https://en.wikipedia.org/w/api.php"

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        """Initialize with an injectable ``httpx.AsyncClient``."""
        self._client = client

    @property
    def supported_kinds(self) -> tuple[SourceKind, ...]:
        """Return ``(SourceKind.WIKIPEDIA,)``."""
        return (SourceKind.WIKIPEDIA,)

    async def _request_extract(self, topic: str) -> Result[str, DataAccessError]:
        params = {
            "action": "query",
            "prop": "extracts",
            "explaintext": "1",
            "redirects": "1",
            "titles": topic,
            "format": "json",
            "formatversion": "2",
        }
        headers = {"User-Agent": "ReflectiveLearningApp/2.0 (mono-magic)"}
        try:
            if self._client is not None:
                resp = await self._client.get(
                    self.BASE_URL,
                    params=params,
                    headers=headers,
                    timeout=15.0,
                )
            else:
                async with httpx.AsyncClient(timeout=15.0) as temp_client:
                    resp = await temp_client.get(
                        self.BASE_URL,
                        params=params,
                        headers=headers,
                    )

            if resp.status_code == 429:
                return err(
                    DataAccessError(
                        code=ErrorCode.RATE_LIMITED,
                        message="Wikipedia API rate limit exceeded.",
                        retryable=True,
                        provider="wikipedia",
                    )
                )
            if resp.status_code >= 500:
                return err(
                    DataAccessError(
                        code=ErrorCode.UNAVAILABLE,
                        message=f"Wikipedia API error: HTTP {resp.status_code}",
                        retryable=True,
                        provider="wikipedia",
                    )
                )
            resp.raise_for_status()
            payload: dict[str, Any] = resp.json()
        except httpx.TimeoutException as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.TIMEOUT,
                    message=f"Wikipedia API request timed out for {topic!r}.",
                    retryable=True,
                    provider="wikipedia",
                    cause=str(exc),
                )
            )
        except httpx.HTTPError as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.UNAVAILABLE,
                    message=f"Wikipedia HTTP transport error: {exc}",
                    retryable=True,
                    provider="wikipedia",
                    cause=str(exc),
                )
            )

        pages: list[dict[str, Any]] = payload.get("query", {}).get("pages", [])
        if not pages or pages[0].get("missing"):
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"Topic not found on Wikipedia: {topic!r}",
                    retryable=False,
                    provider="wikipedia",
                )
            )
        extract = str(pages[0].get("extract", "")).strip()
        if not extract:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"Empty Wikipedia extract for {topic!r}",
                    retryable=False,
                    provider="wikipedia",
                )
            )
        return ok(extract)

    async def fetch_paragraphs(
        self,
        source: ContentSourceRequest,
    ) -> Result[list[ParagraphDTO], DataAccessError]:
        """Fetch and segment paragraphs from Wikipedia's MediaWiki Action API."""
        if source.kind not in self.supported_kinds:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message=f"Unsupported source kind {source.kind} for WikipediaApiSource.",
                    provider="wikipedia",
                )
            )
        topic = (source.query_or_uri or source.title).strip()
        if not topic:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="Wikipedia topic title must not be empty.",
                    provider="wikipedia",
                )
            )

        extract_res = await self._request_extract(topic)
        if isinstance(extract_res, Err):
            return err(extract_res.error)

        raw_extract = extract_res.value
        paragraphs: list[ParagraphDTO] = []
        current_heading: str | None = "Introduction"
        idx = 0

        for raw_line in raw_extract.splitlines():
            stripped = raw_line.strip()
            if not stripped:
                continue
            heading_match = _WIKI_HEADING_RE.match(stripped)
            if heading_match:
                current_heading = clean_text(heading_match.group(2))
                continue
            cleaned = clean_text(stripped)
            if len(cleaned) < source.min_paragraph_length:
                continue
            paragraphs.append(ParagraphDTO(index=idx, heading=current_heading, text=cleaned))
            idx += 1

        return ok(paragraphs)


class MarkdownTextSource:
    """Heading-aware raw text and Markdown ``ContentSourceProvider`` implementation."""

    @property
    def supported_kinds(self) -> tuple[SourceKind, ...]:
        """Return ``(SourceKind.RAW_TEXT, SourceKind.MARKDOWN)``."""
        return (SourceKind.RAW_TEXT, SourceKind.MARKDOWN)

    async def fetch_paragraphs(
        self,
        source: ContentSourceRequest,
    ) -> Result[list[ParagraphDTO], DataAccessError]:
        """Parse raw text or Markdown into section-tagged ``ParagraphDTO`` items."""
        if source.kind not in self.supported_kinds:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message=f"Unsupported source kind {source.kind} for MarkdownTextSource.",
                    provider="markdown_text",
                )
            )
        raw = (source.raw_content or "").strip()
        if not raw and source.query_or_uri:
            path = Path(source.query_or_uri)
            if not path.exists():
                return err(
                    DataAccessError(
                        code=ErrorCode.NOT_FOUND,
                        message=f"Text file not found: {source.query_or_uri}",
                        provider="markdown_text",
                    )
                )
            raw = await asyncio.to_thread(path.read_text, encoding="utf-8")

        if not raw.strip():
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="raw_content or valid file path is required for MarkdownTextSource.",
                    provider="markdown_text",
                )
            )

        paragraphs: list[ParagraphDTO] = []
        current_heading: str | None = source.title.strip() or "Introduction"
        buffer: list[str] = []
        idx = 0

        def _flush_buffer() -> None:
            nonlocal idx
            if not buffer:
                return
            joined = "\n\n".join(buffer)
            buffer.clear()
            for seg in split_paragraphs(joined, min_length=source.min_paragraph_length):
                paragraphs.append(ParagraphDTO(index=idx, heading=current_heading, text=seg))
                idx += 1

        for line in raw.splitlines():
            md_match = _MD_HEADING_RE.match(line.strip())
            if md_match:
                _flush_buffer()
                current_heading = clean_text(md_match.group(2))
            else:
                buffer.append(line)

        _flush_buffer()
        return ok(paragraphs)


class DefaultDocumentParserAdapter:
    """Default lightweight adapter decoding UTF-8/text-based PDF and EPUB payloads."""

    def extract_sections(
        self,
        kind: SourceKind,
        payload: bytes,
    ) -> list[tuple[str | None, str]]:
        """Extract ``(heading, text)`` sections from raw document bytes."""
        decoded = payload.decode("utf-8", errors="ignore").strip()
        if not decoded:
            raise ValueError(f"Empty {kind.value} document payload.")

        sections: list[tuple[str | None, str]] = []
        current_heading: str | None = f"{kind.value.upper()} Chapter 1"
        chunks = re.split(r"\f|\n{2,}", decoded)
        for chunk in chunks:
            stripped = chunk.strip()
            if not stripped:
                continue
            md_match = _MD_HEADING_RE.match(stripped)
            if md_match:
                current_heading = clean_text(md_match.group(2))
                continue
            sections.append((current_heading, stripped))
        return sections


class DocumentBookSource:
    """PDF and EPUB ``ContentSourceProvider`` with an injectable ``DocumentParserAdapter``."""

    def __init__(self, adapter: DocumentParserAdapter | None = None) -> None:
        """Initialize with an optional ``DocumentParserAdapter``."""
        self._adapter: DocumentParserAdapter = adapter or DefaultDocumentParserAdapter()

    @property
    def supported_kinds(self) -> tuple[SourceKind, ...]:
        """Return ``(SourceKind.PDF, SourceKind.EPUB)``."""
        return (SourceKind.PDF, SourceKind.EPUB)

    async def fetch_paragraphs(
        self,
        source: ContentSourceRequest,
    ) -> Result[list[ParagraphDTO], DataAccessError]:
        """Extract paragraphs from a PDF or EPUB payload offloaded via ``asyncio.to_thread``."""
        if source.kind not in self.supported_kinds:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message=f"Unsupported source kind {source.kind} for DocumentBookSource.",
                    provider="document_book",
                )
            )

        payload = source.content_bytes
        if payload is None and source.raw_content:
            payload = source.raw_content.encode("utf-8")
        if payload is None and source.query_or_uri:
            file_path = Path(source.query_or_uri)
            if not file_path.exists():
                return err(
                    DataAccessError(
                        code=ErrorCode.NOT_FOUND,
                        message=f"Document file not found: {source.query_or_uri}",
                        provider="document_book",
                    )
                )
            payload = await asyncio.to_thread(file_path.read_bytes)

        if not payload:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="content_bytes, raw_content, or file path is required for PDF/EPUB.",
                    provider="document_book",
                )
            )

        try:
            raw_sections = await asyncio.to_thread(
                self._adapter.extract_sections,
                source.kind,
                payload,
            )
        except Exception as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message=f"Failed to parse {source.kind.value} document: {exc}",
                    provider="document_book",
                    cause=str(exc),
                )
            )

        paragraphs: list[ParagraphDTO] = []
        idx = 0
        for heading, section_text in raw_sections:
            for seg in split_paragraphs(section_text, min_length=source.min_paragraph_length):
                paragraphs.append(ParagraphDTO(index=idx, heading=heading, text=seg))
                idx += 1

        return ok(paragraphs)


class ContentSourceRegistry:
    """Open/Closed registry dispatching ``ContentSourceRequest`` to registered providers."""

    def __init__(self, providers: list[ContentSourceProvider] | None = None) -> None:
        """Initialize the registry and optionally register initial providers."""
        self._by_kind: dict[SourceKind, ContentSourceProvider] = {}
        for provider in providers or []:
            self.register(provider)

    def register(self, provider: ContentSourceProvider) -> None:
        """Register a ``ContentSourceProvider`` for all of its ``supported_kinds``."""
        for kind in provider.supported_kinds:
            self._by_kind[kind] = provider

    async def fetch_paragraphs(
        self,
        source: ContentSourceRequest,
    ) -> Result[list[ParagraphDTO], DataAccessError]:
        """Dispatch ``source`` to the registered provider for ``source.kind``."""
        provider = self._by_kind.get(source.kind)
        if provider is None:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message=f"No ContentSourceProvider registered for kind {source.kind.value!r}.",
                    provider="source_registry",
                )
            )
        return await provider.fetch_paragraphs(source)
