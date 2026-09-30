# Pipely — Project Spec for Claude Code

## 1. Context

This is an internship test task. I have **3 days** to build **Pipely**, a small CRM for managing leads.
The name comes from "pipeline": leads move through stages from New to Won or Lost.
A large part of the project already exists. **Always read the existing code before changing it
and build on it — do not rewrite working parts without asking me.**

The reviewers care most about:
1. Backend architecture and data model
2. API design: CRUD, validation, pagination, filtering
3. Authentication, access control and error handling
4. **Git history** — the work must be visibly done step by step
5. Documentation quality
6. How AI was used, and whether I understand the generated code

AI tools are allowed, but in the interview I must explain every piece of code and every
architecture decision. So **my understanding matters more than speed**.

### Original task requirements (must all be met)
- Create lead: name, phone/email, source, note
- Lead list: pagination, search, status filter
- Lead status: New, Contacted, Qualified, Won, Lost
- Lead detail: view all data, edit, change status
- Backend API: authentication, CRUD, validation, pagination, filtering
- Relational database
- Basic error handling
- Bonus (optional): activity/history, sorting, dashboard statistics, Docker, tests, API docs
- Deliverables: working app, source code, README with setup instructions, short architecture
  explanation, public GitHub repo (mandatory), deployed demo URL (if possible)

### Our own additions (decided, all will be built)
Follow-up reminders, duplicate detection, stale leads, RBAC (roles and permissions),
Settings (profile, password, users, roles), 404/403 pages, throttling.

## 2. How to work with me (important)

- Work **phase by phase** (section 13). Before each phase, explain your plan and wait for my
  approval. After each phase, stop, summarize what was done and wait for my confirmation.
- For every non-trivial decision, explain **why** in 2–4 sentences. Explanations to me: **in Uzbek**.
  Code, comments, commit messages and documentation: **in English**.
- Follow the existing code style and package layout of each app.
- Prefer simple, readable, idiomatic Django/DRF over clever code.
  Do not add libraries that are not listed below without asking me first.
- Never commit secrets. All config comes from `.env`; keep `backend/.env.example` up to date.
- If a requirement is ambiguous, ask me instead of guessing.

### Git rules
- **Small, meaningful commits**, one logical change each. Never one giant commit.
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `perf:`.
- Each commit must leave the project in a working state (tests pass).
- Suggest the commit message and let me commit, or commit after I approve.
- Follow the commit plan in section 14 (adjust if needed, keep the granularity).

## 3. Tech stack

**Backend:** Python 3.12+, Django 5.x, Django REST Framework, PostgreSQL,
`djangorestframework-simplejwt`, `django-filter`, `drf-spectacular`, `python-dotenv`,
`psycopg[binary]`, `django-cors-headers`.

**Frontend:** React + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query, axios.
The UI design (made in Claude Design) is in the `design/` folder. Screens not in the design
(Settings tabs, Users, Roles, 404, 403, stale badge) must follow the same style and design tokens
from `index.css`.

**Infra:** Docker + docker-compose (currently db + backend). Frontend: either add it to compose
or deploy separately (Vercel) — decide with me and document it in README.

**Deliberately NOT used:** Celery and Redis. Time-based states (overdue, today, stale) are computed
at query time, and indexes + pagination keep queries fast. See Future improvements (section 15).

## 4. Repository structure

Items marked `+` are still to be added.

