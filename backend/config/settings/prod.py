"""Production settings: secure defaults, everything driven by the environment."""

from .base import *  # noqa: F401,F403

# DEBUG must never be on in production; ignore any env override.
DEBUG = False

# ALLOWED_HOSTS is required in production and comes from the environment
# (base.py already reads it from config.ALLOWED_HOSTS).

# --- Security hardening (active when served over HTTPS behind a proxy) ------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
