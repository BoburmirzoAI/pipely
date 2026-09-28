from .activities import LeadActivitiesView
from .duplicate import LeadCheckDuplicateView
from .leads import LeadDetailView, LeadListCreateView
from .stats import LeadStatsView
from .status import LeadStatusView

__all__ = [
    "LeadListCreateView",
    "LeadDetailView",
    "LeadStatusView",
    "LeadCheckDuplicateView",
    "LeadActivitiesView",
    "LeadStatsView",
]
