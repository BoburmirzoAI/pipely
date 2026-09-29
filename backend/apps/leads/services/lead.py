"""Lead write operations: create / update / status change.

All writes are wrapped in a transaction together with their activity log, and
the DB unique constraints are treated as a race-safe net that maps back to a
friendly 409 (DuplicateLead).
"""

from django.db import IntegrityError, transaction

from apps.core.exceptions import DuplicateLead
from apps.leads.models import Lead
from apps.leads.rules import CLOSED_STATUSES

from . import activity, duplicates


def _raise_if_duplicate(email, phone, exclude_id=None):
    """Called after an IntegrityError to translate it into a 409, or re-raise."""
    lead, field = duplicates.find_duplicate(
        email=email, phone=phone, exclude_id=exclude_id
    )
    if lead:
        raise DuplicateLead(field, lead)
    raise  # not a duplicate we recognize — let it propagate


def create_lead(owner, data):
    email, phone = data.get("email", ""), data.get("phone", "")
    try:
        with transaction.atomic():
            lead = Lead.objects.create(owner=owner, **data)
            activity.log_created(lead, owner)
    except IntegrityError:
        _raise_if_duplicate(email, phone)
    return lead


def update_lead(lead, user, data):
    """Apply changed fields (status is handled separately) and log each change."""
    changes = []
    for field, new_value in data.items():
        old_value = getattr(lead, field)
        if old_value != new_value:
            changes.append((field, old_value, new_value))
            setattr(lead, field, new_value)

    if not changes:
        return lead

    try:
        with transaction.atomic():
            lead.save()
            for field, old_value, new_value in changes:
                activity.log_field_change(lead, user, field, old_value, new_value)
    except IntegrityError:
        _raise_if_duplicate(
            data.get("email", ""), data.get("phone", ""), exclude_id=lead.id
        )
    return lead


def change_status(lead, user, new_status):
    old_status = lead.status
    if new_status == old_status:
        return lead  # no-op

    with transaction.atomic():
        lead.status = new_status
        activity.log_status_change(lead, user, old_status, new_status)

        # Closing a lead clears its follow-up (a closed lead needs none).
        if new_status in CLOSED_STATUSES and lead.next_follow_up_at is not None:
            activity.log_field_change(
                lead, user, "next_follow_up_at", lead.next_follow_up_at, None
            )
            lead.next_follow_up_at = None

        lead.save()
    return lead
