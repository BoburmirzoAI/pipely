from django.utils import timezone
from rest_framework import serializers

from apps.core.exceptions import DuplicateLead
from apps.leads.models import LeadSource
from apps.leads.services import duplicates
from apps.leads.services.phone import validate_and_normalize_phone


class LeadWriteSerializer(serializers.Serializer):
    """Create/update input for a lead.

    Base ``Serializer`` (not ModelSerializer) for full control over every
    field, the cross-field rule, phone normalization and duplicate detection.
    Status is intentionally excluded — it has its own endpoint.
    """

    name = serializers.CharField(max_length=255)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    source = serializers.ChoiceField(choices=LeadSource.choices, required=False)
    note = serializers.CharField(required=False, allow_blank=True)
    next_follow_up_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("This field may not be blank.")
        return value

    def validate_phone(self, value):
        return validate_and_normalize_phone(value)

    def validate_next_follow_up_at(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError(
                "Follow-up date cannot be in the past."
            )
        return value

    def _effective(self, attrs, field):
        """Value after applying this change on top of the existing instance."""
        if field in attrs:
            return attrs[field]
        if self.instance is not None:
            return getattr(self.instance, field)
        return ""

    def validate(self, attrs):
        email = self._effective(attrs, "email") or ""
        phone = self._effective(attrs, "phone") or ""

        # At least one contact channel is required.
        if not email and not phone:
            raise serializers.ValidationError(
                {"non_field_errors": ["Provide at least one of email or phone."]}
            )

        # Friendly duplicate check (per owner). The DB constraint is the net.
        owner = self.context["request"].user
        exclude_id = self.instance.id if self.instance is not None else None
        lead, field = duplicates.find_duplicate(
            owner, email=email, phone=phone, exclude_id=exclude_id
        )
        if lead:
            raise DuplicateLead(field, lead)

        return attrs
