# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps (psycopg2 needs build tools on slim if you move off psycopg2-binary)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN python -m pip install --upgrade pip && pip install -r requirements.txt

# App code
COPY . .

# Collect static (needs STATIC_ROOT configured)
RUN python alumni_portal/manage.py collectstatic --noinput

EXPOSE 8000

# Start gunicorn from the inner folder
CMD ["gunicorn", "--chdir", "alumni_portal", "alumni_portal.wsgi:application", "--bind", "0.0.0.0:8000"]
