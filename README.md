# TerraLink

TerraLink is a full-stack SaaS platform for admin-mediated heavy machine coordination. Construction owners submit machine requests, admins review and match available registered machines, and machine owners only manage their machines plus admin messages.

## Stack

- Backend: Django, Django REST Framework, JWT, PostgreSQL, filtering/search/pagination, CORS, Swagger/OpenAPI
- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Zustand

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Start PostgreSQL:

```bash
cd ..
docker compose up -d postgres
```

Run migrations and seed demo data:

```bash
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8000
```

API docs:

- Swagger: `http://localhost:8000/api/docs/`
- OpenAPI schema: `http://localhost:8000/api/schema/`

If `DATABASE_URL` is not set, the backend falls back to local SQLite for quick development. Use the `.env.example` value for PostgreSQL.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL: `http://localhost:5173`

## Demo Accounts

- Admin: `admin` / `AdminPass123!`
- Construction owner: `buildco` / `ClientPass123!`
- Machine owner: `atlasmachines` / `OwnerPass123!`

## Role Rules

- Construction owners can submit and view only their own machine requests.
- Machine owners can add/edit only their own machines and view admin messages.
- Machine owners have no job listing or job application route.
- Admins can view requests, filter machines, message owners, assign machines, manage users, and manage admin-only materials.
# TerraLink
