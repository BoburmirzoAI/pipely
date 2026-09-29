from rest_framework import serializers

from apps.users.models import Permission, Role


class RoleSerializer(serializers.ModelSerializer):
    """Read representation of a role."""

    permissions = serializers.SlugRelatedField(
        slug_field="code", many=True, read_only=True
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ["id", "name", "description", "permissions", "is_system", "user_count"]

    def get_user_count(self, obj) -> int:
        return obj.users.count()


class RoleWriteSerializer(serializers.Serializer):
    """Create/update input for a role."""

    name = serializers.CharField(max_length=64, required=False)
    description = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )
    permission_codes = serializers.ListField(
        child=serializers.CharField(), required=False
    )

    def validate_permission_codes(self, value):
        known = set(Permission.objects.values_list("code", flat=True))
        unknown = [code for code in value if code not in known]
        if unknown:
            raise serializers.ValidationError(f"Unknown permission codes: {unknown}")
        return value

    def validate_name(self, value):
        qs = Role.objects.filter(name=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A role with this name already exists.")
        return value
