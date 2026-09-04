import { applyPercentual, clampNonNegative } from "@/lib/money";
import type { MetodoManutencao } from "@/types/entities";

export interface MaintenanceParams {
  metodo: MetodoManutencao;
  /** Usado quando `metodo === "porHora"`, em centavos. */
  manutencaoPorHoraCentavos: number;
  /** Usado quando `metodo === "percentual"` (0-100). */
  manutencaoPercentual: number;
  /** Tempo de impressão desta peça, em minutos (método "porHora"). */
  tempoImpressaoMinutos: number;
  /** Custo de produção acumulado até aqui (filamento + energia + depreciação), em centavos — base do método "percentual". */
  custoBaseCentavos: number;
}

/**
 * Manutenção — dois métodos possíveis:
 *   - "porHora": custo por hora × horas de impressão
 *   - "percentual": percentual aplicado sobre o custo de produção (filamento + energia + depreciação)
 */
export function calculateMaintenance(params: MaintenanceParams): number {
  if (params.metodo === "percentual") {
    const custoBaseCentavos = clampNonNegative(params.custoBaseCentavos);
    return applyPercentual(custoBaseCentavos, clampNonNegative(params.manutencaoPercentual));
  }

  const custoPorHoraCentavos = clampNonNegative(params.manutencaoPorHoraCentavos);
  const tempoMinutos = clampNonNegative(params.tempoImpressaoMinutos);
  if (custoPorHoraCentavos === 0 || tempoMinutos === 0) return 0;

  const horas = tempoMinutos / 60;
  return Math.round(custoPorHoraCentavos * horas);
}
