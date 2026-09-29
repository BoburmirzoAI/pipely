from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.serializers import ChangePasswordSerializer


class ChangePasswordView(APIView):
    """POST /api/v1/auth/change-password/ — change the current user's password."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ChangePasswordSerializer,
        responses=inline_serializer(
            "ChangePasswordResponse", {"detail": serializers.CharField()}
        ),
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."})
