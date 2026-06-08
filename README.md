# ES’HLAHLENI SOCIAL CLUB Membership Management System

This workspace contains a full-stack membership management system for a premium private membership club.

## Structure

- `backend/` - Express API with JWT auth, Sequelize MySQL models, file upload, email and PDF generation.
- `frontend/` - Vite + React app with authentication, application dashboard, homepage and contact page.

## Setup

1. Install dependencies for backend and frontend:

```bash
cd backend
npm install
cd ../frontend
npm install
```

2. Create a `.env` file in `backend/` from `.env.example` and update MySQL / SMTP settings. Example mapping from your JDBC connection string `jdbc:mysql://127.0.0.1:3306/?user=root`:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_NAME=eshlahleni_club`
- `DB_PASSWORD=` (set your password)

3. To create an admin automatically on server startup, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. When the backend starts, it will create the admin user if it does not already exist.

```bash
cd backend
npm run dev
```

4. Alternatively, seed an initial admin user manually or promote an existing user:

```bash
cd backend
# set ADMIN_EMAIL and ADMIN_PASSWORD in .env first
npm run seed
```

```bash
cd backend
npm run promote-admin -- user@example.com
```

5. Start frontend:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Notes

- Backend stores uploaded payment proof under `backend/uploads/`.
- Approved applications generate a PDF membership card and can be emailed.
- Update email provider settings in `backend/.env`.
