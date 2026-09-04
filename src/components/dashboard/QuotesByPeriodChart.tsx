"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PeriodPoint } from "@/lib/dashboardStats";

interface Props {
  data: PeriodPoint[];
}

export function QuotesByPeriodChart({ data }: Props) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Orçamentos por período</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={28}
              stroke="var(--muted-foreground)"
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              formatter={(value) => [`${value}`, "Orçamentos"]}
            />
            <Bar dataKey="quantidade" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
