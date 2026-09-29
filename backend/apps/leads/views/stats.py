from django.db.models import Count
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.leads.models import Lead, LeadStatus


class LeadStatsView(APIView):
    """GET /api/leads/stats/ — dashboard numbers for the current user."""

    required_permissions = {"GET": "stats.view"}

    @extend_schema(
        responses=inline_serializer(
            "LeadStats",
            {
                "total": serializers.IntegerField(),
                "by_status": serializers.JSONField(),
                "conversion_rate": serializers.FloatField(allow_null=True),
                "follow_ups": serializers.JSONField(),
                "stale": serializers.IntegerField(),
            },
        )
    )
    def get(self, request):
        qs = Lead.objects.visible_to(request.user)

        by_status = {choice.value: 0 for choice in LeadStatus}
        for row in qs.values("status").annotate(count=Count("id")):
            by_status[row["status"]] = row["count"]

        total = sum(by_status.values())
        won, lost = by_status["won"], by_status["lost"]
        conversion_rate = round(won / (won + lost), 2) if (won + lost) else None

        follow_ups = {
            "overdue": qs.overdue().count(),
            "today": qs.due_today().count(),
            "upcoming": qs.upcoming().count(),
        }

        return Response(
            {
                "total": total,
                "by_status": by_status,
                "conversion_rate": conversion_rate,
                "follow_ups": follow_ups,
                "stale": qs.stale().count(),
            }
        )