```
pipely/
├── LICENSE                          # Apache 2.0
├── README.md
├── ARCHITECTURE.md                  # +
├── AI_USAGE.md                      # +
├── .gitignore
├── docker-compose.yml               # db + backend
├── design/                          # UI mockups (reference only)
│
├── backend/
│   ├── Dockerfile · .dockerignore · .env.example
│   ├── manage.py                    # loads .env → config.settings.dev
│   ├── requirements-prod.txt · requirements-dev.txt
│   ├── config/
│   │   ├── config.py                # env reading (SECRET_KEY, DB_*, CORS)
│   │   ├── settings/base.py · dev.py · prod.py
│   │   ├── urls.py                  # admin + /api/v1/* + Swagger
│   │   └── wsgi.py · asgi.py
│   └── apps/
│       ├── core/                    # shared utilities, no domain logic, no concrete models
│       │   ├── exceptions.py        # unified error format, DuplicateLead (409)
│       │   ├── pagination.py        # {data, meta} envelope
│       │   ├── permissions.py       # + HasActionPermission (generic RBAC check)
│       │   ├── throttling.py        # + (only if custom throttle classes are needed)
│       │   └── models.py            # TimeStampedModel (abstract)
│       ├── users/                   # auth, profile, users management AND RBAC
│       │   ├── models/              # user.py (+ roles M2M, get_permission_codes()),
│       │   │                        # + role.py, + permission.py
│       │   ├── migrations/          # + seed_roles data migration
│       │   ├── serializers/         # register.py, user.py, + profile.py, + password.py,
│       │   │                        # + user_admin.py, + role.py, + permission.py
│       │   ├── views/               # auth.py, + profile.py, + password.py, + users.py,
│       │   │                        # + roles.py, + permissions.py
│       │   ├── urls/v1.py           # auth, me, change-password, + users, + roles, + permissions
│       │   ├── management/commands/ # + assign_role.py, + seed_demo.py
│       │   └── tests/               # test_auth.py, + test_profile.py, + test_users.py, + test_rbac.py
│       └── leads/
│           ├── models/              # lead.py (+ LeadQuerySet), lead_activity.py
│           ├── serializers/         # + is_overdue, is_stale computed fields
│           ├── views/               # leads, status, duplicate, activities, stats, + assign
│           ├── services/            # activity.py, duplicates.py, + assignment.py
│           ├── filters.py           # LeadFilter (status/source/follow_up, + owner, + stale)
│           ├── urls/v1.py
│           └── tests/               # crud, duplicates, status, filters, + stale, + permissions
│
└── frontend/
    ├── index.html · vite.config.ts · tailwind/ts configs
    ├── public/favicon.svg
    └── src/
        ├── main.tsx                 # QueryClient + Router + AuthProvider
        ├── App.tsx                  # routes
        ├── index.css                # Tailwind + design tokens
        ├── api/                     # client.ts (401 → refresh), auth.ts, leads.ts,
        │                            # + users.ts, + roles.ts
        ├── auth/                    # AuthContext.tsx, ProtectedRoute.tsx
        ├── hooks/                   # useDebounce.ts, useLeadParams.ts, + usePermissions.ts
        ├── lib/                     # types, tokens, format, leadMeta, activity
        ├── components/
        │   ├── AppLayout · Sidebar · Modal · Popover · Icon · Logo · Avatar · StatusBadge ...
        │   ├── leads/               # LeadsTable, LeadsBoard, LeadsToolbar, Pagination,
        │   │                        # LeadFormModal, DeleteDialog, FollowUpCell, + StaleBadge ...
        │   └── settings/            # + ProfileForm, PasswordForm, UsersTable, RolesMatrix
        └── pages/                   # Login, Register, Leads, LeadDetail, Dashboard,
                                     # + Settings, + NotFound, + Forbidden
```

**Why RBAC lives in `users` and not in a separate app or in `core`:** roles belong to the user
domain — Django itself keeps `User`, `Group` and `Permission` together in `django.contrib.auth`.
`core` stays a small set of shared utilities without domain models. The generic
`HasActionPermission` is in `core` because every app uses it; it only calls
`user.get_permission_codes()`, so `core` never imports `users` models.

## 5. Data model

### User (`users.User`)
Custom user extending `AbstractUser`.
- `email` unique
- `roles`: M2M → `users.Role` (several roles possible; effective permissions = union)
- `is_active`: deactivated users cannot log in or use existing tokens
- `get_permission_codes()`: returns a set of permission codes, loaded with one query and cached
  on the instance for the duration of the request

### Permission (`users.Permission`)
| Field | Type |
|---|---|
| code | CharField, unique, e.g. `leads.delete` |
| description | CharField |

Our own model — not `django.contrib.auth.models.Permission`. Import carefully and consider naming
the class `RolePermission` or using explicit imports to avoid confusion.

### Role (`users.Role`)
| Field | Type |
|---|---|
| name | CharField, unique |
| description | CharField, blank |
| permissions | M2M → users.Permission |
| is_system | bool — system roles cannot be deleted or renamed |

