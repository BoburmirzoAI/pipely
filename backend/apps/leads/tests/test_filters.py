from datetime import timedelta

from django.utils import timezone
from rest_framework import status

from apps.leads.models import Lead

from .base import LeadAPITestCase


class LeadFilterTests(LeadAPITestCase):
    def test_search_and_status_filter(self):
        Lead.objects.create(owner=self.owner, name="Aziz Karimov", email="aziz@example.com", status="new")
        Lead.objects.create(owner=self.owner, name="Bek", email="bek@example.com", status="contacted")
        Lead.objects.create(owner=self.owner, name="Dilnoza", phone="+998900000000", status="new")

        resp = self.client.get("/api/leads/?search=aziz")
        self.assertEqual(resp.data["meta"]["total"], 1)
        self.assertEqual(resp.data["data"][0]["name"], "Aziz Karimov")

        resp = self.client.get("/api/leads/?status=new")
        self.assertEqual(resp.data["meta"]["total"], 2)

    def test_past_follow_up_is_rejected(self):
        past = (timezone.now() - timedelta(days=1)).isoformat()
        resp = self.client.post(
            "/api/leads/",
            {"name": "Aziz", "email": "a@example.com", "next_follow_up_at": past},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("next_follow_up_at", resp.data["error"]["details"])

    def test_follow_up_overdue_returns_only_open_overdue(self):
        past = timezone.now() - timedelta(days=1)
        future = timezone.now() + timedelta(days=1)
        # Overdue + open -> should appear
        overdue = Lead.objects.create(
            owner=self.owner, name="Overdue", email="o@example.com",
            next_follow_up_at=past, status="new",
        )
        # Overdue but closed -> excluded
        Lead.objects.create(
            owner=self.owner, name="Closed", email="c@example.com",
            next_follow_up_at=past, status="won",
        )
        # Upcoming -> excluded
        Lead.objects.create(
            owner=self.owner, name="Future", email="f@example.com",
            next_follow_up_at=future, status="new",
        )

        resp = self.client.get("/api/leads/?follow_up=overdue")
        ids = [row["id"] for row in resp.data["data"]]
        self.assertEqual(ids, [overdue.id])
