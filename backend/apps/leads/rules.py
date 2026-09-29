"""Single source of truth for lead-state rules.

Both LeadQuerySet (open/overdue/stale) and the Lead model properties
(is_overdue/is_stale) import these, so the SQL and the Python definitions of
"closed" and "stale" can never drift apart.
"""

from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from apps.leads.models.choices import LeadStatus

# Statuses that mean a lead is closed (never overdue, never stale).
CLOSED_STATUSES = (LeadStatus.WON, LeadStatus.LOST)


def stale_cutoff():
    """A lead updated before this moment is old enough to be stale."""
    return timezone.now() - timedelta(days=settings.STALE_LEAD_DAYS)
