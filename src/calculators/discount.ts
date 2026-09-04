import { applyPercentual, clampNonNegative, sumCentavos } from "@/lib/money";

export interface DiscountResult {
  precoOriginalCentavos: number;
  descontoPercentual: number;
  descontoCentavos: number;
  precoFinalCentavos: number;
  /** Margem real resultante após o desconto, considerando o custo total. */
  margemAposDescontoPercentual: number;
  /** `true` quando o preço com desconto cai abaixo do preço mínimo. */
  abaixoDoPrecoMinimo: boolean;
}

/**
 * Aplica um desconto percentual sobre um preço e avalia o impacto na margem,
 * alertando quando o resultado cai abaixo do preço mínimo (custo coberto).
 */
export function calculateDiscount(
  precoCentavos: number,
  descontoPercentual: number,
  custoTotalCentavos: number,
  precoMinimoCentavos: number,
): DiscountResult {
  const precoOriginalCentavos = clampNonNegative(precoCentavos);
  const desconto = clampNonNegative(descontoPercentual);
  const descontoCentavos = applyPercentual(precoOriginalCentavos, desconto);
  const precoFinalCentavos = Math.max(0, precoOriginalCentavos - descontoCentavos);

  const margemAposDescontoPercentual =
    precoFinalCentavos === 0 ? 0 : ((precoFinalCentavos - custoTotalCentavos) / precoFinalCentavos) * 100;

  return {
    precoOriginalCentavos,
    descontoPercentual: desconto,
    descontoCentavos,
    precoFinalCentavos,
    margemAposDescontoPercentual,
    abaixoDoPrecoMinimo: precoFinalCentavos < clampNonNegative(precoMinimoCentavos),
  };
}

/** Soma auxiliar exposta para reaproveitamento em outros cálculos (ex: totais de orçamento). */
export function sumWithDiscount(subtotalCentavos: number, descontoCentavos: number): number {
  return Math.max(0, sumCentavos(subtotalCentavos, -descontoCentavos));
}
