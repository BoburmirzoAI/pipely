from .activities import LeadActivitiesView
from .assign import LeadAssignView
from .duplicate import LeadCheckDuplicateView
from .leads import LeadDetailView, LeadListCreateView
from .stats import LeadStatsView
from .status import LeadStatusView

__all__ = [
    "LeadListCreateView",
    "LeadDetailView",
    "LeadStatusView",
    "LeadAssignView",
    "LeadCheckDuplicateView",
    "LeadActivitiesView",
    "LeadStatsView",
]
