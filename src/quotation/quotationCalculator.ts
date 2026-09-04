import { applyPercentual, clampNonNegative, multiplyCentavos, sumCentavos } from "@/lib/money";
import type { DiscountType, QuoteItem } from "@/types/entities";

/**
 * Matemática do orçamento: subtotal, desconto (percentual OU valor fixo) e
 * total. Reaproveita os utilitários de `lib/money.ts` — nenhuma fórmula
 * nova é criada aqui, apenas a composição dos itens do orçamento.
 */

/** Total de um item: quantidade × preço unitário. */
export function calculateItemTotal(quantidade: number, precoUnitarioCentavos: number): number {
  const qtd = Math.max(0, Math.round(clampNonNegative(quantidade)));
  return multiplyCentavos(clampNonNegative(precoUnitarioCentavos), qtd);
}

/** Soma o total de todos os itens do orçamento. */
export function calculateSubtotal(itens: Pick<QuoteItem, "totalCentavos">[]): number {
  return sumCentavos(...itens.map((item) => item.totalCentavos));
}

export interface QuoteDiscountResult {
  descontoCentavos: number;
  totalCentavos: number;
}

/**
 * Calcula o valor do desconto e o total final do orçamento.
 *   - "percentual": desconto = subtotal × percentual / 100
 *   - "valorFixo": desconto = valor informado (limitado ao subtotal, nunca negativo)
 */
export function calculateQuoteDiscount(
  subtotalCentavos: number,
  tipo: DiscountType,
  valor: number,
): QuoteDiscountResult {
  const subtotal = clampNonNegative(subtotalCentavos);

  const descontoCentavos =
    tipo === "percentual"
      ? applyPercentual(subtotal, clampNonNegative(valor))
      : Math.min(subtotal, clampNonNegative(valor));

  return {
    descontoCentavos,
    totalCentavos: Math.max(0, subtotal - descontoCentavos),
  };
}

export interface QuoteTotalsInput {
  itens: Pick<QuoteItem, "totalCentavos">[];
  descontoTipo: DiscountType;
  /** Percentual (0-100) quando `descontoTipo === "percentual"`, ou centavos quando "valorFixo". */
  descontoValor: number;
}

export interface QuoteTotals {
  subtotalCentavos: number;
  descontoCentavos: number;
  totalCentavos: number;
}

/** Calcula subtotal, desconto e total de uma vez — usado pelo formulário e pelo PDF. */
export function calculateQuoteTotals(input: QuoteTotalsInput): QuoteTotals {
  const subtotalCentavos = calculateSubtotal(input.itens);
  const { descontoCentavos, totalCentavos } = calculateQuoteDiscount(
    subtotalCentavos,
    input.descontoTipo,
    input.descontoValor,
  );
  return { subtotalCentavos, descontoCentavos, totalCentavos };
}
