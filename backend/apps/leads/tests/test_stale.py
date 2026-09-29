from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.leads.models import Lead

User = get_user_model()


class LeadStateConsistencyTests(TestCase):
    """The is_stale / is_overdue properties must agree with the queryset methods.

    They share the same rules (apps/leads/rules.py); this guards against them
    ever drifting apart.
    """

    def test_properties_match_queryset(self):
        owner = User.objects.create_user("owner", "owner@example.com", "StrongPass123!")
        now = timezone.now()

        statuses = ["new", "won"]
        updated_ages = [1, 10]  # days ago (recent vs older than the 7-day default)
        follow_ups = [None, now - timedelta(days=1), now + timedelta(days=1)]  # none/past/future

        i = 0
        for st in statuses:
            for age in updated_ages:
                for fu in follow_ups:
                    i += 1
                    lead = Lead.objects.create(
                        owner=owner,
                        name=f"L{i}",
                        email=f"l{i}@example.com",
                        status=st,
                        next_follow_up_at=fu,
                    )
                    # updated_at is auto_now; force it to the desired age.
                    Lead.objects.filter(pk=lead.pk).update(
                        updated_at=now - timedelta(days=age)
                    )

        for lead in Lead.objects.all():
            self.assertEqual(
                lead.is_stale,
                Lead.objects.stale().filter(pk=lead.pk).exists(),
                msg=f"is_stale mismatch for lead {lead.pk}",
            )
            self.assertEqual(
                lead.is_overdue,
                Lead.objects.overdue().filter(pk=lead.pk).exists(),
                msg=f"is_overdue mismatch for lead {lead.pk}",
            )