### Lead (`leads.Lead`) — extends `TimeStampedModel`
| Field | Type | Rules |
|---|---|---|
| name | CharField(255) | required, trimmed, not blank |
| email | EmailField | optional, valid format |
| phone | CharField(20) | optional, 7–15 digits with optional leading `+`; stored **normalized** (e.g. `+998901234567`) |
| source | TextChoices | website, instagram, telegram, referral, other (default: other) |
| note | TextField | optional |
| status | TextChoices | new, contacted, qualified, won, lost (default: new) |
| next_follow_up_at | DateTimeField | optional (`null=True, blank=True`) |
| owner | FK → User (PROTECT) | assigned user; set from request.user on create, changed only via the assign endpoint |
| created_at / updated_at | from TimeStampedModel | |

- **At least one of email or phone is required** — serializer (clear 400) AND DB `CheckConstraint`.
- **No duplicates, company-wide** (not per owner anymore, because Managers see all leads):
  partial `UniqueConstraint`s on `phone` where not empty and on `Lower(email)` where not empty.
  Service/serializer checks first (friendly 409); DB constraint is the safety net for race
  conditions (catch `IntegrityError` → 409). If the current code checks per owner, migrate it
  in a separate `refactor:` commit and check existing data for conflicts first.
- Indexes on `status`, `created_at`, `updated_at`, `next_follow_up_at`, `owner`.
  Default ordering `-created_at`.
- **Custom `LeadQuerySet`** (used as the manager) with reusable, chainable methods:
  `open()` (status not won/lost), `overdue()`, `due_today()`, `upcoming()`, `stale()`,
  `visible_to(user)` (data scope). Filters, stats and views all use these methods, so each
  rule is defined in exactly one place.

### LeadActivity (`leads.LeadActivity`)
| Field | Type |
|---|---|
| lead | FK → Lead (CASCADE) |
| user | FK → User (SET_NULL, null=True) — who made the change |
| type | created, updated, status_changed, assigned |
| field | CharField, which field changed (blank for created) |
| old_value / new_value | CharField(255), blank allowed |
| created_at | DateTime auto |

## 6. RBAC

### Permission codes
`leads.view`, `leads.view_all`, `leads.create`, `leads.update`, `leads.update_status`,
`leads.delete`, `leads.assign`, `stats.view`, `users.view`, `rbac.manage`

### System roles (seeded by a DATA MIGRATION in apps/users, not fixtures)
| Permission | Admin | Manager | Sales |
|---|---|---|---|
| leads.view | ✓ | ✓ | ✓ |
| leads.view_all | ✓ | ✓ | |
| leads.create / update / update_status | ✓ | ✓ | ✓ |
| leads.delete | ✓ | | |
| leads.assign | ✓ | ✓ | |
| stats.view | ✓ | ✓ | ✓ |
| users.view | ✓ | ✓ | |
| rbac.manage | ✓ | | |

- New registered users get the **Sales** role automatically.
- Existing users (created before RBAC) get the Sales role in the same data migration.
- `python manage.py assign_role <username> <role_name>` — used to create the first Admin.
- `is_superuser` does NOT bypass RBAC; only roles grant API permissions.

### How the check works (the "endpoint system")
- Permissions are bound to **view actions, not URLs** (URLs change, codes stay stable).
- Each view declares a mapping, e.g.:
```python
  required_permissions = {
      "list": "leads.view", "retrieve": "leads.view", "create": "leads.create",
      "partial_update": "leads.update", "destroy": "leads.delete",
  }
```
  For single-purpose APIViews, map HTTP methods instead (e.g. `{"PATCH": "leads.update_status"}`).
  Pick one convention that fits the existing views and use it everywhere.
- `HasActionPermission` (apps/core/permissions.py) checks that `user.get_permission_codes()`
  contains the required code. **Anything missing from the mapping is denied by default.**
- Missing permission → **403**. Lead outside the user's data scope → **404**.
- Replace or combine the current logic in `apps/core/permissions.py` accordingly; explain to me
  what changes before doing it.

