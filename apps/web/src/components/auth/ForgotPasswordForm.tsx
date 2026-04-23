"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm({ enabled }: { enabled: boolean }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!enabled) {
      setError(
        "Supabase is not configured yet. Add the publishable URL and key in apps/web/.env.local first.",
      );
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/update-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(
        "If that email exists in Supabase Auth, a recovery link has been sent.",
      );
      setEmail("");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start password recovery.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-rule bg-paper-2 px-4 py-4 font-sans text-[12px] leading-6 text-ink-3">
        This flow is for accounts that already live in Supabase Auth. The current Prisma-based
        login remains separate until the auth migration is completed.
      </div>

      <div className="flex flex-col gap-2">
        <label className="label-mono" htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputCls}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <span className="font-sans text-[11px] text-ink-3">
          The reset email will redirect back to <span className="font-mono text-ink">/update-password</span>.
        </span>
      </div>

      {error && <p className="font-mono text-[11px] text-negative">{error}</p>}
      {success && <p className="font-mono text-[11px] text-positive">{success}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? "Sending reset link…" : "Send reset link"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-3 bg-paper border-b border-rule focus:border-ink focus:outline-none font-sans text-[14px] text-ink placeholder:text-ink-3";
