import { Pencil, Trash2 } from "lucide-react";

import { calculateDepreciation } from "@/calculators/depreciation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentavos, sumCentavos } from "@/lib/money";
import type { Printer } from "@/types/entities";

interface PrintersTableProps {
  printers: Printer[];
  onEdit: (printer: Printer) => void;
  onDelete: (printer: Printer) => void;
}

/** Depreciação/hora reaproveitando a mesma fórmula da calculadora (1h de impressão). */
function depreciacaoPorHoraCentavos(printer: Printer): number {
  return calculateDepreciation({
    ativa: true,
    precoImpressoraCentavos: printer.precoAquisicaoCentavos,
    vidaUtilHoras: printer.vidaUtilHoras,
    tempoImpressaoMinutos: 60,
  });
}

/** Tabela de impressoras cadastradas, com depreciação/hora e custo operacional/hora calculados. */
export function PrintersTable({ printers, onEdit, onDelete }: PrintersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Marca / Modelo</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Consumo</TableHead>
            <TableHead className="text-right">Depreciação/h</TableHead>
            <TableHead className="hidden text-right lg:table-cell">Custo operacional/h</TableHead>
            <TableHead className="w-20 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {printers.map((printer) => {
            const depreciacaoHora = depreciacaoPorHoraCentavos(printer);
            const custoOperacionalHora = sumCentavos(depreciacaoHora, printer.manutencaoPorHoraCentavos);

            return (
              <TableRow key={printer.id}>
                <TableCell className="font-medium">{printer.nome}</TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {[printer.marca, printer.modelo].filter(Boolean).join(" · ") || "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCentavos(printer.precoAquisicaoCentavos)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                  {printer.consumoWatts}W
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCentavos(depreciacaoHora)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
                  {formatCentavos(custoOperacionalHora)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${printer.nome}`}
                      onClick={() => onEdit(printer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${printer.nome}`}
                      onClick={() => onDelete(printer)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
