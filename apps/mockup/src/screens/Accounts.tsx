import type { Account } from "@ledger/shared";
import { Card, Pill, SectionHead, fmt$ } from "../design/ui";
import { useAccounts } from "../lib/queries";

export function Accounts() {
  const { data, isLoading } = useAccounts();
  if (isLoading || !data) return <div style={{ color: "var(--ink-3)" }}>loading…</div>;

  const groups: { label: string; rows: Account[]; tone: "neutral" | "accent" | "positive" }[] = [
    { label: "Cash",        rows: data.accounts.filter((a) => a.type === "cash"),       tone: "neutral" },
    { label: "Investments", rows: data.accounts.filter((a) => a.type === "investment"), tone: "positive" },
    { label: "Debt",        rows: data.accounts.filter((a) => a.type === "debt"),       tone: "accent" },
  ];

  return (
    <>
      <SectionHead
        kicker="Accounts"
        title="A full count, room by room"
        subtitle="Balances are stored in the API. Debts are shown as negative numbers."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {groups.map((g) => {
          const subtotal = g.rows.reduce((sum, r) => sum + r.balance, 0);
          return (
            <Card
              key={g.label}
              flush
              kicker={g.label}
              title={fmt$(subtotal)}
              action={<Pill tone={g.tone}>{g.rows.length} accounts</Pill>}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {g.rows.map((a) => (
                    <tr key={a.id} style={{ borderTop: "1px solid var(--rule)" }}>
                      <td style={{ padding: "12px 0", fontFamily: "var(--serif-text)" }}>
                        <div style={{ fontSize: 15 }}>{a.name}</div>
                        <div className="label-mono" style={{ marginTop: 2 }}>
                          {a.institution} · updated {a.updated}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 0",
                          textAlign: "right",
                          fontFamily: "var(--mono)",
                          fontSize: 15,
                        }}
                      >
                        {fmt$(a.balance)}
                        {a.apr != null && (
                          <div className="label-mono" style={{ marginTop: 2 }}>
                            apr {a.apr}%
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          );
        })}
      </div>
    </>
  );
}
