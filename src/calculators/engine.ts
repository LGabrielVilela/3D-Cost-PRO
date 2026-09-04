import type { CalculationCostBreakdown, CalculationInput, CalculationPricingResult } from "@/types/entities";

import { generateAlerts } from "./alerts";
import { calculateDiscount, type DiscountResult } from "./discount";
import { calculatePaymentFeeRows } from "./platformFees";
import {
  calculateMarkupPrice,
  calculateRealMargin,
  calculateRealMarkup,
  calculateSuggestedPrices,
} from "./pricing";
import { calculateQuantityPricing } from "./quantityPricing";
import { calculateTotalCost } from "./totalCost";
import type { AlertItem, PaymentFeeRow, QuantityPricingRow } from "./types";

export interface CalculationEngineResult {
  custos: CalculationCostBreakdown;
  precos: CalculationPricingResult;
  /** Margem/markup reais obtidos no preço RECOMENDADO (antes de desconto ou taxas). */
  margemRealRecomendadoPercentual: number;
  markupRealRecomendadoPercentual: number;
  discount: DiscountResult;
  paymentFeeRows: PaymentFeeRow[];
  quantityPricing: QuantityPricingRow[];
  alerts: AlertItem[];
}

/**
 * Ponto único de entrada da calculadora: recebe o `CalculationInput` completo
 * (as 8 etapas + precificação + taxas + desconto + faixas de quantidade) e
 * devolve todo o resultado consolidado, pronto para a UI exibir.
 *
 * Internamente apenas orquestra as funções puras dos demais módulos —
 * nenhuma regra de negócio nova é criada aqui.
 */
export function runCalculationEngine(input: CalculationInput): CalculationEngineResult {
  const custos = calculateTotalCost(input);

  const percentualEscolhido =
    input.metodoPrecificacao === "margem" ? input.margemPercentual : input.markupPercentual;

  const precos = calculateSuggestedPrices({
    custoTotalCentavos: custos.custoTotalCentavos,
    metodoPrecificacao: input.metodoPrecificacao,
    percentual: percentualEscolhido,
    arredondamentoStep: input.precoAnuncioArredondamentoStep,
  });

  const margemRealRecomendadoPercentual = calculateRealMargin(
    custos.custoTotalCentavos,
    precos.precoRecomendadoCentavos,
  );
  const markupRealRecomendadoPercentual = calculateRealMarkup(
    custos.custoTotalCentavos,
    precos.precoRecomendadoCentavos,
  );

  // Margem-alvo usada nos alertas: se o método escolhido foi markup, converte
  // o markup configurado para a margem equivalente, para comparar "maçãs com maçãs".
  const margemConfiguradaPercentual =
    input.metodoPrecificacao === "margem"
      ? input.margemPercentual
      : calculateRealMargin(
          custos.custoTotalCentavos,
          calculateMarkupPrice(custos.custoTotalCentavos, input.markupPercentual),
        );

  const discount = calculateDiscount(
    precos.precoAnuncioCentavos,
    input.descontoPercentual,
    custos.custoTotalCentavos,
    precos.precoMinimoCentavos,
  );

  const paymentFeeRows = calculatePaymentFeeRows(
    input.taxasPagamento,
    precos.precoRecomendadoCentavos,
    precos.precoAnuncioCentavos,
    custos.custoTotalCentavos,
  );

  const quantityPricing = calculateQuantityPricing(
    precos.precoAnuncioCentavos,
    custos.custoPorUnidadeCentavos,
    input.faixasQuantidade,
  );

  const alerts = generateAlerts({
    custoTotalCentavos: custos.custoTotalCentavos,
    precoMinimoCentavos: precos.precoMinimoCentavos,
    precoRecomendadoCentavos: precos.precoRecomendadoCentavos,
    precoAnuncioCentavos: precos.precoAnuncioCentavos,
    margemConfiguradaPercentual,
    margemRealRecomendadoPercentual,
    maoDeObraCentavos: custos.maoDeObraCentavos,
    discount,
    paymentFeeRows,
  });

  return {
    custos,
    precos,
    margemRealRecomendadoPercentual,
    markupRealRecomendadoPercentual,
    discount,
    paymentFeeRows,
    quantityPricing,
    alerts,
  };
}
