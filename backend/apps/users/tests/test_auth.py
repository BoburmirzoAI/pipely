from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_then_login_returns_tokens(self):
        resp = self.client.post(
            "/api/v1/auth/register/",
            {"username": "ali", "email": "ali@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["username"], "ali")
        self.assertNotIn("password", resp.data)

        resp = self.client.post(
            "/api/v1/auth/login/",
            {"username": "ali", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_register_weak_password_returns_400(self):
        resp = self.client.post(
            "/api/v1/auth/register/",
            {"username": "weak", "email": "weak@example.com", "password": "123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resp.data["error"]["code"], "validation_error")

    def test_me_requires_authentication(self):
        resp = self.client.get("/api/v1/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        User.objects.create_user(
            username="ali", email="ali@example.com", password="StrongPass123!"
        )
        login = self.client.post(
            "/api/v1/auth/login/",
            {"username": "ali", "password": "StrongPass123!"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        resp = self.client.get("/api/v1/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["email"], "ali@example.com")
