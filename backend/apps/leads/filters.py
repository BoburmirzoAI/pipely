import django_filters

from apps.leads.models import Lead, LeadSource, LeadStatus


class LeadFilter(django_filters.FilterSet):
    """Query filters for the lead list.

    - status: exact, repeatable (?status=new&status=contacted)
    - source: exact
    - follow_up: overdue / today / upcoming / none
    """

    status = django_filters.MultipleChoiceFilter(choices=LeadStatus.choices)
    source = django_filters.ChoiceFilter(choices=LeadSource.choices)
    follow_up = django_filters.CharFilter(method="filter_follow_up")
    stale = django_filters.BooleanFilter(method="filter_stale")

    class Meta:
        model = Lead
        fields = ["status", "source"]

    def filter_stale(self, queryset, name, value):
        if value is True:
            return queryset.stale()
        if value is False:
            return queryset.exclude(pk__in=queryset.stale().values("pk"))
        return queryset

    def filter_follow_up(self, queryset, name, value):
        # Delegate to the LeadQuerySet so the rules live in exactly one place.
        if value == "overdue":
            return queryset.overdue()
        if value == "today":
            return queryset.due_today()
        if value == "upcoming":
            return queryset.upcoming()
        if value == "none":
            return queryset.filter(next_follow_up_at__isnull=True)
        return queryset
