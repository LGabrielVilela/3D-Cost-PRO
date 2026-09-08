import type { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  children: ReactNode;
}

/** Agrupa um conjunto de `StatCard` sob um título — separa Orçamentos, Pedidos e Calculadora. */
export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <div className="space-y-2.5">
      <h2 className="px-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}
