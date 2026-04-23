"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm({ enabled }: { enabled: boolean }) {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState(
    enabled ? "Checking recovery link…" : "Supabase is not configured.",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    const code = searchParams.get("code");
    const upstreamError =
      searchParams.get("error_description") ?? searchParams.get("error");

    async function bootstrap() {
      if (upstreamError) {
        if (!cancelled) {
          setError(upstreamError);
          setStatus("Recovery link could not be verified.");
        }
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) {
            setError(exchangeError.message);
            setStatus("Recovery link could not be verified.");
          }
          return;
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (sessionError) {
        setError(sessionError.message);
        setStatus("Recovery session could not be loaded.");
        return;
      }

      if (!session) {
        setError("This recovery link is missing, expired, or has already been used.");
        setStatus("No recovery session found.");
        return;
      }

      setReady(true);
      setStatus("Recovery verified. Set a new password.");
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(Boolean(session));
        setError(null);
        setStatus("Recovery verified. Set a new password.");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [enabled, searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!enabled) {
      setError("Supabase is not configured yet.");
      return;
    }

    if (!ready) {
      setError("Open this page from a valid Supabase recovery link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const supabase = createClient();
    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setPending(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setPending(false);
    setSuccess("Password updated. You can return to sign in once the app auth migration is complete.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-rule bg-paper-2 px-4 py-4 font-sans text-[12px] leading-6 text-ink-3">
        {status}
      </div>

      {!enabled && (
        <p className="font-mono text-[11px] text-negative">
          Supabase env is missing. Add the publishable URL and key first.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label className="label-mono" htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className={inputCls}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={!enabled || !ready || pending}
        />
        <span className="font-sans text-[11px] text-ink-3">
          At least 8 characters.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="label-mono" htmlFor="confirm-password">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          className={inputCls}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={!enabled || !ready || pending}
        />
      </div>

      {error && <p className="font-mono text-[11px] text-negative">{error}</p>}
      {success && (
        <p className="font-mono text-[11px] text-positive">
          {success}{" "}
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      )}

      <button
        type="submit"
        disabled={!enabled || !ready || pending}
        className="btn btn-primary mt-2"
      >
        {pending ? "Updating password…" : "Update password"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-3 bg-paper border-b border-rule focus:border-ink focus:outline-none font-sans text-[14px] text-ink placeholder:text-ink-3 disabled:text-ink-3 disabled:cursor-not-allowed";
