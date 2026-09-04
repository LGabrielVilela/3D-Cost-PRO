"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import type { StatusSlice } from "@/lib/dashboardStats";
import { FileText } from "lucide-react";

interface Props {
  data: StatusSlice[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--success)",
  "var(--destructive)",
];

export function QuoteStatusChart({ data }: Props) {
  const total = data.reduce((acc, d) => acc + d.quantidade, 0);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Status dos orçamentos</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {total === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum orçamento ainda"
            description="Crie seu primeiro orçamento para ver a distribuição por status aqui."
          />
        ) : (
          <div className="flex h-full items-center gap-4">
            <div className="h-full w-1/2 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="quantidade"
                    nameKey="label"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {data.map((entry, index) => (
                <li key={entry.status} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {entry.label}
                  </span>
                  <span className="font-medium text-foreground">{entry.quantidade}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
