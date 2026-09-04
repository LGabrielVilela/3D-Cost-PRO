import { Card, CardContent } from "@/components/ui/card";
import { formatCentavos, formatPercentual } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { CalculationPricingResult } from "@/types/entities";

interface Props {
  precos: CalculationPricingResult;
  margemRealPercentual: number;
}

/** Os três preços sugeridos: mínimo, recomendado e de anúncio. */
export function SuggestedPricesCards({ precos, margemRealPercentual }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="border-border/70 shadow-sm">
        <CardContent className="px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">Preço mínimo</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatCentavos(precos.precoMinimoCentavos)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Abaixo disso, você vende no prejuízo</p>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">Preço recomendado</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {formatCentavos(precos.precoRecomendadoCentavos)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Margem real de {formatPercentual(margemRealPercentual)}
          </p>
        </CardContent>
      </Card>

      <Card className={cn("border-2 border-brand-amber/60 bg-brand-amber/5 shadow-sm")}>
        <CardContent className="px-4 py-4">
          <p className="text-xs font-medium text-brand-amber-foreground">Preço de anúncio</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-brand-amber-foreground">
            {formatCentavos(precos.precoAnuncioCentavos)}
          </p>
          <p className="mt-1 text-xs text-brand-amber-foreground/70">
            Arredondado para um valor comercial
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
