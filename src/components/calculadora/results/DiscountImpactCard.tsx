import type { DiscountResult } from "@/calculators/discount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCentavos, formatPercentual } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Impacto do desconto configurado sobre o preço de anúncio e a margem. */
export function DiscountImpactCard({ discount }: { discount: DiscountResult }) {
  if (discount.descontoPercentual === 0) return null;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Impacto do desconto</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Preço original</p>
          <p className="font-medium tabular-nums">{formatCentavos(discount.precoOriginalCentavos)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            Desconto ({formatPercentual(discount.descontoPercentual)})
          </p>
          <p className="font-medium tabular-nums text-destructive">
            − {formatCentavos(discount.descontoCentavos)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Preço final</p>
          <p className="font-semibold tabular-nums">{formatCentavos(discount.precoFinalCentavos)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Margem após desconto</p>
          <p
            className={cn(
              "font-medium tabular-nums",
              discount.abaixoDoPrecoMinimo ? "text-destructive" : "text-success",
            )}
          >
            {formatPercentual(discount.margemAposDescontoPercentual)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
