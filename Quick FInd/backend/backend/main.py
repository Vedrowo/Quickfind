from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from rag.config import DATA_DIR, LOG_PATH, ensure_runtime_dirs, load_config, save_config
from rag.ingest import ingest_file
from rag.knowledge_bases import (
    create_knowledge_base,
    delete_knowledge_base,
    ensure_default_knowledge_base,
    get_knowledge_base,
    list_knowledge_bases,
    update_knowledge_base,
)
from rag.query import get_chunk_preview, query_rag, stream_rag_answer
from rag.vectorstore import get_vector_manager

load_dotenv()

app = FastAPI(title="QuickFind Backend", version="0.1.0")
STATIC_DIR = Path(__file__).resolve().parent / "static"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    q: str
    kb_id: str
    use_llm: bool = True


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatTurnRequest(BaseModel):
    q: str
    kb_id: str
    use_llm: bool = True
    history: list[ChatMessage] = Field(default_factory=list)


class KnowledgeBaseCreateRequest(BaseModel):
    name: str
    description: str | None = ""


class KnowledgeBaseUpdateRequest(BaseModel):
    name: str
    description: str | None = ""


class ConfigUpdateRequest(BaseModel):
    model: str | None = None
    embedding_model: str | None = None
    temperature: float | None = Field(default=None, ge=0, le=2)
    chunk_size: int | None = Field(default=None, ge=50, le=8000)
    chunk_overlap: int | None = Field(default=None, ge=0, le=4000)
    top_k: int | None = Field(default=None, ge=1, le=25)


def write_log(event_type: str, message: str) -> None:
    ensure_runtime_dirs()
    timestamp = datetime.now(timezone.utc).isoformat()
    line = f"[{timestamp}] [{event_type.upper()}] {message}\n"
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(line)


def _list_documents_for_kb(kb_id: str) -> list[dict]:
    manager = get_vector_manager()
    collection = manager.get_collection()
    try:
        records = collection.get(where={"kb_id": kb_id}, include=["metadatas"])
    except Exception:
        return []

    documents: dict[str, dict] = {}
    for metadata in records.get("metadatas", []) or []:
        if not metadata:
            continue
        source = str(metadata.get("source") or "Unknown document")
        item = documents.setdefault(
            source,
            {
                "name": source,
                "file_type": metadata.get("file_type"),
                "file_path": metadata.get("file_path"),
                "kb_id": kb_id,
                "chunk_count": 0,
                "size": None,
                "modified_at": None,
            },
        )
        item["chunk_count"] += 1

    for item in documents.values():
        file_path = item.get("file_path")
        if not file_path:
            continue
        path = Path(str(file_path))
        if path.exists():
            stat = path.stat()
            item["size"] = stat.st_size
            item["modified_at"] = datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()

    return sorted(
        documents.values(),
        key=lambda item: str(item.get("modified_at") or ""),
        reverse=True,
    )


def _with_kb_stats(kb: dict) -> dict:
    documents = _list_documents_for_kb(str(kb.get("id", "")))
    return {
        **kb,
        "document_count": len(documents),
        "chunk_count": sum(int(item.get("chunk_count") or 0) for item in documents),
    }


def _resolve_source_path(kb_id: str, source: str) -> Path | None:
    source_name = Path(source).name
    data_candidate = DATA_DIR / source_name
    if data_candidate.exists() and data_candidate.is_file():
        return data_candidate

    manager = get_vector_manager()
    collection = manager.get_collection()
    try:
        records = collection.get(where={"kb_id": kb_id}, include=["metadatas"])
    except Exception:
        return None

    for metadata in records.get("metadatas", []) or []:
        if not metadata or str(metadata.get("source", "")) != source:
            continue
        file_path = metadata.get("file_path")
        if file_path:
            path = Path(str(file_path))
            if path.exists() and path.is_file():
                return path

    return None


