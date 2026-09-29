from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()

PASSWORD = "StrongPass123!"


class LeadAPITestCase(APITestCase):
    """Base case with a primary owner already authenticated."""

    def setUp(self):
        self.owner = User.objects.create_user("owner", "owner@example.com", PASSWORD)
        self.authenticate(self.owner)

    def make_user(self, username):
        return User.objects.create_user(username, f"{username}@example.com", PASSWORD)

    def authenticate(self, user):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"username": user.username, "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def logout(self):
        self.client.credentials()
