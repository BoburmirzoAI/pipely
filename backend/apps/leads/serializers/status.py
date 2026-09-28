from rest_framework import serializers

from apps.leads.models import LeadStatus


class LeadStatusSerializer(serializers.Serializer):
    """Input for the dedicated status-change endpoint."""

    status = serializers.ChoiceField(choices=LeadStatus.choices)
