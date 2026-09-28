import django_filters
from django.utils import timezone

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

    class Meta:
        model = Lead
        fields = ["status", "source"]

    def filter_follow_up(self, queryset, name, value):
        now = timezone.now()
        today = timezone.localdate()
        closed = [LeadStatus.WON, LeadStatus.LOST]

        if value == "overdue":
            return queryset.filter(next_follow_up_at__lt=now).exclude(status__in=closed)
        if value == "today":
            return queryset.filter(next_follow_up_at__date=today)
        if value == "upcoming":
            return queryset.filter(next_follow_up_at__date__gt=today)
        if value == "none":
            return queryset.filter(next_follow_up_at__isnull=True)
        return queryset
