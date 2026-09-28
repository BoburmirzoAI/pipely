"""Reusable permission classes."""

from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Object-level permission: only the object's owner may access it.

    Note: the primary ownership guard in this project is queryset filtering
    (each user only ever queries their own rows, so someone else's object
    surfaces as a 404, never a 403). This class is a defensive second layer
    for any view that operates on an object fetched outside that filter.
    """

    def has_object_permission(self, request, view, obj):
        return getattr(obj, "owner_id", None) == request.user.id
