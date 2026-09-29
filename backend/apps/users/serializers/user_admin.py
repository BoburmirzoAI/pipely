from rest_framework import serializers

from apps.users.models import Role, User


class UserAdminSerializer(serializers.ModelSerializer):
    """Read representation of a user for the Users management list."""

    roles = serializers.SlugRelatedField(slug_field="name", many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "roles",
        ]


class UserAdminUpdateSerializer(serializers.Serializer):
    """Update a user's roles and/or active state (rbac.manage)."""

    role_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    is_active = serializers.BooleanField(required=False)

    def validate_role_ids(self, value):
        known = set(Role.objects.filter(pk__in=value).values_list("pk", flat=True))
        unknown = [rid for rid in value if rid not in known]
        if unknown:
            raise serializers.ValidationError(f"Unknown role ids: {unknown}")
        return value
