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
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException, Throttled, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


class DuplicateLead(APIException):
    """409 raised when a lead with the same email/phone already exists (per owner)."""

    status_code = status.HTTP_409_CONFLICT
    default_code = "duplicate_lead"

    def __init__(self, field, existing_lead):
        # Keep raw values on the exception so the handler can emit a numeric id
        # (DRF would stringify anything passed through `detail`).
        self.field = field
        self.existing_lead = {"id": existing_lead.id, "name": existing_lead.name}
        self.default_detail = f"A lead with this {field} already exists."
        super().__init__(detail=self.default_detail)


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

    if isinstance(exc, DuplicateLead):
        code = exc.default_code
        message = str(exc.default_detail)
        details = {"field": exc.field, "existing_lead": exc.existing_lead}
    elif isinstance(exc, Http404):
        # Don't leak which model/query missed (ownership 404s stay opaque).
        code = "not_found"
        message = "Not found."
        details = {}
    elif isinstance(exc, Throttled):
        code = "rate_limited"
        message = "Too many requests. Please try again later."
        details = {}
    elif isinstance(exc, ValidationError):
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
