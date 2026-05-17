from __future__ import annotations

from pathlib import Path
from typing import Optional

import chromadb
from chromadb.api.models.Collection import Collection

from rag.config import CHROMA_DIR, ensure_runtime_dirs

COLLECTION_NAME = "quickfind_docs"


class VectorStoreManager:
    """Lightweight manager for local persistent Chroma storage."""

    def __init__(self, persist_directory: Optional[Path] = None) -> None:
        ensure_runtime_dirs()
        self.persist_directory = str(persist_directory or CHROMA_DIR)
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        self.collection = self.client.get_or_create_collection(name=COLLECTION_NAME)

    def get_collection(self) -> Collection:
        return self.collection


_manager: Optional[VectorStoreManager] = None


def get_vector_manager() -> VectorStoreManager:
    global _manager
    if _manager is None:
        _manager = VectorStoreManager()
    return _manager
