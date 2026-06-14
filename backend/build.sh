#!/usr/bin/env bash
set -o errexit

python --version
python -m pip --version
python -m pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

if [ -n "$DJANGO_ADMIN_USERNAME" ] && [ -n "$DJANGO_ADMIN_PASSWORD" ]; then
  python manage.py create_initial_admin
fi
