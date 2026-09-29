"""Company-wide duplicate lead detection."""

from apps.leads.models import Lead


def find_duplicate(email="", phone="", exclude_id=None):
    """Return (lead, matched_field) if any lead matches, company-wide.

    Phone is compared exactly (values are stored normalized); email is compared
    case-insensitively. Phone is checked first. Returns (None, None) if none.

    Note: scope-aware hiding of the matched lead's id/name (for a duplicate
    outside the requester's data scope) is layered on in Phase C.
    """
    qs = Lead.objects.all()
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