### Data scope
- With `leads.view_all`: user sees all leads, can filter by `?owner=<id>`.
- Without it: queryset filtered to `owner=request.user` (`Lead.objects.visible_to(user)`).
- Scope applies everywhere: list, detail, update, status, assign, delete, activities, stats.
- Duplicate check is company-wide, but for a duplicate outside the user's scope it returns only
  that a duplicate exists, without the id/name.

### Safety rules
- The Admin role's permissions cannot be edited; system roles cannot be deleted or renamed.
- A role assigned to users cannot be deleted → 409.
- The last active Admin cannot lose the Admin role or be deactivated → 409.
- A user cannot deactivate themselves → 400.

## 7. Access control layers
1. **Authentication:** JWT. Public: register, login, refresh, Swagger docs.
   Everything else requires `IsAuthenticated` (global default in `settings/base.py`).
2. **Action permissions:** `HasActionPermission` → 403.
3. **Data scope:** queryset filtering by owner unless `leads.view_all` → 404.
4. **Throttling (DRF built-in):** `ScopedRateThrottle` on login and register (`"auth": "5/min"`),
   `UserRateThrottle` for the API (`"user": "1000/hour"`). 429 uses our error format with code
   `rate_limited`. Default LocMem cache is per-process; note in Future improvements that multiple
   workers need a shared cache.

## 8. Business rules

- **Status transitions:** any status can change to any other (teams sometimes reopen lost leads).
  Same status → no-op.
- **Assignment:** `leads.assign` allows changing the owner to another active user; logged as
  `assigned` activity (service: `leads/services/assignment.py`).
- **Follow-ups:**
  - Overdue = `next_follow_up_at < now` and status not won/lost.
  - Due today = `next_follow_up_at` is today (`TIME_ZONE = "Asia/Tashkent"`).
  - Upcoming = `next_follow_up_at` after today.
  - Setting a follow-up in the past → 400.
  - Status changed to won/lost → `next_follow_up_at` cleared automatically and logged.
- **Stale leads:**
  - A lead is **stale** when ALL are true:
    1. status is not won/lost (closed leads are never stale),
    2. `updated_at` is older than `STALE_LEAD_DAYS` (setting in `settings/base.py`, default 7),
    3. it has **no future follow-up** (`next_follow_up_at` is null or in the past) — a lead with
       a planned follow-up is not forgotten, so it is not stale.
  - Computed at query time via `Lead.objects.stale()` — nothing is stored, no background job.
  - Any change that saves the lead (edit, status, assign, follow-up) updates `updated_at` and
    therefore removes the stale state automatically.
  - Stale and overdue can both be true at the same time; the UI shows both badges.
  - The serializer exposes read-only computed fields `is_stale` and `is_overdue` as
    **model properties**. They read only fields already loaded on the row (`status`,
    `updated_at`, `next_follow_up_at`), so there are no extra queries and no N+1 — and,
    unlike queryset annotations, they also work on the freshly-saved instance returned by
    create/update/status responses (no re-fetch needed). The SQL-level rules for filtering
    and counting live in `LeadQuerySet` (`stale()`, `overdue()`, `open()`). Both the
    properties and the queryset import the shared rules from `apps/leads/rules.py`
    (`CLOSED_STATUSES`, `stale_cutoff()`) so they are a single source of truth; a
    consistency test asserts `lead.is_stale == Lead.objects.stale().filter(pk=lead.pk).exists()`
    (and the same for `is_overdue`) across a mix of leads.
- **Duplicates:** email case-insensitive, phone after normalization, company-wide.
  Create/update with an existing email or phone → 409 with the existing lead in `details`
  (if in scope). Update check excludes the lead itself.
- **Activity logging:** create, field updates, status changes and assignments write
  `LeadActivity` rows in the service layer, inside `transaction.atomic()`.
- **Performance:** `select_related("owner")` in lead querysets; `prefetch_related` for roles and
  permissions where lists of users/roles are returned (avoid N+1).

## 9. API

Base path **`/api/v1/`** (if the real prefix in `config/urls.py` differs, use the real one
everywhere). JWT: `Authorization: Bearer <access>`.

### Auth & profile (apps/users)
| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | auth/register/ | public, throttled | username, email, password → 201; gets Sales role |
| POST | auth/login/ | public, throttled | → access + refresh |
| POST | auth/refresh/ | public | → new access |
| GET | auth/me/ | authenticated | user + `roles` + `permissions` (list of codes) |
| PATCH | auth/me/ | authenticated | first_name, last_name, email (unique → 400) |
| POST | auth/change-password/ | authenticated | current_password, new_password; wrong current → 400; Django validators |

