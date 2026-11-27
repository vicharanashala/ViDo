# ViDo Server — Dedicated NestJS Backend

A dedicated, enterprise-grade TypeScript backend for ViDo powering team workspaces, member invitations, phased milestone roadmaps, shared task checkpoints, and real-time Server-Sent Events (SSE).

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: [NestJS 11](https://nestjs.com/) (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`)
- **Database & ORM**: [Prisma ORM 6](https://www.prisma.io/) with SQLite (local development) and PostgreSQL (production)
- **Identity & Security**: [Firebase Admin SDK](https://firebase.google.com/) (`FirebaseAuthGuard`) with local Firebase Auth Emulator support (`127.0.0.1:9099`)
- **Real-Time Push**: Server-Sent Events (SSE) via RxJS `Subject` stream (`/api/events/stream`)
- **Validation**: `class-validator` & `class-transformer`

---

## 📁 Directory Layout

```text
server/
├── prisma/
│   ├── schema.prisma       # Relational models (teams, milestones, checkpoints, and per-user tasks, events, categories, targets)
│   └── dev.db              # Local SQLite database file (gitignored)
├── src/
│   ├── auth/               # Firebase token decoding & FirebaseAuthGuard
│   ├── calendar/           # Per-user calendar events (/api/user/calendar-events)
│   ├── categories/         # Per-user custom categories (/api/user/categories)
│   ├── events/             # Real-time SSE broadcaster & controller
│   ├── invitations/        # Team email invitations, pending invites & respond actions
│   ├── milestones/         # Phased project milestones & status toggles
│   ├── planning/           # Per-user weekly/monthly targets (/api/user/planning-targets)
│   ├── prisma/             # PrismaService lifecycle management
│   ├── tasks/              # Shared team tasks, checkpoints & progress, plus personal tasks (/api/user/tasks)
│   ├── teams/              # Team creation, members & team space queries
│   ├── app.module.ts       # Central NestJS application module
│   └── main.ts             # Application entry point with CORS and port binding
├── package.json            # Server dependencies and lifecycle scripts
└── tsconfig.json           # TypeScript configuration with decorator support
```

---

## ⚡ Quick Start

### 1. Run Concurrently with Frontend (from repository root)

```bash
npm run dev:all
```
*Starts Vite on `http://localhost:5173` and NestJS on `http://localhost:3001`.*

### 2. Run Server Standalone

```bash
cd server
npm install
npm run start:dev
```
*Server boots on `http://localhost:3001` with hot-reloading.*

---

## 🗄️ Database Management with Prisma

ViDo uses a zero-setup SQLite database (`dev.db`) locally. No Docker or PostgreSQL installation is required.

```bash
# Push schema changes to the local SQLite database
npm run prisma:push

# Re-generate the Prisma Client TypeScript types
npm run prisma:generate

# Launch Prisma Studio web GUI to browse and edit database records
npm run prisma:studio
```

### Production PostgreSQL Deployment
To deploy with PostgreSQL (e.g. Supabase, Neon, AWS RDS, Railway):
1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Set `DATABASE_URL` in your production environment variables:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/vido?schema=public"
   ```
3. Run `npx prisma migrate deploy` in your CI/CD pipeline.

---

## 📡 API Endpoints Overview

All protected endpoints require `Authorization: Bearer <firebaseIdToken>` header.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/teams` | List teams where user is lead or member | Authenticated User |
| `GET` | `/api/teams/:id` | Get detailed team workspace | Team Member |
| `POST` | `/api/teams` | Create a new team workspace | Authenticated User |
| `GET` | `/api/invitations/pending` | List pending invitations for user email | Authenticated User |
| `POST` | `/api/teams/:id/invitations` | Invite a member by email | Team Lead |
| `POST` | `/api/invitations/:id/respond` | Accept or reject an invitation | Invited User |
| `GET` | `/api/teams/:id/milestones` | Get milestone roadmap | Team Member |
| `POST` | `/api/teams/:id/milestones` | Create sequential project milestone | Team Lead |
| `PATCH`| `/api/milestones/:id/status` | Update milestone status (`active`/`completed`) | Team Lead |
| `GET` | `/api/teams/:id/tasks` | Get team task deliverables | Team Member |
| `POST` | `/api/teams/:id/tasks` | Create team task deliverable | Team Lead |
| `PATCH`| `/api/tasks/:id/progress` | Update 0–100% progress & log checkpoint | Assignee or Lead |
| `GET` | `/api/events/stream` | Server-Sent Events real-time event stream | Public / Client |
| `GET` / `POST` | `/api/user/tasks` | List or create the user's personal tasks | Authenticated User |
| `PATCH` / `DELETE` | `/api/user/tasks/:id` | Update or delete a personal task | Task Owner |
| `GET` / `POST` | `/api/user/calendar-events` | List or create the user's calendar events | Authenticated User |
| `DELETE` | `/api/user/calendar-events/:id` | Delete a calendar event | Event Owner |
| `GET` / `POST` | `/api/user/categories` | List or create the user's custom categories | Authenticated User |
| `DELETE` | `/api/user/categories/:id` | Delete a custom category | Category Owner |
| `GET` / `PUT` | `/api/user/planning-targets` | Read or replace weekly/monthly targets | Authenticated User |

---

## 🧪 Build & Verification

```bash
# Compile server TypeScript to dist/
npm run build
```
