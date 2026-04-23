"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleAuthButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/confirm?next=/app`;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message);
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      setError("Unable to start Google sign-in.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start Google sign-in.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="btn btn-ghost w-full justify-center"
      >
        {pending ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {error ? <p className="font-mono text-[11px] text-negative">{error}</p> : null}
    </div>
  );
}
