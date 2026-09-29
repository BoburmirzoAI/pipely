from django.db import migrations

# code -> human description
PERMISSIONS = {
    "leads.view": "View own leads",
    "leads.view_all": "View all leads (company-wide)",
    "leads.create": "Create leads",
    "leads.update": "Update leads",
    "leads.update_status": "Change lead status",
    "leads.delete": "Delete leads",
    "leads.assign": "Assign leads to other users",
    "stats.view": "View dashboard statistics",
    "users.view": "View users",
    "rbac.manage": "Manage roles and permissions",
}

# System role -> permission codes.
ROLES = {
    "Admin": list(PERMISSIONS.keys()),
    "Manager": [
        "leads.view", "leads.view_all", "leads.create", "leads.update",
        "leads.update_status", "leads.assign", "stats.view", "users.view",
    ],
    "Sales": [
        "leads.view", "leads.create", "leads.update", "leads.update_status",
        "stats.view",
    ],
}


def seed(apps, schema_editor):
    Permission = apps.get_model("users", "Permission")
    Role = apps.get_model("users", "Role")
    User = apps.get_model("users", "User")

    perms = {}
    for code, description in PERMISSIONS.items():
        perm, _ = Permission.objects.get_or_create(
            code=code, defaults={"description": description}
        )
        perms[code] = perm

    roles = {}
    for name, codes in ROLES.items():
        role, _ = Role.objects.get_or_create(name=name, defaults={"is_system": True})
        role.is_system = True
        role.save()
        role.permissions.set([perms[c] for c in codes])
        roles[name] = role

    # Users created before RBAC get the Sales role.
    sales = roles["Sales"]
    for user in User.objects.all():
        if not user.roles.exists():
            user.roles.add(sales)


def unseed(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    Permission = apps.get_model("users", "Permission")
    Role.objects.filter(name__in=ROLES.keys()).delete()
    Permission.objects.filter(code__in=PERMISSIONS.keys()).delete()


class Migration(migrations.Migration):
    dependencies = [("users", "0002_permission_role_user_roles")]
    operations = [migrations.RunPython(seed, unseed)]
