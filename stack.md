Monorepo:        Turborepo
Language:        TypeScript everywhere

Web frontend:    React 19 + Vite + Tailwind 4
                 TanStack Query + Zustand
                 React Hook Form + Zod
                 React Router (or TanStack Router)

Mobile:          React Native + Expo (SDK 52+)
                 Shared types with web via monorepo
                 TanStack Query here too

Backend:         Node.js + Hono + TypeScript
                 Prisma ORM
                 Zod for request validation (shared schemas)

Database:        Postgres (Neon for serverless, or Supabase)

Auth:            Clerk (ship fast) or Auth.js (show depth)

Jobs:            Inngest for reminders and scheduled tasks

Testing:         Vitest + Playwright

Hosting:         Vercel (web) + Fly.io (API) + Neon (db) + Expo EAS (mobile)

Observability:   Sentry (free tier)