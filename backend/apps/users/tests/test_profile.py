from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()
PW = "StrongPass123!"


class ProfileTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("me", "me@example.com", PW)
        login = self.client.post(
            "/api/v1/auth/login/",
            {"username": "me", "password": PW},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    def test_update_profile(self):
        resp = self.client.patch(
            "/api/v1/auth/me/", {"first_name": "Bobur"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["first_name"], "Bobur")

    def test_update_email_to_existing_is_400(self):
        User.objects.create_user("other", "taken@example.com", PW)
        resp = self.client.patch(
            "/api/v1/auth/me/", {"email": "TAKEN@example.com"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", resp.data["error"]["details"])

    def test_change_password_wrong_current_is_400(self):
        resp = self.client.post(
            "/api/v1/auth/change-password/",
            {"current_password": "wrong", "new_password": "NewStrong123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", resp.data["error"]["details"])

    def test_change_password_success(self):
        resp = self.client.post(
            "/api/v1/auth/change-password/",
            {"current_password": PW, "new_password": "NewStrong456!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        login = self.client.post(
            "/api/v1/auth/login/",
            {"username": "me", "password": "NewStrong456!"},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
