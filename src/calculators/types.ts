import type { CommercialRoundingStep, QuantityTier } from "@/types/entities";

/**
 * Tipos usados apenas pela camada de cálculo (não persistidos).
 * Tipos de domínio persistidos ficam em `src/types/entities.ts`.
 */

export type AlertLevel = "danger" | "warning" | "success" | "info";

export interface AlertItem {
  level: AlertLevel;
  message: string;
}

export interface QuantityPricingRow {
  tierId: string;
  quantidade: number;
  descontoPercentual: number;
  precoUnitarioCentavos: number;
  totalCentavos: number;
  margemPercentual: number;
}

export interface PaymentFeeRow {
  feeId: string;
  nome: string;
  taxaPercentual: number;
  taxaFixaCentavos: number;
  parcelas?: number;
  /** Preço que deve ser cobrado para que, após a taxa, sobrem os `precoRecomendadoCentavos". */
  precoNecessarioCentavos: number;
  /** Quanto sobra líquido se o preço de anúncio for cobrado (sem ajuste). */
  liquidoNoPrecoAnuncioCentavos: number;
  /** Se o líquido no preço de anúncio fica abaixo do custo total. */
  eliminaLucro: boolean;
}

export { type CommercialRoundingStep, type QuantityTier };
