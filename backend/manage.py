#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def main():
    """Run administrative tasks."""
    BASE_DIR = Path(__file__).resolve().parent

    # Load .env before Django reads settings, so DJANGO_SETTINGS_MODULE (and
    # every other variable) can be configured there. Fall back to a .env one
    # level up if the backend has none of its own.
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        env_path = BASE_DIR.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)

    # load_dotenv above may set DJANGO_SETTINGS_MODULE from .env; otherwise we
    # default to development. Set DJANGO_SETTINGS_MODULE=config.settings.prod
    # in the environment to run management commands against production.
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
