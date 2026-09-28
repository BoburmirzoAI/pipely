"""Helpers that write LeadActivity audit rows."""

from apps.leads.models import LeadActivity


def log_created(lead, user):
    LeadActivity.objects.create(
        lead=lead, user=user, type=LeadActivity.Type.CREATED
    )


def log_field_change(lead, user, field, old_value, new_value):
    LeadActivity.objects.create(
        lead=lead,
        user=user,
        type=LeadActivity.Type.UPDATED,
        field=field,
        old_value="" if old_value is None else str(old_value),
        new_value="" if new_value is None else str(new_value),
    )


def log_status_change(lead, user, old_status, new_status):
    LeadActivity.objects.create(
        lead=lead,
        user=user,
        type=LeadActivity.Type.STATUS_CHANGED,
        field="status",
        old_value=old_status,
        new_value=new_status,
    )
