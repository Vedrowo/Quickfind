from __future__ import annotations

import os
from typing import Any, Iterator

from openai import OpenAI

from rag.config import load_config
from rag.vectorstore import get_vector_manager


def _create_model_client() -> OpenAI:
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY/OPENAI_API_KEY is missing. Set one before querying."
        )

    base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    headers: dict[str, str] = {}
    referer = os.getenv("OPENROUTER_HTTP_REFERER")
    app_name = os.getenv("OPENROUTER_APP_NAME")
    if referer:
        headers["HTTP-Referer"] = referer
    if app_name:
        headers["X-Title"] = app_name

    return OpenAI(api_key=api_key, base_url=base_url, default_headers=headers or None)


def _retrieve_sources(question: str, kb_id: str, top_k: int) -> list[dict[str, Any]]:
    client = _create_model_client()
    manager = get_vector_manager()
    collection = manager.get_collection()
    settings = load_config()

    embedding_model = str(settings.get("embedding_model", "text-embedding-3-small"))
    query_embedding_response = client.embeddings.create(
        model=embedding_model,
        input=question,
    )
    query_embedding = query_embedding_response.data[0].embedding

    result = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"kb_id": kb_id},
        include=["documents", "metadatas", "distances"],
    )

    raw_ids = result.get("ids", [[]])[0]
    raw_docs = result.get("documents", [[]])[0]
    raw_metadatas = result.get("metadatas", [[]])[0]
    raw_distances = result.get("distances", [[]])[0]

    sources: list[dict[str, Any]] = []
    for idx, doc_text in enumerate(raw_docs):
        metadata = raw_metadatas[idx] if idx < len(raw_metadatas) else {}
        distance = raw_distances[idx] if idx < len(raw_distances) else None
        chunk_id = raw_ids[idx] if idx < len(raw_ids) else None
        source = (metadata or {}).get("source", "unknown")
        chunk_index = (metadata or {}).get("chunk_index", idx)
        citation = f"[{source}:{chunk_index}]"

        sources.append(
            {
                "citation": citation,
                "chunk_id": chunk_id,
                "source": source,
                "kb_id": kb_id,
                "kb_name": (metadata or {}).get("kb_name"),
                "chunk_index": chunk_index,
                "distance": distance,
                "file_type": (metadata or {}).get("file_type"),
                "file_path": (metadata or {}).get("file_path"),
                "snippet": (doc_text[:240] + "...") if len(doc_text) > 240 else doc_text,
                "content": doc_text,
            }
        )

    return sources


def _build_retrieval_only_answer(question: str, sources: list[dict[str, Any]]) -> str:
    lines = [f"Top retrieved chunks for: {question}", ""]
    for source in sources:
        lines.append(
            f"- {source.get('citation', '[unknown]')} "
            f"distance={source.get('distance') if source.get('distance') is not None else '-'}"
        )
    lines.append("")
    lines.append("Retrieval-only mode is enabled (LLM generation skipped).")
    return "\n".join(lines)


def _build_llm_answer(
    question: str,
    sources: list[dict[str, Any]],
    history: list[dict[str, str]] | None = None,
) -> str:
    client = _create_model_client()
    settings = load_config()
    llm_model = str(settings.get("model", "stepfun/step-3.5-flash:free"))
    temperature = float(settings.get("temperature", 0.2))

    context_blocks: list[str] = []
    for source in sources:
        context_blocks.append(
            f"{source.get('citation', '[unknown]')}\n{source.get('content', '')}"
        )
    context = "\n\n".join(context_blocks)

    prompt = f"""
Answer the question using only the context below.
If the answer is not in the context, say so clearly.
Use concise citations exactly in the format [source:chunk_index].

Context:
{context}

Question:
{question}
""".strip()

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": "You are a retrieval assistant. Only use provided context and cite sources.",
        }
    ]
    if history:
        for item in history:
            role = str(item.get("role", "")).strip().lower()
            content = str(item.get("content", "")).strip()
            if role in {"user", "assistant"} and content:
                messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": prompt})

    completion = client.chat.completions.create(
        model=llm_model,
        temperature=temperature,
        messages=messages,
    )
    return completion.choices[0].message.content or "No answer generated."