### Leads (apps/leads)
| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | leads/ | leads.view | paginated, scoped; each item has `is_overdue`, `is_stale` |
| POST | leads/ | leads.create | |
| GET | leads/{id}/ | leads.view | includes `is_overdue`, `is_stale` |
| PATCH | leads/{id}/ | leads.update | status and owner not changed here |
| PATCH | leads/{id}/status/ | leads.update_status | `{ "status": "contacted" }` |
| PATCH | leads/{id}/assign/ | leads.assign | `{ "owner_id": 5 }` |
| DELETE | leads/{id}/ | leads.delete | 204 |
| GET | leads/check-duplicate/?email=&phone= | leads.create | `{ "duplicate": null }` or `{ "duplicate": { "id", "name", "matched_on" } }` |
| GET | leads/{id}/activities/ | leads.view | |
| GET | leads/stats/ | stats.view | computed over the user's scope |

List params: `page`, `page_size` (default 20, max 100), `search` (name, email, phone),
`status` (multiple), `source`, `owner` (only with `leads.view_all`),
`follow_up` (`overdue`, `today`, `upcoming`, `none`), `stale` (`true` / `false`),
`ordering` (`created_at`, `updated_at`, `name`, `status`, `next_follow_up_at`, `-` for desc).

### Users & roles (apps/users)
| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | users/ | users.view | paginated, search, roles, is_active |
| PATCH | users/{id}/ | rbac.manage | `{ "role_ids": [...], "is_active": bool }`; safety rules |
| GET | permissions/ | rbac.manage | all codes with descriptions |
| GET / POST | roles/ | rbac.manage | list (permission codes, user count) / create |
| PATCH / DELETE | roles/{id}/ | rbac.manage | safety rules |

### Response formats
Paginated list:
```json
{
  "data": [ { "id": 1, "name": "Aziz Karimov", "status": "new", "is_overdue": false, "is_stale": true } ],
  "meta": { "page": 1, "page_size": 20, "total": 57, "total_pages": 3 }
}
```

