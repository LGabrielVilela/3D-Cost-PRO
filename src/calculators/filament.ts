import { centavosToReais, clampNonNegative } from "@/lib/money";

export interface FilamentCostParams {
  /** Preço pago pelo rolo/kg do material, em centavos. */
  precoRoloCentavos: number;
  /** Peso total do rolo, em gramas. */
  pesoRoloGramas: number;
  /** Quantidade de material efetivamente usada na peça, em gramas. */
  gramasUtilizadas: number;
}

export interface FilamentCostResult {
  /** Preço por grama em reais, com alta precisão — apenas para exibição (ex: "R$ 0,099/g"). */
  custoPorGramaReais: number;
  /** Custo do filamento usado nesta impressão, em centavos. */
  custoTotalCentavos: number;
}

/**
 * Custo do filamento:
 *   custo por grama = preço do rolo / peso do rolo
 *   custo do filamento = custo por grama × gramas utilizadas
 *
 * O total é calculado por multiplicação cruzada (preço × gramas ÷ peso) em vez de
 * arredondar o custo por grama antes — isso evita perda de precisão em centavos.
 */
export function calculateFilamentCost(params: FilamentCostParams): FilamentCostResult {
  const pesoRoloGramas = clampNonNegative(params.pesoRoloGramas);
  const gramasUtilizadas = clampNonNegative(params.gramasUtilizadas);
  const precoRoloCentavos = clampNonNegative(params.precoRoloCentavos);

  if (pesoRoloGramas === 0 || gramasUtilizadas === 0 || precoRoloCentavos === 0) {
    return { custoPorGramaReais: 0, custoTotalCentavos: 0 };
  }

  const custoTotalCentavos = Math.round((precoRoloCentavos * gramasUtilizadas) / pesoRoloGramas);
  const custoPorGramaReais = centavosToReais(precoRoloCentavos) / pesoRoloGramas;

  return { custoPorGramaReais, custoTotalCentavos };
}
