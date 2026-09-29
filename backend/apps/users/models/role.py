from django.db import models


class Role(models.Model):
    """A named set of permissions. System roles are locked (see safety rules)."""

    name = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=255, blank=True)
    permissions = models.ManyToManyField(
        "users.Permission", related_name="roles", blank=True
    )
    is_system = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
