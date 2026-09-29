"""Action-based RBAC permission."""

from rest_framework.permissions import BasePermission


class HasActionPermission(BasePermission):
    """Allow a request only if the user holds the view's required permission.

    A view declares an HTTP-method -> permission-code map:

        required_permissions = {
            "GET": "leads.view",
            "POST": "leads.create",
        }

    Rules:
    - No map on the view -> not permission-gated (e.g. auth/me). Allowed.
    - A method not in the map -> denied by default (403).
    - Otherwise the user must hold the mapped code (via their roles).

    This class never imports the users app; it only calls the duck-typed
    ``request.user.get_permission_codes()``.
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        required = getattr(view, "required_permissions", None)
        if not required:
            return True
        if request.method == "OPTIONS":
            return True  # allow CORS/metadata preflight
        code = required.get(request.method)
        if code is None:
            return False  # deny by default: anything not mapped
        return code in request.user.get_permission_codes()
