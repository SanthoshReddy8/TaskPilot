# TaskFlow

AI-powered personal task and productivity tracker. Built as a resume-ready full-stack app, one feature at a time.

**Stack:** React · TypeScript · Tailwind CSS · Node.js · Express · Prisma · PostgreSQL · JWT · OpenAI

## Feature 1 — Project setup

- React app at [http://localhost:5173](http://localhost:5173)
- Express API at [http://localhost:5000](http://localhost:5000)
- `GET /api/health` reports API and PostgreSQL status
- Prisma schema and migrations for `User` and `Task`

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

On macOS/Linux: `cp backend/.env.example backend/.env`

### 3. Install dependencies

```bash
npm install
npm run install:all
```

### 4. Run Prisma migrations

```bash
cd backend
npx prisma migrate dev --name init
cd ..
```

### 5. Start frontend and backend

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Health check: http://localhost:5000/api/health

## Project structure

```
task-manager/
├── frontend/          React + TypeScript + Tailwind
├── backend/
│   ├── prisma/        schema.prisma
│   └── src/           Express + TypeScript
├── docker-compose.yml Local PostgreSQL
├── .gitignore
└── README.md
```

## Roadmap

1. Project setup and architecture
2. User authentication
3. Task CRUD
4. Status and priority
5. Deadlines and overdue tasks
6. Search, filters, and sorting
7. Productivity dashboard
8. AI task breakdown
9. AI task prioritization
10. Tests, docs, and deployment
