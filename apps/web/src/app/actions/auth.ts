"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@ledger/db";
import { createSession, deleteSession } from "@/lib/session";

export type AuthFormState =
  | { ok: true }
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

  const user = await prisma.user.findUnique({ where: { email } });
  // Same response for missing user and bad password — avoids enumerating
  // registered emails.
  const genericFail = { ok: false as const, error: "Invalid email or password." };
  if (!user || !user.passwordHash) return genericFail;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return genericFail;

  await createSession(user.id);
  redirect("/");
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
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
