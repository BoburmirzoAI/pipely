from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.leads.models import Lead, LeadActivity, LeadSource, LeadStatus
from apps.leads.services.phone import normalize_phone
from apps.users.models import Role

User = get_user_model()

DEMO_PASSWORD = "demo12345"

FIRST = [
    "Aziz", "Bek", "Dilnoza", "Kamola", "Sardor", "Nodira", "Jasur", "Malika",
    "Rustam", "Zarina", "Bobur", "Shahzod", "Gulnora", "Otabek", "Madina",
    "Ulugbek", "Sevara", "Timur", "Nilufar", "Farrux",
]
LAST = [
    "Karimov", "Yusupov", "Rashidova", "Tosheva", "Aliyev", "Umarova",
    "Sobirov", "Ergasheva", "Nazarov", "Qodirova",
]


class Command(BaseCommand):
    help = "Seed demo users (admin/manager/sales) and ~40 leads for the demo."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo leads before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        admin = self._make_user("admin", "Admin")
        manager = self._make_user("manager", "Manager")
        sales1 = self._make_user("sales1", "Sales")
        sales2 = self._make_user("sales2", "Sales")
        owners = [manager, sales1, sales2]

        if options["reset"]:
            Lead.objects.filter(owner__in=owners).delete()

        if Lead.objects.filter(owner__in=owners).exists():
            self.stdout.write("Demo leads already exist; use --reset to recreate.")
            self._print_credentials()
            return

        now = timezone.now()
        statuses = [s.value for s in LeadStatus]
        sources = [s.value for s in LeadSource]
        created = 0

        for i in range(40):
            first = FIRST[i % len(FIRST)]
            last = LAST[i % len(LAST)]
            status = statuses[i % len(statuses)]
            owner = owners[i % len(owners)]

            variant = i % 6
            if variant == 0:
                follow_up = now - timedelta(days=2)  # overdue (if still open)
            elif variant == 1:
                follow_up = now + timedelta(hours=2)  # due today
            elif variant == 2:
                follow_up = now + timedelta(days=5)  # upcoming
            else:
                follow_up = None

            lead = Lead.objects.create(
                owner=owner,
                name=f"{first} {last}",
                email=f"{first.lower()}.{last.lower()}{i}@example.uz",
                phone=normalize_phone(f"+99890{1000000 + i}"),
                source=sources[i % len(sources)],
                status=status,
                next_follow_up_at=follow_up,
                note="Demo lead.",
            )
            LeadActivity.objects.create(
                lead=lead, user=owner, type=LeadActivity.Type.CREATED
            )

            # Make some open, follow-up-less leads stale (updated long ago).
            if follow_up is None and status not in ("won", "lost"):
                Lead.objects.filter(pk=lead.pk).update(
                    updated_at=now - timedelta(days=12)
                )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created} demo leads."))
        self._print_credentials()

    def _make_user(self, username, role):
        user, is_new = User.objects.get_or_create(
            username=username, defaults={"email": f"{username}@pipely.demo"}
        )
        if is_new:
            user.set_password(DEMO_PASSWORD)
            user.save()
        user.roles.set([Role.objects.get(name=role)])
        return user

    def _print_credentials(self):
        self.stdout.write(f"\nDemo users (password: {DEMO_PASSWORD}):")
        for line in ["admin / Admin", "manager / Manager", "sales1 / Sales", "sales2 / Sales"]:
            self.stdout.write(f"  {line}")
