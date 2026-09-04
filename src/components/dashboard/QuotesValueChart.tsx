"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { centavosToReais, formatCentavos } from "@/lib/money";
import type { PeriodPoint } from "@/lib/dashboardStats";

interface Props {
  data: PeriodPoint[];
}

export function QuotesValueChart({ data }: Props) {
  const chartData = data.map((point) => ({
    ...point,
    valorReais: centavosToReais(point.valorCentavos),
  }));

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Valor dos orçamentos</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="quotesValueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={48}
              stroke="var(--muted-foreground)"
              tickFormatter={(value: number) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`
              }
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              formatter={(value) => [formatCentavos(Math.round(Number(value) * 100)), "Valor"]}
            />
            <Area
              type="monotone"
              dataKey="valorReais"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#quotesValueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
