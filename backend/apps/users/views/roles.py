from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import Conflict
from apps.users.models import Permission, Role
from apps.users.serializers import RoleSerializer, RoleWriteSerializer


def _set_permissions(role, codes):
    role.permissions.set(Permission.objects.filter(code__in=codes))


class RolesListCreateView(APIView):
    """GET / POST /api/v1/roles/ (rbac.manage)."""

    required_permissions = {"GET": "rbac.manage", "POST": "rbac.manage"}

    @extend_schema(responses={200: RoleSerializer(many=True)})
    def get(self, request):
        roles = Role.objects.prefetch_related("permissions", "users").all()
        return Response(RoleSerializer(roles, many=True).data)

    @extend_schema(request=RoleWriteSerializer, responses={201: RoleSerializer})
    def post(self, request):
        serializer = RoleWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not data.get("name"):
            raise ValidationError({"name": ["This field is required."]})

        with transaction.atomic():
            role = Role.objects.create(
                name=data["name"],
                description=data.get("description", ""),
                is_system=False,
            )
            _set_permissions(role, data.get("permission_codes", []))
        return Response(RoleSerializer(role).data, status=status.HTTP_201_CREATED)


class RoleDetailView(APIView):
    """PATCH / DELETE /api/v1/roles/{id}/ (rbac.manage), with safety rules."""

    required_permissions = {"PATCH": "rbac.manage", "DELETE": "rbac.manage"}

    @extend_schema(request=RoleWriteSerializer, responses={200: RoleSerializer})
    def patch(self, request, pk):
        role = get_object_or_404(Role, pk=pk)
        serializer = RoleWriteSerializer(instance=role, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if role.is_system and "name" in data and data["name"] != role.name:
            raise Conflict("System roles cannot be renamed.")
        if role.name == "Admin" and "permission_codes" in data:
            raise Conflict("The Admin role's permissions cannot be edited.")

        with transaction.atomic():
            if "name" in data:
                role.name = data["name"]
            if "description" in data:
                role.description = data["description"]
            role.save()
            if "permission_codes" in data:
                _set_permissions(role, data["permission_codes"])
        return Response(RoleSerializer(role).data)

    @extend_schema(responses={204: None})
    def delete(self, request, pk):
        role = get_object_or_404(Role, pk=pk)
        if role.is_system:
            raise Conflict("System roles cannot be deleted.")
        if role.users.exists():
            raise Conflict("This role is assigned to users and cannot be deleted.")
        role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