@app.on_event("startup")
def startup() -> None:
    ensure_runtime_dirs()
    _ = get_vector_manager()
    _ = load_config()
    _ = ensure_default_knowledge_base()
    if not LOG_PATH.exists():
        LOG_PATH.touch()
    write_log("system", "Backend startup complete. Chroma local mode initialized.")


@app.get("/health")
def health() -> dict:
    manager = get_vector_manager()
    return {
        "status": "ok",
        "chroma_path": manager.persist_directory,
        "collection": manager.get_collection().name,
    }


@app.post("/upload")
def upload(file: UploadFile = File(...), kb_id: str = Form(...)) -> dict:
    ensure_runtime_dirs()
    kb = get_knowledge_base(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found.")

    filename = Path(file.filename or "uploaded_file").name
    destination = DATA_DIR / filename

    try:
        payload = file.file.read()
        destination.write_bytes(payload)
    finally:
        file.file.close()

    try:
        result = ingest_file(str(destination), kb_id=kb_id, kb_name=str(kb.get("name", "Knowledge Base")))
        write_log(
            "upload",
            f"File ingested: {filename} | kb={kb_id} | chunks={result.get('chunks_created')} vectors={result.get('vectors_stored')}",
        )
    except Exception as exc:
        write_log("error", f"Upload failed for {filename}: {exc}")
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "status": "success",
        "file": filename,
        "ingestion": result,
    }


@app.post("/query")
def query(request: QueryRequest) -> dict:
    question = request.q.strip()
    kb_id = request.kb_id.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    if not kb_id:
        raise HTTPException(status_code=400, detail="kb_id is required.")
    if not get_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found.")

    try:
        answer, docs = query_rag(question, kb_id=kb_id, use_llm=request.use_llm)
        write_log("query", f"kb={kb_id} | {question} | sources={len(docs)}")
    except Exception as exc:
        write_log("error", f"Query failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "answer": answer,
        "sources": docs,
        "use_llm": request.use_llm,
    }


@app.post("/chat/turn")
def chat_turn(request: ChatTurnRequest) -> dict:
    question = request.q.strip()
    kb_id = request.kb_id.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    if not kb_id:
        raise HTTPException(status_code=400, detail="kb_id is required.")
    if not get_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found.")

    history = [
        {"role": item.role, "content": item.content}
        for item in request.history
        if item.role in {"user", "assistant"} and item.content.strip()
    ]

    try:
        answer, sources = query_rag(
            question,
            kb_id=kb_id,
            use_llm=request.use_llm,
            history=history,
        )
    except Exception as exc:
        write_log("error", f"Chat turn failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    citations = [
        {
            "id": source.get("chunk_id"),
            "label": source.get("citation"),
            "source": source.get("source"),
            "chunk_index": source.get("chunk_index"),
            "snippet": source.get("snippet"),
        }
        for source in sources
    ]

    write_log(
        "chat",
        f"kb={kb_id} | use_llm={request.use_llm} | {question} | citations={len(citations)}",
    )

    return {
        "answer": answer,
        "sources": sources,
        "citations": citations,
        "use_llm": request.use_llm,
    }


@app.post("/chat/stream")
def chat_stream(request: ChatTurnRequest) -> StreamingResponse:
    question = request.q.strip()
    kb_id = request.kb_id.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    if not kb_id:
        raise HTTPException(status_code=400, detail="kb_id is required.")
    if not get_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found.")

    history = [
        {"role": item.role, "content": item.content}
        for item in request.history
        if item.role in {"user", "assistant"} and item.content.strip()
    ]

    try:
        token_stream, sources = stream_rag_answer(
            question=question,
            kb_id=kb_id,
            history=history,
        )
    except Exception as exc:
        write_log("error", f"Chat stream init failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    citations = [
        {
            "id": source.get("chunk_id"),
            "label": source.get("citation"),
            "source": source.get("source"),
            "chunk_index": source.get("chunk_index"),
            "snippet": source.get("snippet"),
        }
        for source in sources
    ]

    write_log(
        "chat",
        f"kb={kb_id} | stream=true | {question} | citations={len(citations)}",
    )

    def event_stream():
        meta_payload = {
            "type": "meta",
            "sources": sources,
            "citations": citations,
        }
        yield f"data: {json.dumps(meta_payload)}\n\n"

        try:
            for token in token_stream:
                yield f"data: {json.dumps({'type': 'delta', 'text': token})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as exc:
            write_log("error", f"Chat stream failed: {exc}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/preview/chunk/{chunk_id}")
