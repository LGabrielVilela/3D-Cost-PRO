import { applyPercentual, clampNonNegative } from "@/lib/money";
import type { QuantityTier } from "@/types/entities";
import type { QuantityPricingRow } from "./types";
import { calculateRealMargin } from "./pricing";

/** Faixas padrão de desconto por quantidade, sugeridas na criação de um novo cálculo. */
export const DEFAULT_QUANTITY_TIERS: Omit<QuantityTier, "id">[] = [
  { quantidade: 1, descontoPercentual: 0 },
  { quantidade: 5, descontoPercentual: 4 },
  { quantidade: 10, descontoPercentual: 10 },
  { quantidade: 25, descontoPercentual: 16 },
  { quantidade: 50, descontoPercentual: 22 },
];

/**
 * Monta a tabela de "preços por quantidade": para cada faixa cadastrada,
 * aplica o desconto sobre o preço unitário base e calcula a margem real
 * resultante frente ao custo unitário.
 */
export function calculateQuantityPricing(
  precoUnitarioBaseCentavos: number,
  custoUnitarioCentavos: number,
  faixas: QuantityTier[],
): QuantityPricingRow[] {
  const precoBase = clampNonNegative(precoUnitarioBaseCentavos);
  const custoUnitario = clampNonNegative(custoUnitarioCentavos);

  return [...faixas]
    .sort((a, b) => a.quantidade - b.quantidade)
    .map((faixa) => {
      const descontoPercentual = clampNonNegative(faixa.descontoPercentual);
      const descontoCentavos = applyPercentual(precoBase, descontoPercentual);
      const precoUnitarioCentavos = Math.max(0, precoBase - descontoCentavos);
      const quantidade = Math.max(1, Math.round(clampNonNegative(faixa.quantidade)) || 1);

      return {
        tierId: faixa.id,
        quantidade,
        descontoPercentual,
        precoUnitarioCentavos,
        totalCentavos: precoUnitarioCentavos * quantidade,
        margemPercentual: calculateRealMargin(custoUnitario, precoUnitarioCentavos),
      };
    });
}
