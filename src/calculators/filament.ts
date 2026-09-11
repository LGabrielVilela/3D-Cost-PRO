import { centavosToReais, clampNonNegative, sumCentavos } from "@/lib/money";
import type {
  CalculationInput,
  CalculationMaterialUsage,
  CalculationMaterialUsageCost,
} from "@/types/entities";

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

export interface MateriaisCostResult {
  /** Custo detalhado de cada material usado (soma para `custoTotalCentavos`). */
  itens: CalculationMaterialUsageCost[];
  custoTotalCentavos: number;
}

/**
 * Custo do filamento somando TODOS os materiais usados na peça (ex: corpo em
 * PLA branco + detalhe em PLA vermelho) — aplica `calculateFilamentCost` a
 * cada material e soma os totais.
 */
export function calculateMateriaisCost(materiais: CalculationMaterialUsage[]): MateriaisCostResult {
  const itens: CalculationMaterialUsageCost[] = materiais.map((material) => {
    const custo = calculateFilamentCost({
      precoRoloCentavos: material.filamentoPrecoCentavos,
      pesoRoloGramas: material.filamentoPesoRoloGramas,
      gramasUtilizadas: material.gramasUtilizadas,
    });
    return { ...material, ...custo };
  });

  const custoTotalCentavos = sumCentavos(...itens.map((item) => item.custoTotalCentavos));

  return { itens, custoTotalCentavos };
}

/**
 * Formato antigo de `CalculationInput` (antes de suportar múltiplos
 * materiais): os campos do material viviam soltos na raiz, em vez do array
 * `materiais`. Cálculos salvos nesse formato ainda existem no banco.
 */
interface LegacyCalculationInputMaterial {
  materialId?: string;
  materialNome?: string;
  filamentoPrecoCentavos?: number;
  filamentoPesoRoloGramas?: number;
  gramasUtilizadas?: number;
}

/**
 * Extrai a lista de materiais usados de um `CalculationInput`, aceitando
 * tanto o formato atual (`materiais: [...]`) quanto o formato antigo (campos
 * soltos na raiz). NUNCA remova o fallback abaixo sem migrar os cálculos já
 * salvos no banco — ver `src/db/schema.ts` (`calculations.input` é jsonb).
 */
export function getMateriaisUsados(
  input: CalculationInput & LegacyCalculationInputMaterial,
): CalculationMaterialUsage[] {
  if (Array.isArray(input.materiais) && input.materiais.length > 0) {
    return input.materiais;
  }

  if (input.materialNome !== undefined) {
    return [
      {
        id: "legacy",
        materialId: input.materialId,
        materialNome: input.materialNome ?? "",
        filamentoPrecoCentavos: input.filamentoPrecoCentavos ?? 0,
        filamentoPesoRoloGramas: input.filamentoPesoRoloGramas ?? 0,
        gramasUtilizadas: input.gramasUtilizadas ?? 0,
      },
    ];
  }

  return [];
}
