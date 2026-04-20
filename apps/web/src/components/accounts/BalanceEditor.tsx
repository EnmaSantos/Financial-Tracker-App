"use client";

import { useState, useTransition } from "react";
import { updateAccountBalance } from "@/app/actions/accounts";
import { fmt$ } from "@/lib/money";

type Props = {
  accountId: string;
  balance: number;
  /** `true` for debt accounts (stored negative). */
  isDebt: boolean;
};

export function BalanceEditor({ accountId, balance, isDebt }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(Math.abs(balance)));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function start() {
    setDraft(String(Math.abs(balance)));
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function save() {
    const value = Number(draft.replace(/,/g, ""));
    if (!Number.isFinite(value)) {
      setError("Enter a number.");
      return;
    }
    startTransition(async () => {
      const result = await updateAccountBalance(accountId, value);
      if (result.ok) {
        setEditing(false);
      } else {
        setError(result.error);
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        className="num text-[16px] text-right hover:underline decoration-dotted underline-offset-4"
        aria-label="Edit balance"
      >
        {fmt$(balance)}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-ink-3 text-[13px]">
          {isDebt ? "−$" : "$"}
        </span>
        <input
          type="text"
          inputMode="decimal"
          autoFocus
          value={draft}
          disabled={pending}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="num text-[16px] text-right w-28 px-1 py-0.5 bg-transparent border-b border-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-ink text-paper disabled:opacity-50"
        >
          {pending ? "…" : "Save"}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm text-ink-3 hover:text-ink"
        >
          Cancel
        </button>
      </div>
      {error && (
        <span className="font-mono text-[10px] text-negative">{error}</span>
      )}
    </div>
  );
}
