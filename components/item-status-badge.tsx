import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

type Status = "HEALTHY" | "ERROR" | "STALE";

const statusConfig: Record<
  Status,
  {
    label: string;
    variant: "success" | "destructive" | "warning";
    icon: typeof CheckCircle2;
  }
> = {
  HEALTHY: { label: "Healthy", variant: "success", icon: CheckCircle2 },
  ERROR: { label: "Error", variant: "destructive", icon: AlertTriangle },
  STALE: { label: "Stale", variant: "warning", icon: Clock },
};

export function ItemStatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? statusConfig.HEALTHY;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
