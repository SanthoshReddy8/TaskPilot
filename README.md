# TaskFlow

AI-powered personal task and productivity tracker. Built as a resume-ready full-stack app, one feature at a time.

**Stack:** React · TypeScript · Tailwind CSS · Node.js · Express · Prisma · PostgreSQL · JWT · OpenAI

## Features 1–5 — Setup, authentication, tasks, status, priority, and deadlines

- React app at [http://localhost:5173](http://localhost:5173)
- Express API at [http://localhost:5000](http://localhost:5000)
- `GET /api/health` reports API and PostgreSQL status
- Prisma schema and migrations for `User` and `Task`
- Cookie-based registration, login, current-user, and logout endpoints
- Protected dashboard with session restoration on page refresh
- Authenticated users can create, view, edit, and delete their own tasks
- Per-task Todo, In Progress, and Completed statuses, plus Low, Medium, and High priorities
- Optional calendar deadlines with overdue/upcoming indicators, filtering, and deadline sorting

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
the existing password column without discarding user data. It also applies the
task CRUD migration, making task descriptions optional and indexing each user's
tasks by creation date, followed by the status/priority migration, which renames
the existing priority enum without changing task data. The deadline migration
converts due dates to calendar dates and adds a per-user deadline index.

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

## Task API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks` | List the authenticated user's tasks |
| `GET` | `/api/tasks/:id` | Get one of the authenticated user's tasks |
| `PATCH` | `/api/tasks/:id` | Update task fields, status, priority, or deadline |
| `DELETE` | `/api/tasks/:id` | Delete a task |

Task requests require the authentication cookie. Task titles are required and
limited to 200 characters; descriptions are optional and limited to 2000
characters. A user's ID always comes from the verified session, and requests for
another user's task return `404`.

Task updates also accept `status` (`TODO`, `IN_PROGRESS`, `COMPLETED`),
`priority` (`LOW`, `MEDIUM`, `HIGH`), and an optional `dueDate` in `YYYY-MM-DD`
format (or `null` to remove it). New tasks default to `TODO` and `MEDIUM`;
changing one field preserves the others. Overdue and upcoming deadlines use the
user's local calendar date; completed tasks are excluded from both. The
dashboard supports filtering by deadline, sorting by earliest deadline, and
editing or clearing deadlines on task cards.

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
3. Task CRUD — implemented
4. Status and priority — implemented
5. Deadlines and overdue tasks — implemented
6. Search, filters, and sorting
7. Productivity dashboard
8. AI task breakdown
9. AI task prioritization
10. Tests, docs, and deployment
