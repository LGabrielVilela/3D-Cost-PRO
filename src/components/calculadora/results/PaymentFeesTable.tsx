import { AlertTriangle } from "lucide-react";

import type { PaymentFeeRow } from "@/calculators/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentavos, formatPercentual } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Preço necessário em cada forma de pagamento para preservar a margem recomendada. */
export function PaymentFeesTable({ rows }: { rows: PaymentFeeRow[] }) {
  if (rows.length === 0) return null;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Taxas e formas de pagamento</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0 sm:px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Forma</TableHead>
              <TableHead className="text-right">Taxa</TableHead>
              <TableHead className="text-right">Preço necessário</TableHead>
              <TableHead className="text-right">Líquido no anúncio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.feeId}>
                <TableCell className="font-medium">
                  {row.nome}
                  {row.parcelas && row.parcelas > 1 ? ` (${row.parcelas}x)` : ""}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatPercentual(row.taxaPercentual)}
                  {row.taxaFixaCentavos > 0 ? ` + ${formatCentavos(row.taxaFixaCentavos)}` : ""}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCentavos(row.precoNecessarioCentavos)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    row.eliminaLucro ? "font-medium text-destructive" : "text-muted-foreground",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {row.eliminaLucro ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
                    {formatCentavos(row.liquidoNoPrecoAnuncioCentavos)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
