# TaskFlow

AI-powered personal task and productivity tracker. Built as a resume-ready full-stack app, one feature at a time.

**Stack:** React · TypeScript · Tailwind CSS · Node.js · Express · Prisma · PostgreSQL · JWT · OpenAI

## Features 1–2 — Setup and authentication

- React app at [http://localhost:5173](http://localhost:5173)
- Express API at [http://localhost:5000](http://localhost:5000)
- `GET /api/health` reports API and PostgreSQL status
- Prisma schema and migrations for `User` and `Task`
- Cookie-based registration, login, current-user, and logout endpoints
- Protected dashboard with session restoration on page refresh

## Local setup

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL on port 5434, so it does not collide with other local databases)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure environment

```bash
copy backend\.env.example backend\.env
```

On macOS/Linux: `cp backend/.env.example backend/.env`. Replace `JWT_SECRET` with a
random secret of at least 32 bytes (for example,
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`).
Keep `.env` files private; the checked-in `.env.example` contains placeholders only.

### 3. Install dependencies

```bash
npm install
npm run install:all
```

### 4. Run Prisma migrations

```bash
cd backend
npx prisma migrate dev
cd ..
```

This applies the initial schema and the authentication migration, which renames
the existing password column without discarding user data.

### 5. Start frontend and backend

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Health check: http://localhost:5000/api/health

## Authentication API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and start a session |
| `POST` | `/api/auth/login` | Authenticate and start a session |
| `GET` | `/api/auth/me` | Return the authenticated user's profile |
| `POST` | `/api/auth/logout` | Clear the session cookie |

Registration requires a name, valid email, and password of 12–72 bytes. Passwords
are hashed with bcrypt; API responses never include password hashes or JWTs.
Sessions use an HTTP-only cookie (seven-day expiry). The API accepts credentialed
requests only from `CLIENT_ORIGIN` and checks the `Origin` header on state-changing
requests. Cookies use `SameSite=Lax` locally and `SameSite=None; Secure` in
production for separate frontend/backend hosts; deploy behind HTTPS.

## Project structure

```
task-manager/
├── frontend/          React + TypeScript + Tailwind
│   └── src/            pages, auth context, protected routes, API service
├── backend/
│   ├── prisma/         schema.prisma and migrations
│   └── src/            Express routes, auth middleware and services
├── docker-compose.yml Local PostgreSQL
├── .gitignore
└── README.md
```

## Roadmap

1. Project setup and architecture
2. User authentication — implemented
3. Task CRUD
4. Status and priority
5. Deadlines and overdue tasks
6. Search, filters, and sorting
7. Productivity dashboard
8. AI task breakdown
9. AI task prioritization
10. Tests, docs, and deployment
