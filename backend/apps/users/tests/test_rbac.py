from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import Role

User = get_user_model()
PW = "StrongPass123!"


class RbacTests(APITestCase):
    def setUp(self):
        cache.clear()

    def make(self, username, role):
        user = User.objects.create_user(username, f"{username}@example.com", PW)
        user.roles.add(Role.objects.get(name=role))
        return user

    def auth(self, user):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"username": user.username, "password": PW},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def test_sales_cannot_access_roles(self):
        self.auth(self.make("sales", "Sales"))
        resp = self.client.get("/api/v1/roles/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_registered_user_gets_sales_role(self):
        resp = self.client.post(
            "/api/v1/auth/register/",
            {"username": "newbie", "email": "new@example.com", "password": PW},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("Sales", resp.data["roles"])

    def test_system_role_cannot_be_deleted(self):
        self.auth(self.make("admin", "Admin"))
        sales = Role.objects.get(name="Sales")
        resp = self.client.delete(f"/api/v1/roles/{sales.id}/")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_role_in_use_cannot_be_deleted(self):
        self.auth(self.make("admin", "Admin"))
        created = self.client.post(
            "/api/v1/roles/",
            {"name": "Custom", "permission_codes": ["leads.view"]},
            format="json",
        )
        role_id = created.data["id"]
        user = self.make("someone", "Sales")
        user.roles.add(Role.objects.get(pk=role_id))

        resp = self.client.delete(f"/api/v1/roles/{role_id}/")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_admin_role_permissions_cannot_be_edited(self):
        self.auth(self.make("admin", "Admin"))
        admin_role = Role.objects.get(name="Admin")
        resp = self.client.patch(
            f"/api/v1/roles/{admin_role.id}/",
            {"permission_codes": ["leads.view"]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_last_admin_cannot_lose_admin_role(self):
        admin = self.make("admin", "Admin")
        self.auth(admin)
        sales = Role.objects.get(name="Sales")
        resp = self.client.patch(
            f"/api/v1/users/{admin.id}/", {"role_ids": [sales.id]}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_user_cannot_deactivate_self(self):
        admin = self.make("admin", "Admin")
        self.auth(admin)
        resp = self.client.patch(
            f"/api/v1/users/{admin.id}/", {"is_active": False}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
