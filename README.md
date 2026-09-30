# Pipely

Pipely is a small CRM for managing sales leads through a pipeline — from **New**
to **Won** or **Lost**. It has a Django REST Framework backend and a React +
TypeScript frontend, with role-based access control, follow-up tracking, stale-lead
detection, company-wide duplicate detection, and an activity history per lead.

## Features

- **Auth & profile** — JWT login/register, `/me`, profile update, change password
- **Leads** — CRUD, **table + board (kanban)** views, statuses (new → contacted →
  qualified → won/lost)
- **Search, filter, sort, paginate** — status / source / follow-up / stale / owner
  filters; all state kept in the URL (shareable, survives refresh)
- **Follow-ups** — overdue / due-today / upcoming; cleared automatically on won/lost
- **Stale detection** — open leads untouched for `STALE_LEAD_DAYS` with no future
  follow-up (computed at query time, nothing stored)
- **Duplicate detection** — company-wide, case-insensitive email + normalized phone,
  with a live check while typing (409 on conflict)
- **RBAC** — Admin / Manager / Sales roles, action-based permissions, data scope
  (own vs all leads), lead assignment
- **Settings** — profile, password, users management, roles permission matrix
- **Dashboard** — status breakdown, conversion rate, overdue / due-today / stale
  cards, recent leads
- **Activity timeline** — created / updated / status-changed / assigned
- Consistent error envelope, request throttling, OpenAPI/Swagger docs, Dockerized

## Tech stack

**Backend:** Python 3.12, Django 5.2, Django REST Framework, PostgreSQL,
`djangorestframework-simplejwt`, `django-filter`, `drf-spectacular`, `python-dotenv`,
`psycopg[binary]`, `django-cors-headers`.

**Frontend:** React + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query,
axios.

**Infra:** Docker + docker-compose, nginx (serves the built frontend).

## Quick start (Docker)

```bash
git clone git@github.com:BoburmirzoAI/pipely.git
cd pipely

# Backend needs its own .env (used by docker-compose):
cp backend/.env.example backend/.env
# Edit backend/.env and set a real SECRET_KEY.

docker compose up -d --build

# Seed demo users + ~40 demo leads:
docker compose exec backend python manage.py seed_demo
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:8002/api/v1/>
- API docs (Swagger): <http://localhost:8002/api/docs/>

Create your **own** admin (don't rely on the demo accounts):

```bash
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py assign_role <username> Admin
```

## Local setup (without Docker)

**Backend** (needs a running PostgreSQL — you can use just the db service:
`docker compose up -d db`):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # set SECRET_KEY and DB_* to match your Postgres
python manage.py migrate
python manage.py seed_demo      # optional demo data
python manage.py runserver 8002
```

**Frontend:**

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_BASE_URL (defaults to http://localhost:8002)
npm run dev                     # http://localhost:5173
```

## Environment variables

**Backend** (`backend/.env`):

| Variable | Default | Description |
|---|---|---|
| `DEBUG` | `True` (dev) | Django debug mode |
| `SECRET_KEY` | — | Django secret key (set a real one) |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `DJANGO_SETTINGS_MODULE` | `config.settings.dev` | Settings module (`…prod` in production) |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `pipely` | PostgreSQL credentials |
| `DB_HOST` | `localhost` | `db` inside docker-compose, `localhost` on the host |
| `DB_PORT` | `5435` | Host-mapped port (`5432` inside docker-compose) |
| `DB_SSLMODE` | `prefer` | psycopg sslmode |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Frontend origins |
| `STALE_LEAD_DAYS` | `7` | Days without an update before an open lead is stale |

**Frontend** (`frontend/.env`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8002` | Backend base URL (no trailing `/api`) |

## Demo accounts

Created by `python manage.py seed_demo` (for local/demo use only — never use these
in production):

| Username | Password | Role |
|---|---|---|
| `admin` | `demo12345` | Admin |
| `manager` | `demo12345` | Manager |
| `sales1`, `sales2` | `demo12345` | Sales |

## Roles & permissions

| Permission | Admin | Manager | Sales |
|---|:---:|:---:|:---:|
| View leads (own) | ✓ | ✓ | ✓ |
| View all leads | ✓ | ✓ | |
| Create / update / change status | ✓ | ✓ | ✓ |
| Delete leads | ✓ | | |
| Assign leads | ✓ | ✓ | |
| View stats | ✓ | ✓ | ✓ |
| View users | ✓ | ✓ | |
| Manage roles & permissions | ✓ | | |

- A newly registered user gets the **Sales** role automatically.
- `is_superuser` does **not** bypass RBAC; only roles grant API permissions.

## Running tests

```bash
cd backend
source .venv/bin/activate
python manage.py test        # needs PostgreSQL running (e.g. docker compose up -d db)
```

## API documentation

- Swagger UI: `/api/docs/`
- OpenAPI schema: `/api/schema/`

## Screenshots

> _Screenshots to be added._
>
> - Login
> - Leads — table view
> - Leads — board view
> - Lead detail
> - Dashboard
> - Settings — roles matrix

## License

Released under the [Apache License 2.0](LICENSE).
