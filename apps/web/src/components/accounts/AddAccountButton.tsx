"use client";

import { useState } from "react";
import { AddAccountForm } from "./AddAccountForm";

export function AddAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary"
      >
        + Add account
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-account-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-md bg-paper border border-rule rounded-xl p-6"
            style={{ boxShadow: "var(--shadow-2)" }}
          >
            <header className="mb-5">
              <div className="label-kicker">New account</div>
              <h2
                id="add-account-title"
                className="display mt-1"
                style={{ fontSize: 24 }}
              >
                Add to your ledger
              </h2>
            </header>
            <AddAccountForm onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
