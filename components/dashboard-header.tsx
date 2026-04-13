"use client";

import { useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  children,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);

  async function handleRefresh() {
    setSyncing(true);
    try {
      const res = await fetch("/api/plaid/sync-all", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setSyncing(false);
      window.location.reload();
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={syncing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
          {syncing ? "Syncing..." : "Refresh"}
        </Button>
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="h-8 w-8 rounded-full border border-border"
          />
        )}
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
