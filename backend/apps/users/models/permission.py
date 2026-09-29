from django.db import models


class Permission(models.Model):
    """An app permission code (our own, not django.contrib.auth.Permission).

    Always import explicitly as ``apps.users.models.Permission`` to avoid
    confusion with Django's built-in Permission model.
    """

    code = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return self.code
