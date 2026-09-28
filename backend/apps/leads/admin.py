from django.contrib import admin

from apps.leads.models import Lead, LeadActivity


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "status", "source", "owner", "next_follow_up_at", "created_at"]
    list_filter = ["status", "source", "created_at"]
    search_fields = ["name", "email", "phone"]
    raw_id_fields = ["owner"]
    date_hierarchy = "created_at"


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ["id", "lead", "type", "field", "user", "created_at"]
    list_filter = ["type", "created_at"]
    raw_id_fields = ["lead", "user"]
