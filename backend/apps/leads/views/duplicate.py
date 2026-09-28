from rest_framework.response import Response
from rest_framework.views import APIView

from apps.leads.services import duplicates
from apps.leads.services.phone import normalize_phone


class LeadCheckDuplicateView(APIView):
    """GET /api/leads/check-duplicate/?email=&phone= — live check for the form.

    Normalizes the phone but does not validate it (this is a soft check while
    the user is still typing), and never 400s on partial input.
    """

    def get(self, request):
        email = request.GET.get("email", "").strip()
        phone = normalize_phone(request.GET.get("phone", ""))

        lead, field = duplicates.find_duplicate(request.user, email=email, phone=phone)
        if lead:
            return Response(
                {"duplicate": {"id": lead.id, "name": lead.name, "matched_on": field}}
            )
        return Response({"duplicate": None})
