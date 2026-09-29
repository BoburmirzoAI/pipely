from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.leads import services
from apps.leads.serializers import LeadSerializer, LeadStatusSerializer

from .base import get_owned_lead


class LeadStatusView(APIView):
    """PATCH /api/leads/{id}/status/ — a distinct business action with its own
    activity type; keeps the general update endpoint simple."""

    required_permissions = {"PATCH": "leads.update_status"}

    @extend_schema(request=LeadStatusSerializer, responses={200: LeadSerializer})
    def patch(self, request, pk):
        lead = get_owned_lead(request, pk)
        serializer = LeadStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = services.change_status(
            lead, request.user, serializer.validated_data["status"]
        )
        return Response(LeadSerializer(lead).data)
