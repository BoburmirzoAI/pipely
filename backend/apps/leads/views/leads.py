from django.db.models import Q
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status as http_status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.pagination import StandardResultsSetPagination
from apps.leads import services
from apps.leads.filters import LeadFilter
from apps.leads.models import Lead
from apps.leads.serializers import LeadSerializer, LeadWriteSerializer

from .base import get_owned_lead

ORDERING_FIELDS = {
    "created_at",
    "-created_at",
    "name",
    "-name",
    "status",
    "-status",
    "updated_at",
    "-updated_at",
    "next_follow_up_at",
    "-next_follow_up_at",
}

LIST_PARAMS = [
    OpenApiParameter("search", OpenApiTypes.STR, description="Match on name, email, phone"),
    OpenApiParameter("status", OpenApiTypes.STR, many=True, description="Filter by status (repeatable)"),
    OpenApiParameter("source", OpenApiTypes.STR, description="Filter by source"),
    OpenApiParameter("owner", OpenApiTypes.INT, description="Filter by owner id (needs leads.view_all)"),
    OpenApiParameter("follow_up", OpenApiTypes.STR, enum=["overdue", "today", "upcoming", "none"]),
    OpenApiParameter("stale", OpenApiTypes.BOOL, description="Only stale (true) or non-stale (false) leads"),
    OpenApiParameter("ordering", OpenApiTypes.STR, enum=sorted(ORDERING_FIELDS)),
    OpenApiParameter("page", OpenApiTypes.INT),
    OpenApiParameter("page_size", OpenApiTypes.INT, description="Max 100"),
]


class LeadListCreateView(APIView):
    """GET /api/leads/ (list, filtered + paginated) and POST /api/leads/ (create)."""

    required_permissions = {"GET": "leads.view", "POST": "leads.create"}

    @extend_schema(parameters=LIST_PARAMS, responses={200: LeadSerializer(many=True)})
    def get(self, request):
        qs = Lead.objects.visible_to(request.user).select_related("owner")
        qs = LeadFilter(request.GET, queryset=qs, request=request).qs

        search = request.GET.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )

        ordering = request.GET.get("ordering")
        qs = qs.order_by(ordering if ordering in ORDERING_FIELDS else "-created_at")

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        data = LeadSerializer(page, many=True).data
        return paginator.get_paginated_response(data)

    @extend_schema(request=LeadWriteSerializer, responses={201: LeadSerializer})
    def post(self, request):
        serializer = LeadWriteSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        lead = services.create_lead(request.user, serializer.validated_data)
        return Response(
            LeadSerializer(lead).data, status=http_status.HTTP_201_CREATED
        )


class LeadDetailView(APIView):
    """GET / PATCH / DELETE on /api/leads/{id}/ (status is a separate endpoint)."""

    required_permissions = {
        "GET": "leads.view",
        "PATCH": "leads.update",
        "DELETE": "leads.delete",
    }

    @extend_schema(responses={200: LeadSerializer})
    def get(self, request, pk):
        lead = get_owned_lead(request, pk)
        return Response(LeadSerializer(lead).data)

    @extend_schema(request=LeadWriteSerializer, responses={200: LeadSerializer})
    def patch(self, request, pk):
        lead = get_owned_lead(request, pk)
        serializer = LeadWriteSerializer(
            instance=lead,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        lead = services.update_lead(lead, request.user, serializer.validated_data)
        return Response(LeadSerializer(lead).data)

    @extend_schema(responses={204: None})
    def delete(self, request, pk):
        lead = get_owned_lead(request, pk)
        lead.delete()
        return Response(status=http_status.HTTP_204_NO_CONTENT)
