# Ledger

An editorial, manual-first money tracker. No Plaid, no feeds, no subscription creep —
just a quiet record of where you're going.

## Stack

Per `stack.md`:

- **Monorepo:** Turborepo + pnpm workspaces
- **Web:** Next.js (App Router) + React 19 + Tailwind 4 + Prisma (Direct DB access)
- **Mockup:** Vite-based interactive prototype (formerly apps/web)
- **API:** Hono + Prisma + Zod (Available for external consumers)
- **DB:** SQLite in dev (swap `DATABASE_URL` for Postgres/Neon in prod)
- **Shared:** `packages/shared` — Zod schemas + inferred types
- **Mobile:** `apps/mobile` scaffolded as a placeholder

## Layout

```
apps/
  web/        Next.js production application
  mockup/     Vite-based interactive prototype (design reference)
  api/        Hono HTTP API
  mobile/     placeholder
packages/
  shared/     Zod schemas, shared types (@ledger/shared)
  db/         Prisma schema, client, seed (@ledger/db)
```

## Getting started

```bash
pnpm install
cp packages/db/.env.example packages/db/.env
pnpm --filter @ledger/db exec prisma migrate dev --name init
pnpm db:seed
pnpm dev
```

That brings up:

- Web (Real App):  http://localhost:3000
- Mockup:          http://localhost:5173
- API:              http://localhost:8787


## Seeded data

A single demo user — **Elena Vargas** — with 8 accounts, 4 goals, 6 milestones and
a handful of sample transactions. All reads and writes currently target Elena
via the default `x-user-id: elena` header; supply your own when auth lands.

## What's missing (by design, for v1)

- Auth — Clerk / Auth.js to be added. All routes currently open.
- Real PDF parsing — `/parse-statement-mock` returns deterministic rows.
- Inngest reminders, Sentry, Playwright, deploy configs.
- Expo mobile.