def preview_chunk(chunk_id: str, kb_id: str, neighbor_window: int = 2) -> dict:
    safe_window = min(max(neighbor_window, 0), 8)
    try:
        preview = get_chunk_preview(chunk_id=chunk_id, kb_id=kb_id, neighbor_window=safe_window)
    except Exception as exc:
        write_log("error", f"Preview lookup failed for chunk={chunk_id}: {exc}")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if not preview:
        raise HTTPException(status_code=404, detail="Chunk preview not found.")

    return preview


@app.get("/documents/source")
def get_source_document(kb_id: str, source: str) -> FileResponse:
    if not get_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found.")

    path = _resolve_source_path(kb_id=kb_id, source=source)
    if not path:
        raise HTTPException(status_code=404, detail="Source file not found.")

    return FileResponse(path, filename=path.name, content_disposition_type="inline")


@app.get("/knowledge-bases")
def get_knowledge_bases() -> dict:
    return {"knowledge_bases": [_with_kb_stats(kb) for kb in list_knowledge_bases()]}


@app.get("/knowledge-bases/{kb_id}/documents")
def get_knowledge_base_documents(kb_id: str) -> dict:
    if not get_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found.")
    return {"documents": _list_documents_for_kb(kb_id)}


@app.post("/knowledge-bases")
def create_kb(payload: KnowledgeBaseCreateRequest) -> dict:
    try:
        kb = create_knowledge_base(payload.name, payload.description or "")
        write_log("kb", f"Knowledge base created: {kb.get('id')} ({kb.get('name')})")
        return {"status": "created", "knowledge_base": kb}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.patch("/knowledge-bases/{kb_id}")
def update_kb(kb_id: str, payload: KnowledgeBaseUpdateRequest) -> dict:
    try:
        kb = update_knowledge_base(kb_id, payload.name, payload.description or "")
        write_log("kb", f"Knowledge base updated: {kb.get('id')} ({kb.get('name')})")
        return {"status": "updated", "knowledge_base": _with_kb_stats(kb)}
    except ValueError as exc:
        status_code = 404 if "not found" in str(exc).lower() else 400
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc


@app.delete("/knowledge-bases/{kb_id}")
def delete_kb(kb_id: str) -> dict:
    try:
        kb = delete_knowledge_base(kb_id)
        manager = get_vector_manager()
        manager.get_collection().delete(where={"kb_id": kb_id})
        write_log("kb", f"Knowledge base deleted: {kb.get('id')} ({kb.get('name')})")
        return {"status": "deleted", "knowledge_base": kb}
    except ValueError as exc:
        status_code = 404 if "not found" in str(exc).lower() else 400
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc


@app.get("/logs")
def get_logs(limit: int = 200) -> dict:
    ensure_runtime_dirs()
    if not LOG_PATH.exists():
        return {"logs": []}

    lines = LOG_PATH.read_text(encoding="utf-8").splitlines()
    safe_limit = min(max(limit, 1), 2000)
    return {"logs": lines[-safe_limit:]}


@app.get("/config")
def get_config() -> dict:
    return {"config": load_config()}


@app.post("/config")
def update_config(payload: ConfigUpdateRequest) -> dict:
    updates = payload.model_dump(exclude_none=True)
    try:
        config = save_config(updates)
        write_log("config", f"Config updated: {updates}")
    except ValueError as exc:
        write_log("error", f"Config update failed: {exc}")
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"status": "saved", "config": config}


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
