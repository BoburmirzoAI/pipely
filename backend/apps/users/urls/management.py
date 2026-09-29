from django.urls import path

from apps.users.views import (
    PermissionsListView,
    RoleDetailView,
    RolesListCreateView,
    UserDetailView,
    UsersListView,
)

# Mounted under /api/v1/ (see config/urls.py).
urlpatterns = [
    path("users/", UsersListView.as_view(), name="users-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("roles/", RolesListCreateView.as_view(), name="roles-list"),
    path("roles/<int:pk>/", RoleDetailView.as_view(), name="role-detail"),
    path("permissions/", PermissionsListView.as_view(), name="permissions-list"),
]
