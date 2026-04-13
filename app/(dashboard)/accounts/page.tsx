import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItemStatusBadge } from "@/components/item-status-badge";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { formatCurrency } from "@/lib/utils";
import { Landmark } from "lucide-react";

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const plaidItems = await prisma.plaidItem.findMany({
    where: { userId: session.user.id },
    include: { bankAccounts: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Connected Accounts"
        description="Manage your bank connections and monitor pipeline health"
      >
        <PlaidLinkButton />
      </DashboardHeader>

      <div className="p-8 space-y-6">
        {plaidItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-[4px] bg-slate-100 mb-4">
                <Landmark className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 font-[family-name:var(--font-heading)]">
                No accounts connected
              </h3>
              <p className="mt-1 text-sm text-muted-foreground mb-6">
                Connect your first bank account to start tracking your finances.
              </p>
              <PlaidLinkButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {plaidItems.map((item) => {
              const totalBalance = item.bankAccounts.reduce(
                (sum, a) => sum + (a.currentBalance ?? 0),
                0
              );

              return (
                <Card key={item.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-navy">
                        <Landmark className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {item.institutionName || "Unknown Institution"}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {item.bankAccounts.length} account
                          {item.bankAccounts.length !== 1 ? "s" : ""} &middot;
                          Last synced{" "}
                          {item.lastSynced
                            ? new Date(item.lastSynced).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ItemStatusBadge
                        status={item.status as "HEALTHY" | "ERROR" | "STALE"}
                      />
                      {(item.status === "ERROR" ||
                        item.status === "STALE") && (
                        <PlaidLinkButton
                          plaidItemId={item.id}
                          variant="destructive"
                          label="Reconnect"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.errorCode && (
                      <div className="mb-4 rounded-[4px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        Error: {item.errorCode.replace(/_/g, " ")}
                      </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {item.bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between rounded-[4px] border border-border p-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {account.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {account.type}
                                {account.subtype ? ` / ${account.subtype}` : ""}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm font-semibold tabular-nums">
                            {formatCurrency(account.currentBalance ?? 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-sm text-muted-foreground">
                        Total Balance
                      </span>
                      <span className="text-base font-bold tabular-nums font-[family-name:var(--font-heading)]">
                        {formatCurrency(totalBalance)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Sync Activity Log */}
        {plaidItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-medium text-muted-foreground">
                        Institution
                      </th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">
                        Last Synced
                      </th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">
                        Accounts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {plaidItems.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium">
                          {item.institutionName || "Unknown"}
                        </td>
                        <td className="py-3">
                          <ItemStatusBadge
                            status={
                              item.status as "HEALTHY" | "ERROR" | "STALE"
                            }
                          />
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {item.lastSynced
                            ? new Date(item.lastSynced).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="py-3 text-right tabular-nums">
                          {item.bankAccounts.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
