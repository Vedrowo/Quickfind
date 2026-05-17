from __future__ import annotations

import os
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

import pandas as pd
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from pypdf import PdfReader

from rag.config import load_config
from rag.vectorstore import get_vector_manager


SUPPORTED_EXTENSIONS = {".xml", ".xlsx", ".xls", ".pdf", ".md", ".markdown", ".txt"}


def _create_model_client() -> OpenAI:
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY/OPENAI_API_KEY is missing. Set one before uploading files."
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


def _load_xml_file(path: Path) -> str:
    tree = ET.parse(path)
    root = tree.getroot()

    lines: list[str] = []
    for element in root.iter():
        text = (element.text or "").strip()
        if text:
            lines.append(f"{element.tag}: {text}")

    if lines:
        return "\n".join(lines)

    # Fallback for sparse XML structures.
    return ET.tostring(root, encoding="unicode")


def _load_excel_file(path: Path) -> str:
    workbook = pd.ExcelFile(path)
    sections: list[str] = []

    for sheet_name in workbook.sheet_names:
        df = pd.read_excel(workbook, sheet_name=sheet_name)
        sheet_text = df.to_string(index=False) if not df.empty else "(empty sheet)"
        sections.append(f"Sheet: {sheet_name}\n{sheet_text}")

    return "\n\n".join(sections)


def _load_pdf_file(path: Path) -> str:
    reader = PdfReader(str(path))
    page_texts: list[str] = []

    for index, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if text:
            page_texts.append(f"Page {index}\n{text}")

    if page_texts:
        return "\n\n".join(page_texts)

    return "(No extractable text found in PDF.)"


def _load_text_like_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1")


def load_file(file_path: str, kb_id: str, kb_name: str) -> list[Document]:
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file extension '{extension}'. Supported types: {sorted(SUPPORTED_EXTENSIONS)}"
        )

    if extension == ".xml":
        text = _load_xml_file(path)
    elif extension in {".xlsx", ".xls"}:
        text = _load_excel_file(path)
    elif extension == ".pdf":
        text = _load_pdf_file(path)
    else:
        text = _load_text_like_file(path)

    return [
        Document(
            page_content=text,
            metadata={
                "source": path.name,
                "file_path": str(path),
                "file_type": extension.replace(".", ""),
                "kb_id": kb_id,
                "kb_name": kb_name,
            },
        )
    ]


def split_text(docs: list[Document]) -> list[Document]:
    config = load_config()
    chunk_size = int(config.get("chunk_size", 500))
    chunk_overlap = int(config.get("chunk_overlap", 50))

    if chunk_size <= 0:
        raise ValueError("Invalid config: chunk_size must be > 0.")
    if chunk_overlap < 0:
        raise ValueError("Invalid config: chunk_overlap must be >= 0.")
    if chunk_overlap >= chunk_size:
        raise ValueError("Invalid config: chunk_overlap must be smaller than chunk_size.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return splitter.split_documents(docs)


def embed(chunks: list[Document]) -> list[list[float]]:
    if not chunks:
        return []

    config = load_config()
    model = str(config.get("embedding_model", "text-embedding-3-small"))

    client = _create_model_client()
    vectors: list[list[float]] = []

    batch_size = 100
    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        response = client.embeddings.create(
            model=model,
            input=[chunk.page_content for chunk in batch],
        )
        vectors.extend([item.embedding for item in response.data])

    return vectors


def store(chunks: list[Document], embeddings: list[list[float]]) -> dict[str, Any]:
    if len(chunks) != len(embeddings):
        raise ValueError("Chunk and embedding counts do not match.")

    manager = get_vector_manager()
    collection = manager.get_collection()

    # Replace previous chunks for the same source to avoid duplicate growth on re-upload.
    source_name = str(chunks[0].metadata.get("source", "")) if chunks else ""
    kb_id = str(chunks[0].metadata.get("kb_id", "")) if chunks else ""
    if source_name and kb_id:
        collection.delete(where={"$and": [{"source": source_name}, {"kb_id": kb_id}]})
    elif source_name:
        collection.delete(where={"source": source_name})

    ids: list[str] = []
    documents: list[str] = []
    metadatas: list[dict[str, Any]] = []

    for index, chunk in enumerate(chunks):
        chunk_id = f"{chunk.metadata.get('source', 'doc')}::{index}::{uuid.uuid4().hex[:8]}"
        ids.append(chunk_id)
        documents.append(chunk.page_content)
        metadatas.append({**chunk.metadata, "chunk_index": index})

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    return {
        "collection": collection.name,
        "inserted": len(ids),
    }


def ingest_file(file_path: str, kb_id: str, kb_name: str) -> dict:
    path = Path(file_path)
    docs = load_file(file_path, kb_id=kb_id, kb_name=kb_name)
    chunks = split_text(docs)
    embeddings = embed(chunks)
    store_result = store(chunks, embeddings)

    return {
        "status": "completed",
        "file": path.name,
        "documents_loaded": len(docs),
        "chunks_created": len(chunks),
        "vectors_stored": store_result["inserted"],
        "collection": store_result["collection"],
        "kb_id": kb_id,
        "kb_name": kb_name,
    }
