This is the `@ledger/web` Next.js app.

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in:

```bash
SESSION_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
```

The Supabase values are used by the staged password recovery flow and the SSR helper scaffold in `src/lib/supabase`.
The Prisma URLs are the values to provide when you are ready to point Prisma at Supabase Postgres.

## Getting Started

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying To Vercel

This app is set up to deploy from a monorepo to Vercel.

In Vercel, import the repository and configure the project like this:

- Framework Preset: `Next.js`
- Root Directory: `apps/web`
- Build Command: `pnpm vercel-build`
- Install Command: leave Vercel default
- Node.js: `20.x`

The custom Vercel build runs `pnpm --filter @ledger/db generate` before `next build` so Prisma Client is generated for the shared `@ledger/db` workspace package.

### Required environment variables

Add these in `Project Settings -> Environment Variables` for Production:

```bash
SESSION_SECRET=replace-with-a-new-long-random-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...supabase.co:5432/postgres
```

Use a pooled runtime `DATABASE_URL` for Vercel and keep `DIRECT_URL` for Prisma CLI tasks.

### Production auth URLs

After Vercel gives you a production domain, update these providers:

- Supabase `Authentication -> URL Configuration`
- Google Cloud Console OAuth client

Use:

- Site URL: `https://your-domain.com`
- Supabase Redirect URLs:
  - `https://your-domain.com/auth/confirm`
  - `https://your-domain.com/update-password`
  - optionally `https://your-domain.com/auth/confirm?next=/app` if you want the exact URL allowlisted
- Google Authorized JavaScript origins:
  - `https://your-domain.com`
- Google Authorized redirect URIs:
  - `https://your-project-ref.supabase.co/auth/v1/callback`

## Password Recovery Scaffold

The initial Supabase password recovery routes are:

- `/forgot-password`
- `/update-password`

This is scaffolding for the ongoing auth migration. The current production login in this repo still uses the older Prisma-backed auth path, so only Supabase-backed users in `auth.users` can complete the recovery flow end to end.

Make sure your Supabase project allows the `redirectTo` URL you intend to use for `/update-password`.

## Notes

- `apps/web/proxy.ts` refreshes Supabase auth cookies when Supabase env vars are present.
- when Supabase env is present, signup/login/logout now prefer Supabase Auth and mirror the user row into Prisma so the current data model keeps working.
- `src/lib/session.ts` is still kept as a transitional fallback for the legacy local auth path.

## References

- Next.js App Router docs
- Supabase SSR + Auth docs
