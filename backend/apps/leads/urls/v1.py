from django.urls import path

from apps.leads.views import (
    LeadActivitiesView,
    LeadAssignView,
    LeadCheckDuplicateView,
    LeadDetailView,
    LeadListCreateView,
    LeadStatsView,
    LeadStatusView,
)

# Mounted under /api/leads/ (see config/urls.py).
urlpatterns = [
    path("", LeadListCreateView.as_view(), name="lead-list"),
    path("stats/", LeadStatsView.as_view(), name="lead-stats"),
    path("check-duplicate/", LeadCheckDuplicateView.as_view(), name="lead-check-duplicate"),
    path("<int:pk>/", LeadDetailView.as_view(), name="lead-detail"),
    path("<int:pk>/status/", LeadStatusView.as_view(), name="lead-status"),
    path("<int:pk>/assign/", LeadAssignView.as_view(), name="lead-assign"),
    path("<int:pk>/activities/", LeadActivitiesView.as_view(), name="lead-activities"),
]
