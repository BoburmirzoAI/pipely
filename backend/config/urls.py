"""Root URL configuration for the Pipely project."""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # API endpoints (versioned under /api/v1/)
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/leads/", include("apps.leads.urls")),
    # OpenAPI schema + Swagger UI:
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
