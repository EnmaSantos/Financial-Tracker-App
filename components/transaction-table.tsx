"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, ChevronUp, ChevronDown, Clock } from "lucide-react";

interface SerializedTransaction {
  id: string;
  date: string;
  name: string;
  merchantName: string | null;
  amount: number;
  categoryPrimary: string | null;
  categoryDetailed: string | null;
  categoryOverride: string | null;
  pending: boolean;
  accountName: string;
  accountType: string;
}

type SortField = "date" | "amount" | "name" | "category";
type SortDir = "asc" | "desc";

export function TransactionTable({
  transactions,
}: {
  transactions: SerializedTransaction[];
}) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    let result = transactions;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.merchantName?.toLowerCase().includes(q) ||
          t.categoryPrimary?.toLowerCase().includes(q) ||
          t.accountName.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "date":
          return (
            dir *
            (new Date(a.date).getTime() - new Date(b.date).getTime())
          );
        case "amount":
          return dir * (a.amount - b.amount);
        case "name":
          return dir * (a.name || "").localeCompare(b.name || "");
        case "category":
          return (
            dir *
            (a.categoryPrimary || "").localeCompare(b.categoryPrimary || "")
          );
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, search, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search transactions, merchants, categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {(
                [
                  ["date", "Date"],
                  ["name", "Merchant"],
                  ["category", "Category"],
                  ["amount", "Amount"],
                ] as [SortField, string][]
              ).map(([field, label]) => (
                <th
                  key={field}
                  className="group cursor-pointer pb-3 text-left font-medium text-muted-foreground select-none"
                  onClick={() => toggleSort(field)}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    <SortIcon field={field} />
                  </span>
                </th>
              ))}
              <th className="pb-3 text-left font-medium text-muted-foreground">
                Account
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  {search ? "No transactions match your search." : "No transactions yet."}
                </td>
              </tr>
            ) : (
              filtered.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 tabular-nums text-muted-foreground">
                    {formatDate(txn.date)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {txn.merchantName || txn.name}
                      </span>
                      {txn.pending && (
                        <Clock className="h-3 w-3 text-warning" />
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    {(txn.categoryOverride || txn.categoryPrimary) && (
                      <Badge variant="secondary" className="text-[10px]">
                        {(
                          txn.categoryOverride ??
                          txn.categoryPrimary ??
                          ""
                        )
                          .replace(/_/g, " ")
                          .toLowerCase()}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-semibold tabular-nums ${
                        txn.amount > 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      {txn.amount > 0 ? "-" : "+"}
                      {formatCurrency(Math.abs(txn.amount))}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {txn.accountName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {transactions.length} transactions
      </div>
    </div>
  );
}
