"""A single, consistent error envelope for the whole API.

Every error response looks like:

    {
        "error": {
            "code": "validation_error",
            "message": "Invalid input.",
            "details": { "phone": ["Enter a valid phone number."] }
        }
    }
"""

from django.conf import settings
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    # Non-DRF exception: DRF returns None and it would become a 500.
    if response is None:
        if settings.DEBUG:
            # Let Django surface the real traceback while developing.
            return None
        return Response(
            {
                "error": {
                    "code": "server_error",
                    "message": "A server error occurred.",
                    "details": {},
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(exc, ValidationError):
        code = "validation_error"
        message = "Invalid input."
        details = response.data  # { field: [messages] }
    else:
        code = getattr(exc, "default_code", "error")
        detail = response.data
        if isinstance(detail, dict):
            if "detail" in detail:
                message = str(detail["detail"])
                details = {}
            else:
                # A structured payload (e.g. duplicate lead info) — expose it.
                message = str(getattr(exc, "default_detail", "Error."))
                details = detail
        elif isinstance(detail, list):
            message = str(detail[0]) if detail else "Error."
            details = {}
        else:
            message = str(detail)
            details = {}

    response.data = {"error": {"code": code, "message": message, "details": details}}
    return response
