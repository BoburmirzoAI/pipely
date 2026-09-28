"""Development settings: convenient local defaults."""

from .base import *  # noqa: F401,F403
from config import config

# In development we default DEBUG to True unless the environment overrides it.
DEBUG = config.env_bool("DEBUG", default=True)

# Be permissive with hosts locally.
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]
