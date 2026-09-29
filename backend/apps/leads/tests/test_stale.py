from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework import status

from apps.leads.models import Lead

from .base import LeadAPITestCase

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


class LeadStaleApiTests(LeadAPITestCase):
    """API-level stale behaviour (owner has the Sales role from the base case)."""

    def _aged_lead(self, email, status="new", days_ago=10, follow_up=None):
        lead = Lead.objects.create(
            owner=self.owner, name="X", email=email, status=status,
            next_follow_up_at=follow_up,
        )
        Lead.objects.filter(pk=lead.pk).update(
            updated_at=timezone.now() - timedelta(days=days_ago)
        )
        return lead

    def test_stale_filter_and_stats_agree(self):
        stale = self._aged_lead("old@example.com", days_ago=8)
        Lead.objects.create(owner=self.owner, name="Fresh", email="new@example.com")

        resp = self.client.get("/api/v1/leads/?stale=true")
        self.assertEqual([r["id"] for r in resp.data["data"]], [stale.id])

        stats = self.client.get("/api/v1/leads/stats/")
        self.assertEqual(stats.data["stale"], 1)

    def test_recently_updated_lead_not_stale(self):
        self._aged_lead("recent@example.com", days_ago=3)
        resp = self.client.get("/api/v1/leads/?stale=true")
        self.assertEqual(resp.data["meta"]["total"], 0)

    def test_won_lead_not_stale(self):
        self._aged_lead("won@example.com", status="won", days_ago=20)
        resp = self.client.get("/api/v1/leads/?stale=true")
        self.assertEqual(resp.data["meta"]["total"], 0)

    def test_future_followup_not_stale_past_is_stale(self):
        self._aged_lead(
            "future@example.com", follow_up=timezone.now() + timedelta(days=3)
        )
        stale = self._aged_lead(
            "past@example.com", follow_up=timezone.now() - timedelta(days=1)
        )
        resp = self.client.get("/api/v1/leads/?stale=true")
        self.assertEqual([r["id"] for r in resp.data["data"]], [stale.id])

    def test_editing_removes_stale(self):
        lead = self._aged_lead("edit@example.com", days_ago=10)
        self.assertTrue(Lead.objects.stale().filter(pk=lead.pk).exists())

        resp = self.client.patch(
            f"/api/v1/leads/{lead.id}/", {"name": "Touched"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        resp = self.client.get("/api/v1/leads/?stale=true")
        self.assertEqual(resp.data["meta"]["total"], 0)

    @override_settings(STALE_LEAD_DAYS=30)
    def test_stale_threshold_override(self):
        # 10 days old is not stale when the threshold is 30 days.
        self._aged_lead("t@example.com", days_ago=10)
        resp = self.client.get("/api/v1/leads/?stale=true")
        self.assertEqual(resp.data["meta"]["total"], 0)
