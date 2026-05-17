from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CHROMA_DIR = BASE_DIR / "chroma_db"
LOGS_DIR = BASE_DIR / "logs"
CONFIG_PATH = BASE_DIR / "config.json"
LOG_PATH = LOGS_DIR / "log.txt"
KNOWLEDGE_BASES_PATH = BASE_DIR / "knowledge_bases.json"

DEFAULT_CONFIG: Dict[str, Any] = {
    "model": "stepfun/step-3.5-flash:free",
    "embedding_model": "text-embedding-3-small",
    "temperature": 0.2,
    "chunk_size": 500,
    "chunk_overlap": 50,
    "top_k": 4,
}


def validate_config(config: Dict[str, Any]) -> Dict[str, Any]:
    model = str(config.get("model", "")).strip()
    embedding_model = str(config.get("embedding_model", "")).strip()
    temperature = float(config.get("temperature", 0.2))
    chunk_size = int(config.get("chunk_size", 500))
    chunk_overlap = int(config.get("chunk_overlap", 50))
    top_k = int(config.get("top_k", 4))

    if not model:
        raise ValueError("Config validation failed: 'model' cannot be empty.")
    if not embedding_model:
        raise ValueError("Config validation failed: 'embedding_model' cannot be empty.")
    if ":free" not in model:
        raise ValueError("Config validation failed: 'model' must include ':free'.")
    if not 0 <= temperature <= 2:
        raise ValueError("Config validation failed: 'temperature' must be between 0 and 2.")
    if chunk_size <= 0:
        raise ValueError("Config validation failed: 'chunk_size' must be greater than 0.")
    if chunk_overlap < 0:
        raise ValueError("Config validation failed: 'chunk_overlap' must be 0 or greater.")
    if chunk_overlap >= chunk_size:
        raise ValueError("Config validation failed: 'chunk_overlap' must be less than 'chunk_size'.")
    if top_k < 1:
        raise ValueError("Config validation failed: 'top_k' must be at least 1.")

    return {
        "model": model,
        "embedding_model": embedding_model,
        "temperature": temperature,
        "chunk_size": chunk_size,
        "chunk_overlap": chunk_overlap,
        "top_k": top_k,
    }


def ensure_runtime_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)


def load_config() -> Dict[str, Any]:
    ensure_runtime_dirs()
    if not CONFIG_PATH.exists():
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG.copy()

    try:
        merged = {**DEFAULT_CONFIG, **json.loads(CONFIG_PATH.read_text(encoding="utf-8"))}
        validated = validate_config(merged)
        if merged != validated:
            CONFIG_PATH.write_text(json.dumps(validated, indent=2), encoding="utf-8")
        return validated
    except json.JSONDecodeError:
        # Fall back to defaults if config file is corrupted.
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG.copy()
    except (TypeError, ValueError):
        # Fall back to defaults if config values are invalid.
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG.copy()


def save_config(new_config: Dict[str, Any]) -> Dict[str, Any]:
    ensure_runtime_dirs()
    merged = {**DEFAULT_CONFIG, **new_config}
    validated = validate_config(merged)
    CONFIG_PATH.write_text(json.dumps(validated, indent=2), encoding="utf-8")
    return validated
