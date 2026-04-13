"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  balance: number;
}

export function NetWorthChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Balance data will appear here after your first sync.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#003366" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#003366" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={(val: string) => {
            const d = new Date(val);
            return d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={(val: number) =>
            `$${(val / 1000).toFixed(0)}k`
          }
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [formatCurrency(Number(value)), "Net Worth"]}
          labelFormatter={(label) =>
            new Date(String(label)).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          }
          contentStyle={{
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
          }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#003366"
          strokeWidth={2}
          fill="url(#balanceGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
