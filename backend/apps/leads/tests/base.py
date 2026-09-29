from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase

from apps.users.models import Role

User = get_user_model()

PASSWORD = "StrongPass123!"


class LeadAPITestCase(APITestCase):
    """Base case with a primary owner (Sales role) already authenticated."""

    def setUp(self):
        cache.clear()  # reset throttle counters between tests
        self.owner = self.make_user("owner", role="Sales")
        self.authenticate(self.owner)

    def make_user(self, username, role=None):
        user = User.objects.create_user(username, f"{username}@example.com", PASSWORD)
        if role:
            user.roles.add(Role.objects.get(name=role))
        return user

    def authenticate(self, user):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"username": user.username, "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def logout(self):
        self.client.credentials()
