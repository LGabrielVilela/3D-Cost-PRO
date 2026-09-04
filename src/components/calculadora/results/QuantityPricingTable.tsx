import type { QuantityPricingRow } from "@/calculators/types";
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

/** Tabela de preços por quantidade — preço unitário, desconto, total e margem por faixa. */
export function QuantityPricingTable({ rows }: { rows: QuantityPricingRow[] }) {
  if (rows.length === 0) return null;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Preços por quantidade</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0 sm:px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantidade</TableHead>
              <TableHead className="text-right">Preço unitário</TableHead>
              <TableHead className="text-right">Desconto</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Margem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.tierId}>
                <TableCell className="font-medium">{row.quantidade} un.</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCentavos(row.precoUnitarioCentavos)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.descontoPercentual > 0 ? formatPercentual(row.descontoPercentual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCentavos(row.totalCentavos)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatPercentual(row.margemPercentual)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
