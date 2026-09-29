from rest_framework import status

from apps.leads.models import Lead, LeadActivity

from .base import LeadAPITestCase


class LeadPermissionTests(LeadAPITestCase):
    """self.owner is authenticated with the Sales role (from the base case)."""

    def test_sales_cannot_see_others_lead_but_manager_can(self):
        other = self.make_user("other", role="Sales")
        lead = Lead.objects.create(owner=other, name="Theirs", email="t@example.com")

        # Sales without view_all -> out of scope -> 404
        resp = self.client.get(f"/api/v1/leads/{lead.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

        # Manager has view_all -> 200
        self.authenticate(self.make_user("manager", role="Manager"))
        resp = self.client.get(f"/api/v1/leads/{lead.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_sales_delete_forbidden_admin_allowed(self):
        lead = Lead.objects.create(owner=self.owner, name="X", email="x@example.com")

        resp = self.client.delete(f"/api/v1/leads/{lead.id}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data["error"]["code"], "permission_denied")

        self.authenticate(self.make_user("admin", role="Admin"))
        resp = self.client.delete(f"/api/v1/leads/{lead.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_sales_assign_forbidden_manager_allowed_and_logged(self):
        lead = Lead.objects.create(owner=self.owner, name="X", email="x@example.com")
        target = self.make_user("target", role="Sales")

        resp = self.client.patch(
            f"/api/v1/leads/{lead.id}/assign/", {"owner_id": target.id}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        self.authenticate(self.make_user("manager", role="Manager"))
        resp = self.client.patch(
            f"/api/v1/leads/{lead.id}/assign/", {"owner_id": target.id}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.owner_id, target.id)
        self.assertTrue(
            LeadActivity.objects.filter(
                lead=lead, type=LeadActivity.Type.ASSIGNED
            ).exists()
        )