Errors (apps/core/exceptions.py, same shape everywhere):
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input.",
    "details": { "phone": ["Enter a valid phone number."] }
  }
}
```
Codes: `validation_error` (400), `not_authenticated` (401), `permission_denied` (403),
`not_found` (404), `duplicate_lead` / `conflict` (409), `rate_limited` (429), `server_error` (500,
no stack traces when DEBUG=False).

Duplicate (409):
```json
{
  "error": {
    "code": "duplicate_lead",
    "message": "A lead with this phone already exists.",
    "details": { "field": "phone", "existing_lead": { "id": 12, "name": "Aziz Karimov" } }
  }
}
```

Stats:
```json
{
  "total": 57,
  "by_status": { "new": 20, "contacted": 15, "qualified": 10, "won": 8, "lost": 4 },
  "conversion_rate": 0.67,
  "follow_ups": { "overdue": 3, "today": 4, "upcoming": 11 },
  "stale": 6
}
```
`conversion_rate = won / (won + lost)`, or `null` if both are 0. All numbers use the same
`LeadQuerySet` methods as the filters, so the dashboard and the filtered list always match.

Swagger UI via drf-spectacular (path as configured in `config/urls.py`).

## 10. Frontend

### Pages
1. **Login / Register**
2. **Dashboard** — stat cards, conversion rate, "Overdue follow-ups", "Due today" and
   **"Stale leads"** cards, each linking to the filtered leads list; recent leads.
3. **Leads** — table and board views, search (debounced), filters (status, source, follow-up,
   **stale**, owner if `leads.view_all`), sorting, pagination; state in the URL via `useLeadParams`.
   - Table: owner column only with `leads.view_all`; follow-up column with red "Overdue" and amber
     "Today" badges; **gray "Stale" badge** next to the status (tooltip: "No activity for 7+ days").
   - Board: stale cards show a small gray "Stale" label.
   - "Stale" filter chip: All / Stale only.
4. **Lead detail** — all fields, edit, status, follow-up, assign selector (if `leads.assign`),
   delete (if `leads.delete`), activity timeline; a gray banner for stale leads:
   "No activity for N days — set a follow-up or update the status".
5. **New / Edit lead modal** — inline API errors; debounced `check-duplicate` with an amber
   warning linking to the existing lead; same message on 409.
6. **Delete confirmation** dialog.
7. **Settings** (`/settings`, opened from the user block in the sidebar), tabs:
   - **Profile** (everyone): first name, last name, username (read-only), email, roles (badges)
   - **Password** (everyone): current, new, confirm
   - **Users** (`users.view`; editing needs `rbac.manage`): list, assign roles, activate/deactivate
   - **Roles** (`rbac.manage`): list, permission checkbox matrix, create/edit/delete custom roles;
     system roles marked and locked
8. **NotFound (404)** — unknown routes and leads that return 404; "Back to leads".
9. **Forbidden (403)** — pages the user has no permission for.

### Rules
- `usePermissions()` reads `permissions` from `auth/me/` (via AuthContext) to show/hide buttons,
  tabs, columns and routes. **Only UX — the backend always enforces permissions.**
- Stale/overdue badges use `is_stale` / `is_overdue` from the API — the frontend does not
  recalculate business rules.
- Sidebar user block shows the name and actual role(s).
- Every data view handles loading, empty and error states; success toasts after saves.
- Tokens in localStorage (tradeoff documented); `api/client.ts` refreshes on 401, logs out if
  refresh fails.
- Responsive: usable on mobile.

## 11. Tests (DRF `APITestCase`, in each app's `tests/`)

users — auth & profile:
- register + login returns tokens; registered user has the Sales role
- unauthenticated request → 401; deactivated user cannot log in
- change password with wrong current password → 400
- update email to another user's email → 400
- 6th login attempt within a minute → 429

leads:
- create valid → 201; missing both email and phone → 400
- duplicate phone with different formatting (`+998 90 123-45-67`) → 409
- duplicate email with different case → 409; duplicate across different owners → 409
- follow-up in the past → 400; `?follow_up=overdue` returns only overdue open leads
- status change writes a LeadActivity row; status → won clears `next_follow_up_at`
- search and status filter return the correct subset

stale (leads/tests/test_stale.py — set `updated_at` with `QuerySet.update()` in tests):
- open lead not updated for 8 days → `is_stale = true`, included in `?stale=true`
- lead updated 3 days ago → not stale
- won or lost lead older than 7 days → not stale
- old lead with a future follow-up → not stale; with a past follow-up → stale
- editing a stale lead removes it from `?stale=true`
- `STALE_LEAD_DAYS` override (`@override_settings`) changes the result
- `stats.stale` equals the count returned by `?stale=true`

RBAC (users/tests/test_rbac.py, leads/tests/test_permissions.py):
- Sales cannot see another user's lead → 404; Manager can → 200
- Sales DELETE lead → 403; Admin → 204
- Sales assign → 403; Manager → 200 and `assigned` activity logged
- Sales cannot access roles/ → 403
- system role cannot be deleted; role in use cannot be deleted → 409
- last Admin cannot lose the Admin role → 409; user cannot deactivate themselves → 400
- an action not in `required_permissions` is denied

## 12. Priorities if time runs short
Never cut the original requirements or our decided additions' backend logic.
If needed, simplify in this order: board drag-and-drop (keep board read-only) →
dashboard charts (keep stat cards) → Roles editing UI (keep seeded roles + Users tab).

## 13. Phases (remaining work)

**Phase A — Audit (first)**
Compare the code with this spec and report a status table in Uzbek: done / partial / not started.
Explain what `apps/core/permissions.py` currently does. Propose the order of remaining work.

**Phase B — Backend completion**
`LeadQuerySet` (open, overdue, due_today, upcoming, stale, visible_to) and refactor existing
filters/stats to use it, stale leads (setting, filter, `is_stale`/`is_overdue` annotations, stats),
throttling, profile update, change password, company-wide duplicates refactor,
`select_related` / `prefetch_related` review.

**Phase C — RBAC backend**
Role & Permission models in apps/users, seed data migration, `get_permission_codes()`,
`HasActionPermission` in core, `required_permissions` on all views, data scope, assign endpoint,
users/roles/permissions endpoints, safety rules, `assign_role` and `seed_demo` commands
(admin/manager/sales users + ~40 leads with Uzbek names and +998 numbers, including some
overdue and some stale leads so every feature is visible in the demo).

**Phase D — Frontend completion**
Stale badge, filter chip, banner and dashboard card; `usePermissions`, permission-aware UI,
assign selector, owner column/filter, Settings (Profile, Password, Users, Roles), NotFound, Forbidden.

**Phase E — Tests & Docker**
All tests in section 11, docker-compose decision for the frontend, verify `docker compose up`.

**Phase F — Delivery**
README, ARCHITECTURE.md, AI_USAGE.md, deploy (Render/Railway for backend + DB, Vercel for
frontend), final review against the Definition of done.

## 14. Commit plan for remaining work (guideline)

```
refactor: add LeadQuerySet with reusable lead state filters
refactor: use LeadQuerySet in filters and stats
feat: add stale lead detection with configurable threshold
feat: add stale filter and is_stale/is_overdue fields
feat: add stale leads count to stats
feat: add throttling for auth endpoints
feat: add profile update endpoint
feat: add change password endpoint
refactor: make duplicate detection company-wide
perf: use select_related for lead querysets
feat: add role and permission models
feat: seed system roles and permissions
feat: add get_permission_codes to user model
feat: add action-based permission class
feat: apply rbac and data scope to lead endpoints
feat: add lead assignment endpoint
feat: add users management endpoints
feat: add roles and permissions endpoints
feat: enforce rbac safety rules
chore: add assign_role management command
chore: add seed_demo management command
feat: expose roles and permissions in me endpoint
feat: show stale badge, filter and banner in ui
feat: add stale leads card to dashboard
feat: add usePermissions hook and permission-aware ui
feat: add lead assignment and owner filter to ui
feat: add settings page with profile and password tabs
feat: add users and roles settings tabs
feat: add not found and forbidden pages
test: add stale lead tests
test: add profile and password tests
test: add rbac tests
test: add lead permission tests
chore: add frontend to docker setup
docs: update readme with setup and demo credentials
docs: add architecture explanation
docs: add ai usage notes
```

## 15. Documentation to produce

- **README.md** — what Pipely is, features, tech stack, setup with and without Docker, env
  variables (incl. `STALE_LEAD_DAYS`), `seed_demo` and demo credentials (admin / manager / sales),
  how to run tests, API docs link, demo URL, screenshots, license (Apache 2.0).
- **ARCHITECTURE.md** — structure (apps/core, users, leads), settings split (base/dev/prod),
  API versioning (v1), data model diagram (Mermaid ER), access control layers, and key decisions
  with tradeoffs: custom user; own RBAC inside users (like django.contrib.auth); permissions bound
  to actions, not URLs; deny by default; 403 vs 404; data scope; service layer; `LeadQuerySet` as
  the single source of truth for lead states; DB constraints + serializer validation; company-wide
  duplicates; phone normalization; follow-ups and stale computed at query time (derived state,
  not stored); stale excludes leads with a planned follow-up; clearing follow-ups on won/lost;
  N+1 prevention; JWT in localStorage; why no Celery/Redis.
  **Future improvements:** follow-up and stale reminders via email/Telegram (Celery + Celery Beat
  + Redis); Redis cache for stats and shared cache for throttling with multiple workers; per-role
  or per-team stale thresholds; avatar upload; email verification; 2FA; audit log for RBAC changes.
- **AI_USAGE.md** — honest notes: which parts were generated with AI, what I reviewed or changed,
  and what I verified manually.

## 16. Definition of done

- [ ] All original task requirements work end to end
- [ ] Follow-ups, duplicates and stale leads work in API and UI; dashboard numbers match filters
- [ ] RBAC works: Admin, Manager and Sales behave as in section 6
- [ ] All tests pass
- [ ] `docker compose up` starts the app
- [ ] No secrets in the repo; `.env.example` present
- [ ] Clean, step-by-step git history
- [ ] README lets a stranger run the project in under 5 minutes
- [ ] Public GitHub repo; demo deployed if possible
- [ ] I can explain every file and decision