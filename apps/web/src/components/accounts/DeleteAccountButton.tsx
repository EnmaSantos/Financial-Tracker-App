"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/app/actions/accounts";

export function DeleteAccountButton({ accountId }: { accountId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Remove this account? This cannot be undone.")) return;
        startTransition(async () => {
          await deleteAccount(accountId);
        });
      }}
      className="font-mono text-[10px] uppercase tracking-wider text-ink-3 hover:text-negative disabled:opacity-50"
      aria-label="Delete account"
    >
      {pending ? "…" : "Remove"}
    </button>
  );
}
