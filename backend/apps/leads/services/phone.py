"""Phone number normalization and validation."""

import re

from rest_framework import serializers

# After stripping separators: an optional leading "+" then 7–15 digits.
_PHONE_RE = re.compile(r"^\+?\d{7,15}$")
_SEPARATORS_RE = re.compile(r"[\s\-().]")


def normalize_phone(raw: str) -> str:
    """Strip spaces, dashes, parentheses and dots. Keeps a leading '+'.

    e.g. "+998 90 123-45-67" -> "+998901234567".
    """
    if not raw:
        return ""
    return _SEPARATORS_RE.sub("", raw).strip()


def validate_and_normalize_phone(raw: str) -> str:
    """Normalize, then validate the shape. Returns '' for empty input."""
    cleaned = normalize_phone(raw)
    if cleaned and not _PHONE_RE.match(cleaned):
        raise serializers.ValidationError("Enter a valid phone number.")
    return cleaned
