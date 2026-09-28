from rest_framework import serializers

from apps.leads.models import LeadActivity


class LeadActivitySerializer(serializers.ModelSerializer):
    """Read representation of a lead activity (timeline)."""

    class Meta:
        model = LeadActivity
        fields = [
            "id",
            "type",
            "field",
            "old_value",
            "new_value",
            "user",
            "created_at",
        ]
