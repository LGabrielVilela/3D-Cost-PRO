import { clampNonNegative, sumCentavos } from "@/lib/money";
import type { CalculationCostBreakdown, CalculationInput } from "@/types/entities";

import { calculateDepreciation } from "./depreciation";
import { calculateEnergyCost } from "./energy";
import { calculateFilamentCost } from "./filament";
import { calculateLabor } from "./labor";
import { calculateLosses } from "./losses";
import { calculateMaintenance } from "./maintenance";
import { calculateOtherCosts } from "./otherCosts";
import { calculatePackagingCost } from "./packaging";

/**
 * Calcula o breakdown completo de custos de uma impressão a partir do
 * `CalculationInput`. Ordem segue o "Resumo do custo" da especificação:
 * filamento → energia → depreciação → manutenção → perdas → mão de obra →
 * embalagem → outros → custo total → custo por unidade.
 */
export function calculateTotalCost(input: CalculationInput): CalculationCostBreakdown {
  const filamento = calculateFilamentCost({
    precoRoloCentavos: input.filamentoPrecoCentavos,
    pesoRoloGramas: input.filamentoPesoRoloGramas,
    gramasUtilizadas: input.gramasUtilizadas,
  });

  const energiaCentavos = calculateEnergyCost({
    consumoWatts: input.consumoWatts,
    tempoImpressaoMinutos: input.tempoImpressaoMinutos,
    valorKwhCentavos: input.valorKwhCentavos,
  });

  const depreciacaoCentavos = calculateDepreciation({
    ativa: input.depreciacaoAtiva,
    precoImpressoraCentavos: input.precoImpressoraCentavos,
    vidaUtilHoras: input.vidaUtilHoras,
    tempoImpressaoMinutos: input.tempoImpressaoMinutos,
  });

  const custoBaseParaManutencao = sumCentavos(
    filamento.custoTotalCentavos,
    energiaCentavos,
    depreciacaoCentavos,
  );

  const manutencaoCentavos = calculateMaintenance({
    metodo: input.manutencaoMetodo,
    manutencaoPorHoraCentavos: input.manutencaoPorHoraCentavos,
    manutencaoPercentual: input.manutencaoPercentual,
    tempoImpressaoMinutos: input.tempoImpressaoMinutos,
    custoBaseCentavos: custoBaseParaManutencao,
  });

  const custoAntesPerdasCentavos = sumCentavos(custoBaseParaManutencao, manutencaoCentavos);

  const { perdasCentavos, custoAposPerdasCentavos } = calculateLosses({
    custoAntesPerdasCentavos,
    taxaFalhasPercentual: input.taxaFalhasPercentual,
  });

  const maoDeObraCentavos = calculateLabor({
    usarValorFixo: input.maoDeObraUsarValorFixo,
    valorFixoCentavos: input.maoDeObraValorFixoCentavos,
    tempoPreparacaoMinutos: input.tempoPreparacaoMinutos,
    tempoAcabamentoMinutos: input.tempoAcabamentoMinutos,
    tempoEmbalagemMinutos: input.tempoEmbalagemMinutos,
    valorHoraTrabalhoCentavos: input.valorHoraTrabalhoCentavos,
  });

  const embalagemCentavos = calculatePackagingCost({
    embalagemCentavos: input.embalagemCentavos,
    etiquetaCentavos: input.etiquetaCentavos,
    adesivoCentavos: input.adesivoCentavos,
    protecaoCentavos: input.protecaoCentavos,
    outrosCentavos: input.embalagemOutrosCentavos,
  });

  const outrosCentavos = calculateOtherCosts(input.outrosCustos);

  const custoTotalCentavos = sumCentavos(
    custoAposPerdasCentavos,
    maoDeObraCentavos,
    embalagemCentavos,
    outrosCentavos,
  );

  const quantidadePecas = Math.max(1, Math.round(clampNonNegative(input.quantidadePecas)) || 1);
  const custoPorUnidadeCentavos = Math.round(custoTotalCentavos / quantidadePecas);

  return {
    filamentoCentavos: filamento.custoTotalCentavos,
    energiaCentavos,
    depreciacaoCentavos,
    manutencaoCentavos,
    custoAntesPerdasCentavos,
    perdasCentavos,
    custoAposPerdasCentavos,
    maoDeObraCentavos,
    embalagemCentavos,
    outrosCentavos,
    custoTotalCentavos,
    custoPorUnidadeCentavos,
  };
}
