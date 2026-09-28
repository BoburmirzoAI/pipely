from rest_framework import status

from apps.leads.models import Lead

from .base import LeadAPITestCase


class LeadCrudTests(LeadAPITestCase):
    def test_list_requires_authentication(self):
        self.logout()
        resp = self.client.get("/api/leads/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_valid_lead(self):
        resp = self.client.post(
            "/api/leads/",
            {"name": "Aziz", "phone": "+998 90 123-45-67"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        # phone stored normalized
        self.assertEqual(resp.data["phone"], "+998901234567")
        self.assertEqual(Lead.objects.count(), 1)

    def test_create_without_email_and_phone_is_400(self):
        resp = self.client.post("/api/leads/", {"name": "NoContact"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", resp.data["error"]["details"])

    def test_owner_cannot_see_another_users_lead(self):
        other = self.make_user("other")
        lead = Lead.objects.create(owner=other, name="Theirs", email="t@example.com")
        resp = self.client.get(f"/api/leads/{lead.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(resp.data["error"]["code"], "not_found")
