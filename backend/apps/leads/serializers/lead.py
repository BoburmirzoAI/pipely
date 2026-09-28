from rest_framework import serializers

from apps.leads.models import Lead


class LeadSerializer(serializers.ModelSerializer):
    """Read representation of a lead (list + detail).

    Plain field mapping with two derived follow-up flags, so it stays a
    ModelSerializer; the write path (validation, normalization) is the base
    Serializer in write.py.
    """

    is_overdue = serializers.ReadOnlyField()
    is_due_today = serializers.ReadOnlyField()

    class Meta:
        model = Lead
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "source",
            "note",
            "status",
            "next_follow_up_at",
            "is_overdue",
            "is_due_today",
            "created_at",
            "updated_at",
        ]
