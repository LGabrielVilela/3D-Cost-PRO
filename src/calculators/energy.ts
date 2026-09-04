import { clampNonNegative } from "@/lib/money";

export interface EnergyCostParams {
  /** Potência média da impressora, em Watts. */
  consumoWatts: number;
  /** Tempo total de impressão, em minutos. */
  tempoImpressaoMinutos: number;
  /** Valor do kWh da concessionária, em centavos. */
  valorKwhCentavos: number;
}

/**
 * Custo de energia:
 *   consumo em kWh = (Watts / 1000) × horas
 *   custo energia  = consumo kWh × valor do kWh
 */
export function calculateEnergyCost(params: EnergyCostParams): number {
  const consumoWatts = clampNonNegative(params.consumoWatts);
  const tempoMinutos = clampNonNegative(params.tempoImpressaoMinutos);
  const valorKwhCentavos = clampNonNegative(params.valorKwhCentavos);

  if (consumoWatts === 0 || tempoMinutos === 0 || valorKwhCentavos === 0) return 0;

  const horas = tempoMinutos / 60;
  const consumoKwh = (consumoWatts / 1000) * horas;
  return Math.round(consumoKwh * valorKwhCentavos);
}
