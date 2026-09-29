from django.conf import settings
from django.db import models


class LeadActivity(models.Model):
    """Audit trail: one row per meaningful change to a lead."""

    class Type(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        STATUS_CHANGED = "status_changed", "Status changed"
        ASSIGNED = "assigned", "Assigned"

    lead = models.ForeignKey(
        "leads.Lead", on_delete=models.CASCADE, related_name="activities"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="lead_activities",
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    field = models.CharField(max_length=64, blank=True)
    old_value = models.CharField(max_length=255, blank=True)
    new_value = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} on lead #{self.lead_id}"
