import { applyPercentual, clampNonNegative, sumCentavos } from "@/lib/money";

export interface LossesParams {
  /** Custo de produção antes de aplicar a taxa de falhas (filamento + energia + depreciação + manutenção), em centavos. */
  custoAntesPerdasCentavos: number;
  /** Percentual estimado de peças perdidas/falhas (0-100). */
  taxaFalhasPercentual: number;
}

export interface LossesResult {
  custoAntesPerdasCentavos: number;
  perdasCentavos: number;
  custoAposPerdasCentavos: number;
}

/**
 * Perdas/falhas: encarece o custo de produção para absorver o percentual de
 * peças que falham ou são descartadas durante a impressão.
 */
export function calculateLosses(params: LossesParams): LossesResult {
  const custoAntesPerdasCentavos = clampNonNegative(params.custoAntesPerdasCentavos);
  const perdasCentavos = applyPercentual(
    custoAntesPerdasCentavos,
    clampNonNegative(params.taxaFalhasPercentual),
  );

  return {
    custoAntesPerdasCentavos,
    perdasCentavos,
    custoAposPerdasCentavos: sumCentavos(custoAntesPerdasCentavos, perdasCentavos),
  };
}
