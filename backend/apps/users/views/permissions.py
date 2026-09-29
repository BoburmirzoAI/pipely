from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Permission
from apps.users.serializers import PermissionSerializer


class PermissionsListView(APIView):
    """GET /api/v1/permissions/ — all permission codes (rbac.manage)."""

    required_permissions = {"GET": "rbac.manage"}

    @extend_schema(responses={200: PermissionSerializer(many=True)})
    def get(self, request):
        perms = Permission.objects.all()
        return Response(PermissionSerializer(perms, many=True).data)
