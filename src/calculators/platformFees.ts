import { clampNonNegative } from "@/lib/money";
import type { PaymentFeeRow } from "./types";
import type { PaymentMethodFee } from "@/types/entities";

/**
 * Valor líquido recebido depois que a taxa (percentual + fixa) de uma forma
 * de pagamento/plataforma é descontada de um preço de venda.
 */
export function calculateNetAfterFee(
  precoCentavos: number,
  taxaPercentual: number,
  taxaFixaCentavos: number,
): number {
  const preco = clampNonNegative(precoCentavos);
  const taxa = clampNonNegative(taxaPercentual);
  const fixa = clampNonNegative(taxaFixaCentavos);
  return Math.round(preco * (1 - taxa / 100) - fixa);
}

/**
 * Preço que precisa ser cobrado para que, DEPOIS da taxa (percentual + fixa)
 * descontada, sobre exatamente `liquidoDesejadoCentavos` — preserva a margem
 * configurada mesmo em formas de pagamento com taxa.
 *
 *   preço = (líquido desejado + taxa fixa) / (1 - taxa% / 100)
 */
export function calculatePriceForDesiredNet(
  liquidoDesejadoCentavos: number,
  taxaPercentual: number,
  taxaFixaCentavos: number,
): number {
  const liquido = clampNonNegative(liquidoDesejadoCentavos);
  const taxa = clampNonNegative(taxaPercentual);
  const fixa = clampNonNegative(taxaFixaCentavos);

  const divisor = 1 - taxa / 100;
  if (divisor <= 0) return liquido + fixa; // taxa >= 100%: não há preço finito que compense
  return Math.round((liquido + fixa) / divisor);
}

/**
 * Monta a tabela de "taxas e formas de pagamento": para cada forma cadastrada,
 * calcula o preço necessário para preservar o preço recomendado como líquido,
 * e verifica se cobrar apenas o preço de anúncio (sem ajuste) ainda cobre o custo.
 */
export function calculatePaymentFeeRows(
  taxas: PaymentMethodFee[],
  precoRecomendadoCentavos: number,
  precoAnuncioCentavos: number,
  custoTotalCentavos: number,
): PaymentFeeRow[] {
  return taxas.map((taxa) => {
    const precoNecessarioCentavos = calculatePriceForDesiredNet(
      precoRecomendadoCentavos,
      taxa.taxaPercentual,
      taxa.taxaFixaCentavos,
    );
    const liquidoNoPrecoAnuncioCentavos = calculateNetAfterFee(
      precoAnuncioCentavos,
      taxa.taxaPercentual,
      taxa.taxaFixaCentavos,
    );

    return {
      feeId: taxa.id,
      nome: taxa.nome,
      taxaPercentual: taxa.taxaPercentual,
      taxaFixaCentavos: taxa.taxaFixaCentavos,
      parcelas: taxa.parcelas,
      precoNecessarioCentavos,
      liquidoNoPrecoAnuncioCentavos,
      eliminaLucro: liquidoNoPrecoAnuncioCentavos < custoTotalCentavos,
    };
  });
}
