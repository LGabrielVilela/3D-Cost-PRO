import { clampNonNegative } from "@/lib/money";

export interface LaborParams {
  /** Se `true`, usa `valorFixoCentavos` diretamente, ignorando os tempos. */
  usarValorFixo: boolean;
  valorFixoCentavos?: number;
  tempoPreparacaoMinutos: number;
  tempoAcabamentoMinutos: number;
  tempoEmbalagemMinutos: number;
  valorHoraTrabalhoCentavos: number;
}

/**
 * Mão de obra — duas formas:
 *   - valor fixo informado diretamente pelo usuário;
 *   - tempo total (preparação + acabamento + embalagem) × valor da hora de trabalho.
 */
export function calculateLabor(params: LaborParams): number {
  if (params.usarValorFixo) {
    return clampNonNegative(params.valorFixoCentavos ?? 0);
  }

  const tempoTotalMinutos = sumMinutes(
    params.tempoPreparacaoMinutos,
    params.tempoAcabamentoMinutos,
    params.tempoEmbalagemMinutos,
  );
  const valorHoraCentavos = clampNonNegative(params.valorHoraTrabalhoCentavos);
  if (tempoTotalMinutos === 0 || valorHoraCentavos === 0) return 0;

  const horas = tempoTotalMinutos / 60;
  return Math.round(horas * valorHoraCentavos);
}

function sumMinutes(...valores: number[]): number {
  return valores.reduce((acc, v) => acc + clampNonNegative(v), 0);
}
