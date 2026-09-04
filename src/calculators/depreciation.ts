import { clampNonNegative } from "@/lib/money";

export interface DepreciationParams {
  /** Depreciação está habilitada para este cálculo. */
  ativa: boolean;
  /** Preço de aquisição da impressora, em centavos. */
  precoImpressoraCentavos: number;
  /** Vida útil estimada da impressora, em horas. */
  vidaUtilHoras: number;
  /** Tempo de impressão desta peça, em minutos. */
  tempoImpressaoMinutos: number;
}

/**
 * Depreciação da impressora:
 *   depreciação por hora = preço da impressora / vida útil (horas)
 *   depreciação da peça  = depreciação por hora × horas de impressão
 */
export function calculateDepreciation(params: DepreciationParams): number {
  if (!params.ativa) return 0;

  const precoImpressoraCentavos = clampNonNegative(params.precoImpressoraCentavos);
  const vidaUtilHoras = clampNonNegative(params.vidaUtilHoras);
  const tempoMinutos = clampNonNegative(params.tempoImpressaoMinutos);

  if (precoImpressoraCentavos === 0 || vidaUtilHoras === 0 || tempoMinutos === 0) return 0;

  const depreciacaoPorHoraCentavos = precoImpressoraCentavos / vidaUtilHoras;
  const horas = tempoMinutos / 60;
  return Math.round(depreciacaoPorHoraCentavos * horas);
}
