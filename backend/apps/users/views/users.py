from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import Conflict
from apps.core.pagination import StandardResultsSetPagination
from apps.users.models import Role, User
from apps.users.serializers import UserAdminSerializer, UserAdminUpdateSerializer


def is_last_active_admin(user):
    """True if this user is the only active user holding the Admin role."""
    others = User.objects.filter(is_active=True, roles__name="Admin").exclude(pk=user.pk)
    return not others.exists()


class UsersListView(APIView):
    """GET /api/v1/users/ — paginated user list (users.view)."""

    required_permissions = {"GET": "users.view"}

    @extend_schema(
        parameters=[OpenApiParameter("search", OpenApiTypes.STR)],
        responses={200: UserAdminSerializer(many=True)},
    )
    def get(self, request):
        qs = User.objects.prefetch_related("roles").order_by("id")
        search = request.GET.get("search")
        if search:
            qs = qs.filter(Q(username__icontains=search) | Q(email__icontains=search))

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(
            UserAdminSerializer(page, many=True).data
        )


class UserDetailView(APIView):
    """PATCH /api/v1/users/{id}/ — set roles / active state (rbac.manage)."""

    required_permissions = {"PATCH": "rbac.manage"}

    @extend_schema(
        request=UserAdminUpdateSerializer, responses={200: UserAdminSerializer}
    )
    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserAdminUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # A user cannot deactivate themselves.
        if data.get("is_active") is False and user.pk == request.user.pk:
            raise ValidationError({"is_active": ["You cannot deactivate yourself."]})

        # The last active Admin cannot lose the Admin role or be deactivated.
        new_active = data.get("is_active", user.is_active)
        if "role_ids" in data:
            new_role_names = set(
                Role.objects.filter(pk__in=data["role_ids"]).values_list(
                    "name", flat=True
                )
            )
        else:
            new_role_names = set(user.roles.values_list("name", flat=True))

        currently_admin = user.is_active and user.roles.filter(name="Admin").exists()
        stays_admin = new_active and "Admin" in new_role_names
        if currently_admin and not stays_admin and is_last_active_admin(user):
            raise Conflict(
                "The last active Admin cannot lose the Admin role or be deactivated."
            )

        with transaction.atomic():
            if "role_ids" in data:
                user.roles.set(data["role_ids"])
            if "is_active" in data:
                user.is_active = data["is_active"]
                user.save(update_fields=["is_active"])

        return Response(UserAdminSerializer(user).data)
