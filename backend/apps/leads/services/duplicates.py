"""Duplicate lead detection, scoped to a single owner."""

from apps.leads.models import Lead


def find_duplicate(owner, email="", phone="", exclude_id=None):
    """Return (lead, matched_field) if another of the owner's leads matches.

    Phone is compared exactly (values are stored normalized); email is compared
    case-insensitively. Phone is checked first. Returns (None, None) if none.
    """
    qs = Lead.objects.filter(owner=owner)
    if exclude_id is not None:
        qs = qs.exclude(id=exclude_id)

    if phone:
        match = qs.filter(phone=phone).first()
        if match:
            return match, "phone"

    if email:
        match = qs.filter(email__iexact=email).first()
        if match:
            return match, "email"

    return None, None
