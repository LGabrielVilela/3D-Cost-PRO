import type { AlertItem, PaymentFeeRow } from "./types";
import type { DiscountResult } from "./discount";

export interface AlertsContext {
  custoTotalCentavos: number;
  precoMinimoCentavos: number;
  precoRecomendadoCentavos: number;
  precoAnuncioCentavos: number;
  margemConfiguradaPercentual: number;
  margemRealRecomendadoPercentual: number;
  maoDeObraCentavos: number;
  discount: DiscountResult;
  paymentFeeRows: PaymentFeeRow[];
}

/** Margem real abaixo da configurada por mais que esta tolerância já dispara alerta. */
const TOLERANCIA_MARGEM_PERCENTUAL = 1;
/** Mão de obra acima deste percentual do custo total é considerada alta. */
const LIMITE_MAO_DE_OBRA_PERCENTUAL = 50;

/**
 * Gera os alertas inteligentes descritos na especificação a partir do
 * resultado consolidado do cálculo. Retorna do mais crítico ao menos
 * crítico; quando nada de errado é detectado, retorna uma mensagem de
 * sucesso ("Preço saudável para venda").
 */
export function generateAlerts(ctx: AlertsContext): AlertItem[] {
  const alerts: AlertItem[] = [];

  if (ctx.precoAnuncioCentavos < ctx.custoTotalCentavos) {
    alerts.push({
      level: "danger",
      message: "Este valor está abaixo do seu custo total. Você venderia no prejuízo.",
    });
  }

  if (ctx.discount.descontoPercentual > 0 && ctx.discount.abaixoDoPrecoMinimo) {
    alerts.push({
      level: "danger",
      message: `O desconto de ${formatPercentualInline(ctx.discount.descontoPercentual)} leva o preço abaixo do mínimo recomendado.`,
    });
  }

  if (
    ctx.margemRealRecomendadoPercentual <
    ctx.margemConfiguradaPercentual - TOLERANCIA_MARGEM_PERCENTUAL
  ) {
    alerts.push({
      level: "warning",
      message: "Este preço gera margem inferior à configurada.",
    });
  }

  for (const fee of ctx.paymentFeeRows) {
    if (fee.eliminaLucro) {
      alerts.push({
        level: "warning",
        message: `A taxa de "${fee.nome}" elimina o lucro se você cobrar o preço de anúncio sem ajuste — use o preço necessário sugerido para essa forma de pagamento.`,
      });
    }
  }

  if (
    ctx.custoTotalCentavos > 0 &&
    (ctx.maoDeObraCentavos / ctx.custoTotalCentavos) * 100 > LIMITE_MAO_DE_OBRA_PERCENTUAL
  ) {
    alerts.push({
      level: "warning",
      message: "O custo de mão de obra está muito alto em relação ao custo total.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({ level: "success", message: "Preço saudável para venda." });
  }

  return alerts;
}

function formatPercentualInline(percentual: number): string {
  return `${percentual.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
