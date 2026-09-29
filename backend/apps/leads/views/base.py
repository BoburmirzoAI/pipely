from django.shortcuts import get_object_or_404

from apps.leads.models import Lead


def get_owned_lead(request, pk):
    """Fetch a lead owned by the requester, or 404.

    Filtering by owner means another user's lead is indistinguishable from a
    missing one — a 404, never a 403 (don't reveal that it exists).
    """
    return get_object_or_404(
        Lead.objects.visible_to(request.user).select_related("owner"), pk=pk
    )
