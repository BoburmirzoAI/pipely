from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model.

    Kept intentionally close to Django's default (username-based login) but
    with a unique email, so it can safely be extended later without another
    painful user-model swap.
    """

    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username
