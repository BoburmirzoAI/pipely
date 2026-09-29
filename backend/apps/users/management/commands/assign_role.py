from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from apps.users.models import Role

User = get_user_model()


class Command(BaseCommand):
    help = "Assign a role to a user (used to create the first Admin)."

    def add_arguments(self, parser):
        parser.add_argument("username")
        parser.add_argument("role")
        parser.add_argument(
            "--add",
            action="store_true",
            help="Add the role instead of replacing the user's roles.",
        )

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username=options["username"])
        except User.DoesNotExist:
            raise CommandError(f"User '{options['username']}' does not exist.")
        try:
            role = Role.objects.get(name=options["role"])
        except Role.DoesNotExist:
            raise CommandError(f"Role '{options['role']}' does not exist.")

        if options["add"]:
            user.roles.add(role)
        else:
            user.roles.set([role])

        roles = ", ".join(user.roles.values_list("name", flat=True))
        self.stdout.write(self.style.SUCCESS(f"{user.username} now has roles: {roles}"))
