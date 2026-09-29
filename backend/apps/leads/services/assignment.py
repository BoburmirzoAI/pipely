"""Lead assignment (changing the owner)."""

from django.db import transaction

from apps.leads.models import LeadActivity


def assign_lead(lead, actor, new_owner):
    """Reassign a lead to another user, logging an 'assigned' activity."""
    if new_owner.id == lead.owner_id:
        return lead  # no-op

    old_owner = lead.owner
    with transaction.atomic():
        lead.owner = new_owner
        lead.save()
        LeadActivity.objects.create(
            lead=lead,
            user=actor,
            type=LeadActivity.Type.ASSIGNED,
            field="owner",
            old_value=str(old_owner),
            new_value=str(new_owner),
        )
    return lead
