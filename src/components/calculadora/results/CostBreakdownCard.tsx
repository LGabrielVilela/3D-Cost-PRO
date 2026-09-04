import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCentavos } from "@/lib/money";
import type { CalculationCostBreakdown } from "@/types/entities";

interface Props {
  custos: CalculationCostBreakdown;
  quantidadePecas: number;
}

const LINHAS: Array<{ key: keyof CalculationCostBreakdown; label: string }> = [
  { key: "filamentoCentavos", label: "Filamento" },
  { key: "energiaCentavos", label: "Energia" },
  { key: "depreciacaoCentavos", label: "Depreciação" },
  { key: "manutencaoCentavos", label: "Manutenção" },
  { key: "perdasCentavos", label: "Perdas" },
  { key: "maoDeObraCentavos", label: "Mão de obra" },
  { key: "embalagemCentavos", label: "Embalagem" },
  { key: "outrosCentavos", label: "Outros" },
];

/** Painel "Custo da produção" — breakdown item a item até o custo total. */
export function CostBreakdownCard({ custos, quantidadePecas }: Props) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Custo da produção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <dl className="space-y-1.5 text-sm">
          {LINHAS.map((linha) => (
            <div key={linha.key} className="flex items-center justify-between">
              <dt className="text-muted-foreground">{linha.label}</dt>
              <dd className="font-medium tabular-nums">{formatCentavos(custos[linha.key])}</dd>
            </div>
          ))}
        </dl>

        <Separator />

        <div className="flex items-center justify-between text-base font-semibold">
          <span>Custo total</span>
          <span className="tabular-nums">{formatCentavos(custos.custoTotalCentavos)}</span>
        </div>

        {quantidadePecas > 1 ? (
          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              Custo por unidade ({quantidadePecas} peças)
            </span>
            <span className="font-medium tabular-nums">
              {formatCentavos(custos.custoPorUnidadeCentavos)}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
