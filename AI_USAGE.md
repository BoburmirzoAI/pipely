# AI usage

AI tools are allowed for this task. This file is an honest account of how I used
them, what I decided myself, and what I reviewed and tested.

## How AI was used

- I wrote a **detailed specification myself** (`docs/CLAUDE.md`) describing the data
  model, RBAC, API surface, business rules, coding conventions, phases, and a commit
  plan.
- I then used **Claude Code** (an AI coding assistant) to implement that spec **phase
  by phase**. Before each phase I reviewed the plan; after each phase I reviewed the
  result. I approved every step and every commit message.
- The **architecture decisions are mine.** The AI wrote most of the code to match them
  and I corrected it whenever it drifted from what I wanted.

## Decisions I made (and the AI implemented)

- Project layout: `apps/` grouping with a **package layout** (models/serializers/views/
  urls as folders), a central `config/config.py` for env, and split `base/dev/prod`
  settings.
- Naming: the auth app is `users` (not `accounts`).
- API **versioned under `/api/v1/`**.
- **`APIView` everywhere, never ViewSets**; main serializers subclass the base
  `Serializer`, not `ModelSerializer`.
- A **service layer** for lead writes wrapped in `transaction.atomic()`.
- **`LeadQuerySet` as the single source of truth** for lead states, and a shared
  `rules.py` (`CLOSED_STATUSES`, `stale_cutoff()`) used by both the queryset and the
  model properties.
- **Own RBAC inside the `users` app**, permissions bound to **actions, not URLs**,
  **deny-by-default**, **403 vs 404** (permission vs data scope).
- **Company-wide duplicate detection**; `owner` FK `on_delete=PROTECT` (we deactivate
  users, never delete them).
- **Follow-ups and stale computed at query time** (derived, not stored); **no
  Celery/Redis**.
- JWT stored in localStorage (documented tradeoff); throttling on auth endpoints.

## Where the AI's suggestion was corrected

- **Annotations → properties.** My spec first said to *annotate* `is_stale`/`is_overdue`
  in the queryset. While implementing, we worked out that annotations aren't present on
  the freshly-saved instance returned by create/update responses, and that a property
  reading already-loaded fields causes no extra queries. We switched to **model
  properties**, kept `LeadQuerySet` as the SQL source for filtering/counting, and added
  a **consistency test** asserting the property and the queryset always agree. I then
  updated the spec wording.
- **Initial scaffold.** The AI's first scaffold placed apps at the backend root and used
  single-file `models.py`/`views.py`. I directed the move into `apps/` and the package
  layout, the `accounts → users` rename, the settings split, and the centralized
  `config.py`.
- **Commit style.** I set the rules — small, meaningful, Conventional Commits, each
  leaving the project in a working (tests-passing) state — and the AI followed them.
- **API prefix / duplicates scope.** I decided to version the API under `/api/v1/` and
  to make duplicate detection company-wide (it was per-owner initially); the AI applied
  both as dedicated `refactor:` commits, updating the affected test in the same commit.

## What I reviewed and tested manually

- I read every file and can explain each decision.
- I ran the app **locally and with `docker compose up`**, logged in as **Admin /
  Manager / Sales**, and verified the RBAC differences end to end (Sales gets 403 on
  delete/assign and 404 on other users' leads; Manager sees all leads and can assign;
  only Admin sees the Users/Roles settings).
- I checked follow-up, stale, and duplicate behavior in the UI and via Swagger
  (`/api/docs/`).
- The repo has **38 automated tests** (`APITestCase`) covering auth/profile/throttling,
  lead CRUD, duplicates, status changes, filters, RBAC safety rules, and stale
  detection (including the property↔queryset consistency test).

## Tools

- **Claude Code** (Anthropic) as the implementation assistant.
- The UI design was produced in **Claude Design** (see the `design/` folder) and used
  as the visual reference for the frontend.
