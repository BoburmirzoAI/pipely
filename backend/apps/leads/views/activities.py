from rest_framework.response import Response
from rest_framework.views import APIView

from apps.leads.serializers import LeadActivitySerializer

from .base import get_owned_lead


class LeadActivitiesView(APIView):
    """GET /api/leads/{id}/activities/ — the lead's activity timeline."""

    def get(self, request, pk):
        lead = get_owned_lead(request, pk)
        activities = lead.activities.all()
        return Response(LeadActivitySerializer(activities, many=True).data)
