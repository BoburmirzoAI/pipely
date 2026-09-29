from django.contrib.auth.models import AbstractUser
from django.db import models

from .permission import Permission


class User(AbstractUser):
    """Custom user model.

    Username-based login with a unique email, plus role-based permissions
    (our own RBAC — is_superuser does not bypass it).
    """

    email = models.EmailField(unique=True)
    roles = models.ManyToManyField("users.Role", related_name="users", blank=True)

    def __str__(self):
        return self.username

    def get_permission_codes(self) -> set[str]:
        """All permission codes granted by this user's roles (union).

        Loaded with one query and cached on the instance for the request.
        """
        if not hasattr(self, "_permission_codes"):
            self._permission_codes = set(
                Permission.objects.filter(roles__users=self)
                .values_list("code", flat=True)
                .distinct()
            )
        return self._permission_codes
