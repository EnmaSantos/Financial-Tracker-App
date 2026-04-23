# Supabase Migration Notes

This directory starts the migration away from app-owned password auth and toward Supabase Auth.

## Why this is the first step

The current app still stores `passwordHash` in its own `User` model and manages sessions itself. A proper "forgot password" flow in Supabase depends on users living in `auth.users`, because the reset email and password update flow are handled there.

The first migration in `supabase/migrations/20260421204130_initial_auth_schema.sql` does three important things:

1. Uses `auth.users` as the source of truth for real users.
2. Creates `public.profiles` plus the financial tables the app needs.
3. Enables Row Level Security so each signed-in user can only access their own rows.

## Proposed forgot-password flow

1. Public `forgot-password` page:
   Call `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.
2. Public-to-authenticated handoff:
   The reset email sends the user back to your app at the configured `redirectTo` URL.
3. Authenticated `update-password` page:
   After the recovery redirect completes, collect the new password and call `supabase.auth.updateUser({ password })`.

## Supabase project setup

Before wiring the UI, configure these in your Supabase project:

1. Add your app URLs to the Auth redirect URL allowlist.
2. Confirm email/password auth is enabled.
3. For production, configure SMTP instead of relying on the default low-volume mail sender.

## Suggested next implementation steps

1. Add Supabase client helpers in `apps/web` for browser/server usage.
2. Replace the custom login/signup/session flow with Supabase Auth.
3. Add `forgot-password` and `update-password` routes in the Next app.
4. Move Prisma reads/writes for real users to Supabase-backed tables.
5. Decide whether demo personas stay outside Supabase Auth or become anonymous/demo users.

## Typical CLI commands

```bash
supabase migration new initial_auth_schema
supabase db push
```

If the remote project already has schema changes made outside Git, fetch or repair migration history before pushing.
