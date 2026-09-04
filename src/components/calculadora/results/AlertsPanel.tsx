import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import type { AlertItem } from "@/calculators/types";
import { cn } from "@/lib/utils";

const ESTILOS: Record<AlertItem["level"], { icon: typeof AlertTriangle; className: string }> = {
  danger: {
    icon: XCircle,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/40 bg-warning/15 text-warning-foreground",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success/10 text-success",
  },
  info: {
    icon: Info,
    className: "border-border bg-muted text-muted-foreground",
  },
};

/** Lista de alertas inteligentes gerados a partir do resultado do cálculo. */
export function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        const { icon: Icon, className } = ESTILOS[alert.level];
        return (
          <div
            key={index}
            role={alert.level === "danger" ? "alert" : undefined}
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
              className,
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{alert.message}</span>
          </div>
        );
      })}
    </div>
  );
}
