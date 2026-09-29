from rest_framework import status

from apps.leads.models import Lead

from .base import LeadAPITestCase


class LeadDuplicateTests(LeadAPITestCase):
    def test_duplicate_phone_different_formatting_is_409(self):
        Lead.objects.create(owner=self.owner, name="Aziz", phone="+998901234567")
        resp = self.client.post(
            "/api/v1/leads/",
            {"name": "Aziz again", "phone": "+998 90 123-45-67"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(resp.data["error"]["code"], "duplicate_lead")
        self.assertEqual(resp.data["error"]["details"]["field"], "phone")

    def test_duplicate_email_different_case_is_409(self):
        Lead.objects.create(owner=self.owner, name="Dilnoza", email="dilnoza@example.com")
        resp = self.client.post(
            "/api/v1/leads/",
            {"name": "Dup", "email": "DILNOZA@example.com"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(resp.data["error"]["details"]["field"], "email")

    def test_duplicate_email_across_owners_is_409(self):
        # Duplicates are company-wide: the same email under a different owner
        # still conflicts.
        other = self.make_user("other")
        Lead.objects.create(owner=other, name="Theirs", email="shared@example.com")
        resp = self.client.post(
            "/api/v1/leads/",
            {"name": "Mine", "email": "shared@example.com"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(resp.data["error"]["details"]["field"], "email")
