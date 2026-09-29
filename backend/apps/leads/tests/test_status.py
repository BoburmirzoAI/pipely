from datetime import timedelta

from django.utils import timezone
from rest_framework import status

from apps.leads.models import Lead, LeadActivity

from .base import LeadAPITestCase


class LeadStatusTests(LeadAPITestCase):
    def test_status_change_writes_activity(self):
        lead = Lead.objects.create(owner=self.owner, name="Aziz", email="a@example.com")
        resp = self.client.patch(
            f"/api/v1/leads/{lead.id}/status/", {"status": "contacted"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], "contacted")
        self.assertTrue(
            LeadActivity.objects.filter(
                lead=lead,
                type=LeadActivity.Type.STATUS_CHANGED,
                old_value="new",
                new_value="contacted",
            ).exists()
        )

    def test_status_won_clears_follow_up(self):
        future = timezone.now() + timedelta(days=3)
        lead = Lead.objects.create(
            owner=self.owner, name="Aziz", email="a@example.com", next_follow_up_at=future
        )
        resp = self.client.patch(
            f"/api/v1/leads/{lead.id}/status/", {"status": "won"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsNone(resp.data["next_follow_up_at"])
        lead.refresh_from_db()
        self.assertIsNone(lead.next_follow_up_at)
