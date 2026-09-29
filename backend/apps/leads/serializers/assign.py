from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class LeadAssignSerializer(serializers.Serializer):
    """Input for the assign endpoint: the new owner's id (must be active)."""

    owner_id = serializers.IntegerField()

    def validate_owner_id(self, value):
        if not User.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError("No active user with this id.")
        return value
