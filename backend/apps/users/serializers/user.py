from rest_framework import serializers

from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    """Read representation of a user, including effective roles and permissions."""

    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

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
            "permissions",
            "date_joined",
        ]
        read_only_fields = fields

    def get_roles(self, obj):
        return [role.name for role in obj.roles.all()]

    def get_permissions(self, obj):
        return sorted(obj.get_permission_codes())
