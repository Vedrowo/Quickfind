from __future__ import annotations

import json
from datetime import datetime, timezone
from uuid import uuid4

from rag.config import KNOWLEDGE_BASES_PATH, ensure_runtime_dirs

DEFAULT_KB_ID = "kb-default"


def _read_all() -> list[dict]:
    ensure_runtime_dirs()
    if not KNOWLEDGE_BASES_PATH.exists():
        KNOWLEDGE_BASES_PATH.write_text("[]", encoding="utf-8")
        return []

    try:
        raw = json.loads(KNOWLEDGE_BASES_PATH.read_text(encoding="utf-8"))
        return raw if isinstance(raw, list) else []
    except json.JSONDecodeError:
        KNOWLEDGE_BASES_PATH.write_text("[]", encoding="utf-8")
        return []


def _write_all(items: list[dict]) -> None:
    ensure_runtime_dirs()
    KNOWLEDGE_BASES_PATH.write_text(json.dumps(items, indent=2), encoding="utf-8")


def ensure_default_knowledge_base() -> dict:
    items = _read_all()
    existing = next((kb for kb in items if kb.get("id") == DEFAULT_KB_ID), None)
    if existing:
        return existing

    kb = {
        "id": DEFAULT_KB_ID,
        "name": "Default Knowledge Base",
        "description": "Primary workspace knowledge base",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    items.append(kb)
    _write_all(items)
    return kb


def list_knowledge_bases() -> list[dict]:
    ensure_default_knowledge_base()
    return _read_all()


def get_knowledge_base(kb_id: str) -> dict | None:
    return next((kb for kb in list_knowledge_bases() if kb.get("id") == kb_id), None)


def create_knowledge_base(name: str, description: str = "") -> dict:
    normalized_name = name.strip()
    if not normalized_name:
        raise ValueError("Knowledge base name cannot be empty.")

    items = list_knowledge_bases()
    if any(kb.get("name", "").strip().lower() == normalized_name.lower() for kb in items):
        raise ValueError("Knowledge base with this name already exists.")

    kb = {
        "id": f"kb-{uuid4().hex[:10]}",
        "name": normalized_name,
        "description": description.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    items.append(kb)
    _write_all(items)
    return kb


def update_knowledge_base(kb_id: str, name: str, description: str = "") -> dict:
    normalized_name = name.strip()
    if not normalized_name:
        raise ValueError("Knowledge base name cannot be empty.")

    items = list_knowledge_bases()
    target = next((kb for kb in items if kb.get("id") == kb_id), None)
    if not target:
        raise ValueError("Knowledge base not found.")
    if any(
        kb.get("id") != kb_id and kb.get("name", "").strip().lower() == normalized_name.lower()
        for kb in items
    ):
        raise ValueError("Knowledge base with this name already exists.")

    target["name"] = normalized_name
    target["description"] = description.strip()
    target["updated_at"] = datetime.now(timezone.utc).isoformat()
    _write_all(items)
    return target


def delete_knowledge_base(kb_id: str) -> dict:
    if kb_id == DEFAULT_KB_ID:
        raise ValueError("The default knowledge base cannot be deleted.")

    items = list_knowledge_bases()
    target = next((kb for kb in items if kb.get("id") == kb_id), None)
    if not target:
        raise ValueError("Knowledge base not found.")

    _write_all([kb for kb in items if kb.get("id") != kb_id])
    return target
