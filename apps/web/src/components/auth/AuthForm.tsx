"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import type { AuthFormState } from "@/app/actions/auth";
import { login, signup } from "@/app/actions/auth";

type Mode = "login" | "signup";

const initialState: AuthFormState = null;

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const topError =
    state && !state.ok && !Object.keys(fieldErrors).length
      ? state.error
      : null;

  const [password, setPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (mode !== "signup") return;
    const form = e.currentTarget;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value ?? "";
    if (confirm !== password) {
      e.preventDefault();
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError("");
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {mode === "signup" && (
        <Field label="Name" error={fieldErrors.name}>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className={inputCls}
          />
        </Field>
      )}

      <Field label="Email" error={fieldErrors.email}>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputCls}
        />
      </Field>

      <Field
        label="Password"
        error={fieldErrors.password}
        hint={mode === "signup" ? "At least 8 characters." : undefined}
      >
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={inputCls}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setConfirmError("");
          }}
        />
      </Field>

      {mode === "signup" && (
        <Field
          label="Confirm password"
          error={fieldErrors.confirmPassword ?? (confirmError || undefined)}
        >
          <input
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={inputCls}
            onChange={() => setConfirmError("")}
          />
        </Field>
      )}

      {topError && (
        <p className="font-mono text-[11px] text-negative">{topError}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending
          ? mode === "login"
            ? "Signing in…"
            : "Creating account…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="font-sans text-[12px] text-ink-3 text-center">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link href="/signup" className="underline text-ink">
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="underline text-ink">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-3 bg-paper border-b border-rule focus:border-ink focus:outline-none font-sans text-[14px] text-ink placeholder:text-ink-3";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label-mono">{label}</label>
      {children}
      {hint && !error && (
        <span className="font-sans text-[11px] text-ink-3">{hint}</span>
      )}
      {error && (
        <span className="font-mono text-[10px] text-negative">{error}</span>
      )}
    </div>
  );
}
