from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.leads import services
from apps.leads.serializers import LeadAssignSerializer, LeadSerializer

from .base import get_owned_lead

User = get_user_model()


class LeadAssignView(APIView):
    """PATCH /api/v1/leads/{id}/assign/ — reassign a lead to another user."""

    required_permissions = {"PATCH": "leads.assign"}

    @extend_schema(request=LeadAssignSerializer, responses={200: LeadSerializer})
    def patch(self, request, pk):
        lead = get_owned_lead(request, pk)
        serializer = LeadAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_owner = User.objects.get(pk=serializer.validated_data["owner_id"])
        lead = services.assign_lead(lead, request.user, new_owner)
        return Response(LeadSerializer(lead).data)
