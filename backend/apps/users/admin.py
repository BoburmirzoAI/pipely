from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Permission, Role, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    filter_horizontal = BaseUserAdmin.filter_horizontal + ("roles",)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "is_system"]
    list_filter = ["is_system"]
    filter_horizontal = ["permissions"]


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ["id", "code", "description"]
    search_fields = ["code"]
