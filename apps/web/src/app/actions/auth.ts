"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@ledger/db";
import { createSession, deleteSession } from "@/lib/session";
import { isDemoUserId } from "@/lib/demo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureMirrorUser, ensureMirrorUserFromSupabaseUser } from "@/lib/user-mirror";

export type AuthFormState =
  | { ok: true }
  | { ok: true; message: string }
  | null
  | {
      ok: false;
      error?: string;
      fieldErrors?: Partial<
        Record<"name" | "email" | "password" | "confirmPassword", string>
      >;
    };

function normalizeEmail(raw: unknown) {
  return String(raw ?? "").trim().toLowerCase();
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  return null;
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  const fieldErrors: NonNullable<
    Extract<AuthFormState, { ok: false }>["fieldErrors"]
  > = {};
  if (!email) fieldErrors.email = "Email is required.";
  if (!password) fieldErrors.password = "Password is required.";
  if (Object.keys(fieldErrors).length) {
    return { ok: false, fieldErrors };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { ok: false, error: "Invalid email or password." };
    }

    await ensureMirrorUserFromSupabaseUser(data.user);
    await deleteSession();
    redirect("/app");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Same response for missing user and bad password — avoids enumerating
  // registered emails.
  const genericFail = { ok: false as const, error: "Invalid email or password." };
  if (!user || !user.passwordHash) return genericFail;
  if (isDemoUserId(user.id)) {
    return {
      ok: false,
      error: "Demo ledgers are public now. Use the landing page to explore them.",
    };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return genericFail;

  await createSession(user.id);
  redirect("/app");
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: NonNullable<
    Extract<AuthFormState, { ok: false }>["fieldErrors"]
  > = {};
  if (!name) fieldErrors.name = "Name is required.";
  if (!email || !email.includes("@")) fieldErrors.email = "Enter a valid email.";
  const pwErr = validatePassword(password);
  if (pwErr) fieldErrors.password = pwErr;
  if (!pwErr && confirmPassword !== password)
    fieldErrors.confirmPassword = "Passwords do not match.";
  if (Object.keys(fieldErrors).length) {
    return { ok: false, fieldErrors };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const emailRedirectTo = `${await getRequestOrigin()}/auth/confirm?next=/app`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        return {
          ok: false,
          fieldErrors: { email: "An account with that email already exists." },
        };
      }

      return { ok: false, error: error.message };
    }

    if (data.user) {
      await ensureMirrorUser({
        id: data.user.id,
        email,
        name,
      });
    }

    await deleteSession();

    if (data.session) {
      redirect("/app");
    }

    return {
      ok: true,
      message:
        "Check your email to confirm your account, then come back to sign in.",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      fieldErrors: { email: "An account with that email already exists." },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      // Sensible defaults for the financial fields — the user fills these in
      // later through the app (or we ship an onboarding flow in a later phase).
      incomeNet: 0,
      incomeGross: 0,
      expensesMonthly: 0,
    },
  });

  await createSession(user.id);
  redirect("/app");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  await deleteSession();
  redirect("/");
}
