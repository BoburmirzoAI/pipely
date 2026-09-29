"""Single source of truth for environment configuration.

Every environment variable the project needs is read here, once, into a
plain typed constant. The rest of the codebase imports these constants from
``config.env`` instead of touching ``os.environ`` directly:

    from config import config
    ... config.SECRET_KEY, config.DEBUG, config.DB_NAME ...

This keeps env access centralized, typed, and easy to audit.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# backend/config/config.py -> parents[1] == backend/
BASE_DIR = Path(__file__).resolve().parents[1]

# Load backend/.env in development. In production the variables are provided
# by the host/orchestrator and this simply finds nothing to load.
load_dotenv(BASE_DIR / ".env")


# --- Typed readers ---------------------------------------------------------

def env_str(name: str, default: str = "") -> str:
    return os.getenv(name, default)


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# --- Django core -----------------------------------------------------------

SECRET_KEY = env_str("SECRET_KEY", "unsafe-dev-key-change-me")
DEBUG = env_bool("DEBUG", default=False)
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")

# --- Database --------------------------------------------------------------

DB_NAME = env_str("DB_NAME", "pipely")
DB_USER = env_str("DB_USER", "pipely")
DB_PASSWORD = env_str("DB_PASSWORD", "pipely")
DB_HOST = env_str("DB_HOST", "localhost")
DB_PORT = env_str("DB_PORT", "5435")
DB_SSLMODE = env_str("DB_SSLMODE", "prefer")

# --- CORS --------------------------------------------------------------------

# Origins allowed to call the API (the frontend dev server by default).
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
