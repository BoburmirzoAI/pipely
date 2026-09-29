from datetime import timedelta

from django.conf import settings
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone

from apps.core.models import TimeStampedModel


class LeadSource(models.TextChoices):
    WEBSITE = "website", "Website"
    INSTAGRAM = "instagram", "Instagram"
    TELEGRAM = "telegram", "Telegram"
    REFERRAL = "referral", "Referral"
    OTHER = "other", "Other"


class LeadStatus(models.TextChoices):
    NEW = "new", "New"
    CONTACTED = "contacted", "Contacted"
    QUALIFIED = "qualified", "Qualified"
    WON = "won", "Won"
    LOST = "lost", "Lost"


class LeadQuerySet(models.QuerySet):
    """Reusable, chainable lead-state filters.

    Every lead-state rule (open, overdue, due today, ...) and the data scope
    live here in one place, so filters, stats and views all share the exact
    same definition and can never drift apart.
    """

    CLOSED_STATUSES = [LeadStatus.WON, LeadStatus.LOST]

    def open(self):
        """Leads that are still in play (not won/lost)."""
        return self.exclude(status__in=self.CLOSED_STATUSES)

    def overdue(self):
        """Open leads whose follow-up is already in the past."""
        return self.open().filter(next_follow_up_at__lt=timezone.now())

    def due_today(self):
        """Follow-up falls on today's date (server timezone)."""
        return self.filter(next_follow_up_at__date=timezone.localdate())

    def upcoming(self):
        """Follow-up is after today."""
        return self.filter(next_follow_up_at__date__gt=timezone.localdate())

    def stale(self):
        """Open leads untouched for STALE_LEAD_DAYS with no future follow-up.

        A lead with a planned future follow-up is not forgotten, so it is never
        stale. Any save bumps updated_at and drops the lead out of this set.
        """
        now = timezone.now()
        threshold = now - timedelta(days=settings.STALE_LEAD_DAYS)
        return (
            self.open()
            .filter(updated_at__lt=threshold)
            .filter(
                models.Q(next_follow_up_at__isnull=True)
                | models.Q(next_follow_up_at__lt=now)
            )
        )

    def visible_to(self, user):
        """Data scope. Phase B: owner-only; extended with leads.view_all in Phase C."""
        return self.filter(owner=user)


class Lead(TimeStampedModel):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    # Stored normalized: digits with an optional leading "+" (see services.phone).
    phone = models.CharField(max_length=20, blank=True)
    source = models.CharField(
        max_length=20, choices=LeadSource.choices, default=LeadSource.OTHER
    )
    note = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=LeadStatus.choices, default=LeadStatus.NEW
    )
    next_follow_up_at = models.DateTimeField(null=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leads",
    )

    objects = LeadQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["updated_at"]),
            models.Index(fields=["next_follow_up_at"]),
        ]
        constraints = [
            # At least one of email or phone must be provided (defense in depth;
            # the serializer returns a friendly 400 before this ever trips).
            models.CheckConstraint(
                condition=~models.Q(email="") | ~models.Q(phone=""),
                name="lead_email_or_phone_required",
            ),
            # No duplicate phone per owner (only when a phone is set).
            models.UniqueConstraint(
                fields=["owner", "phone"],
                condition=~models.Q(phone=""),
                name="uniq_owner_phone",
            ),
            # No duplicate email per owner, case-insensitive (only when set).
            models.UniqueConstraint(
                "owner",
                Lower("email"),
                condition=~models.Q(email=""),
                name="uniq_owner_email_ci",
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def is_overdue(self) -> bool:
        """Follow-up is in the past and the lead is still open."""
        if not self.next_follow_up_at or self.status in {
            LeadStatus.WON,
            LeadStatus.LOST,
        }:
            return False
        return self.next_follow_up_at < timezone.now()

    @property
    def is_due_today(self) -> bool:
        """Follow-up falls on today's date (server timezone)."""
        if not self.next_follow_up_at:
            return False
        return timezone.localtime(self.next_follow_up_at).date() == timezone.localdate()

    @property
    def is_stale(self) -> bool:
        """Mirror of LeadQuerySet.stale() for a single loaded row.

        Reads only fields already on the instance (no extra query), so it is
        safe on create/update responses where the object isn't from a queryset.
        """
        if self.status in {LeadStatus.WON, LeadStatus.LOST}:
            return False
        now = timezone.now()
        if self.updated_at >= now - timedelta(days=settings.STALE_LEAD_DAYS):
            return False
        if self.next_follow_up_at and self.next_follow_up_at >= now:
            return False
        return True
