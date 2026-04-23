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