def _build_messages(
    question: str,
    sources: list[dict[str, Any]],
    history: list[dict[str, str]] | None = None,
) -> list[dict[str, str]]:
    context_blocks: list[str] = []
    for source in sources:
        context_blocks.append(
            f"{source.get('citation', '[unknown]')}\n{source.get('content', '')}"
        )
    context = "\n\n".join(context_blocks)

    prompt = f"""
Answer the question using only the context below.
If the answer is not in the context, say so clearly.
Use concise citations exactly in the format [source:chunk_index].

Context:
{context}

Question:
{question}
""".strip()

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": "You are a retrieval assistant. Only use provided context and cite sources.",
        }
    ]
    if history:
        for item in history:
            role = str(item.get("role", "")).strip().lower()
            content = str(item.get("content", "")).strip()
            if role in {"user", "assistant"} and content:
                messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": prompt})
    return messages


def _clean_sources(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            key: value
            for key, value in source.items()
            if key != "content"
        }
        for source in sources
    ]


def query_rag(
    question: str,
    kb_id: str,
    use_llm: bool = True,
    history: list[dict[str, str]] | None = None,
) -> tuple[str, list[dict[str, Any]]]:
    """Run RAG query and return answer plus retrieved sources."""
    client = _create_model_client()
    settings = load_config()
    top_k = int(settings.get("top_k", 4))

    # Probe API key early for cleaner error messages in missing-key scenarios.
    _ = client

    sources = _retrieve_sources(question=question, kb_id=kb_id, top_k=top_k)
    if not sources:
        return (
            "I could not find relevant chunks for this knowledge base yet. Upload data and try again.",
            [],
        )

    if use_llm:
        answer = _build_llm_answer(question=question, sources=sources, history=history)
    else:
        answer = _build_retrieval_only_answer(question=question, sources=sources)

    cleaned_sources = _clean_sources(sources)

    return answer, cleaned_sources


def stream_rag_answer(
    question: str,
    kb_id: str,
    history: list[dict[str, str]] | None = None,
) -> tuple[Iterator[str], list[dict[str, Any]]]:
    client = _create_model_client()
    settings = load_config()
    top_k = int(settings.get("top_k", 4))
    llm_model = str(settings.get("model", "stepfun/step-3.5-flash:free"))
    temperature = float(settings.get("temperature", 0.2))

    sources = _retrieve_sources(question=question, kb_id=kb_id, top_k=top_k)
    if not sources:
        return iter([
            "I could not find relevant chunks for this knowledge base yet. Upload data and try again."
        ]), []

    messages = _build_messages(question=question, sources=sources, history=history)
    stream = client.chat.completions.create(
        model=llm_model,
        temperature=temperature,
        messages=messages,
        stream=True,
    )

    def _iter_tokens() -> Iterator[str]:
        for part in stream:
            choices = getattr(part, "choices", None) or []
            if not choices:
                continue
            delta = getattr(choices[0], "delta", None)
            text = getattr(delta, "content", None) if delta else None
            if text:
                yield text

    return _iter_tokens(), _clean_sources(sources)


def get_chunk_preview(chunk_id: str, kb_id: str, neighbor_window: int = 2) -> dict[str, Any] | None:
    manager = get_vector_manager()
    collection = manager.get_collection()

    record = collection.get(ids=[chunk_id], include=["documents", "metadatas"])
    ids = record.get("ids", [])
    if not ids:
        return None

    doc = (record.get("documents") or [""])[0]
    metadata = (record.get("metadatas") or [{}])[0] or {}

    if str(metadata.get("kb_id", "")) != kb_id:
        return None

    source = str(metadata.get("source", ""))
    current_index = int(metadata.get("chunk_index", 0))

    all_for_doc = collection.get(
        where={"$and": [{"kb_id": kb_id}, {"source": source}]},
        include=["documents", "metadatas"],
    )

    rows: list[dict[str, Any]] = []
    for idx, row_id in enumerate(all_for_doc.get("ids", [])):
        row_doc = (all_for_doc.get("documents") or [""])[idx]
        row_meta = (all_for_doc.get("metadatas") or [{}])[idx] or {}
        try:
            row_chunk_index = int(row_meta.get("chunk_index", 0))
        except (TypeError, ValueError):
            row_chunk_index = 0
        rows.append(
            {
                "chunk_id": row_id,
                "chunk_index": row_chunk_index,
                "content": row_doc,
            }
        )

    rows.sort(key=lambda item: item.get("chunk_index", 0))

    start = max(current_index - neighbor_window, 0)
    end = current_index + neighbor_window
    preview_chunks = [
        {
            **row,
            "is_target": row.get("chunk_id") == chunk_id,
        }
        for row in rows
        if start <= int(row.get("chunk_index", 0)) <= end
    ]

    return {
        "chunk_id": chunk_id,
        "kb_id": kb_id,
        "source": source,
        "file_path": metadata.get("file_path"),
        "file_type": metadata.get("file_type"),
        "chunk_index": current_index,
        "content": doc,
        "neighbors": preview_chunks,
    }
