"use client";

import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { Landmark, Loader2 } from "lucide-react";

interface PlaidLinkButtonProps {
  plaidItemId?: string;
  onSuccess?: () => void;
  variant?: "default" | "outline" | "destructive";
  label?: string;
}

export function PlaidLinkButton({
  plaidItemId,
  onSuccess,
  variant = "default",
  label = "Connect Bank",
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plaidItemId }),
      });
      const data = await res.json();
      if (data.linkToken) {
        setLinkToken(data.linkToken);
      }
    } catch (err) {
      console.error("Failed to get link token:", err);
    } finally {
      setLoading(false);
    }
  }, [plaidItemId]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicToken,
            institutionId: metadata.institution?.institution_id,
            institutionName: metadata.institution?.name,
          }),
        });
        onSuccess?.();
      } catch (err) {
        console.error("Token exchange failed:", err);
      }
    },
    onExit: () => {
      setLinkToken(null);
    },
  });

  const handleClick = async () => {
    if (linkToken && ready) {
      open();
    } else {
      await fetchLinkToken();
    }
  };

  // Auto-open when link token is ready
  if (linkToken && ready) {
    open();
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Landmark className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
