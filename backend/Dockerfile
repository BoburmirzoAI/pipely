FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# psycopg[binary] bundles its own libpq, so no system postgres client is needed.
COPY requirements-prod.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt

COPY . .

EXPOSE 8000

# Overridden by docker-compose to also run migrations first.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
