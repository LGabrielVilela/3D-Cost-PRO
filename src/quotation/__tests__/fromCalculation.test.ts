import { describe, expect, it } from "vitest";

import type { Calculation } from "@/types/entities";

import { buildQuoteDraftFromCalculation, buildQuoteItemFromCalculation } from "../fromCalculation";

function buildCalculation(overrides: Partial<Calculation> = {}): Calculation {
  return {
    id: "calc-1",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    nome: "Chaveiro personalizado",
    input: {
      materialNome: "PLA",
      filamentoPrecoCentavos: 9900,
      filamentoPesoRoloGramas: 1000,
      gramasUtilizadas: 100,
      tempoImpressaoMinutos: 300,
      quantidadePecas: 20,
      printerNome: "Bambu A1",
      consumoWatts: 200,
      valorKwhCentavos: 80,
      depreciacaoAtiva: true,
      precoImpressoraCentavos: 219900,
      vidaUtilHoras: 8000,
      manutencaoMetodo: "percentual",
      manutencaoPorHoraCentavos: 0,
      manutencaoPercentual: 5,
      taxaFalhasPercentual: 10,
      tempoPreparacaoMinutos: 10,
      tempoAcabamentoMinutos: 10,
      tempoEmbalagemMinutos: 5,
      valorHoraTrabalhoCentavos: 2000,
      maoDeObraUsarValorFixo: true,
      maoDeObraValorFixoCentavos: 1500,
      embalagemCentavos: 200,
      etiquetaCentavos: 0,
      adesivoCentavos: 0,
      protecaoCentavos: 0,
      embalagemOutrosCentavos: 0,
      outrosCustos: [],
      metodoPrecificacao: "margem",
      margemPercentual: 30,
      markupPercentual: 100,
      taxasPagamento: [],
      descontoPercentual: 0,
      faixasQuantidade: [],
    },
    custos: {
      filamentoCentavos: 990,
      energiaCentavos: 80,
      depreciacaoCentavos: 137,
      manutencaoCentavos: 60,
      custoAntesPerdasCentavos: 1267,
      perdasCentavos: 127,
      custoAposPerdasCentavos: 1394,
      maoDeObraCentavos: 1500,
      embalagemCentavos: 200,
      outrosCentavos: 0,
      custoTotalCentavos: 3262,
      custoPorUnidadeCentavos: 3262,
    },
    precos: {
      precoMinimoCentavos: 3990,
      precoRecomendadoCentavos: 4660,
      precoAnuncioCentavos: 4990,
    },
    ...overrides,
  };
}

describe("buildQuoteItemFromCalculation", () => {
  it("reproduz o exemplo da especificação: 20 unidades a R$49,90 = R$998,00", () => {
    const calculation = buildCalculation();
    const item = buildQuoteItemFromCalculation(calculation);

    expect(item.quantidade).toBe(20);
    expect(item.precoUnitarioCentavos).toBe(4990);
    expect(item.totalCentavos).toBe(99800);
    expect(item.material).toBe("PLA");
  });

  it("usa o preço de ANÚNCIO, nunca o preço mínimo ou recomendado", () => {
    const calculation = buildCalculation();
    const item = buildQuoteItemFromCalculation(calculation);
    expect(item.precoUnitarioCentavos).toBe(calculation.precos.precoAnuncioCentavos);
    expect(item.precoUnitarioCentavos).not.toBe(calculation.precos.precoRecomendadoCentavos);
    expect(item.precoUnitarioCentavos).not.toBe(calculation.precos.precoMinimoCentavos);
  });

  it("permite sobrescrever a quantidade sem alterar o preço unitário", () => {
    const calculation = buildCalculation();
    const item = buildQuoteItemFromCalculation(calculation, 5);
    expect(item.quantidade).toBe(5);
    expect(item.precoUnitarioCentavos).toBe(4990);
    expect(item.totalCentavos).toBe(24950);
  });

  it("nunca expõe o custo interno do cálculo no item gerado", () => {
    const calculation = buildCalculation();
    const item = buildQuoteItemFromCalculation(calculation);
    const serializado = JSON.stringify(item).toLowerCase();
    expect(serializado).not.toContain("3262"); // custoTotalCentavos
    expect(serializado).not.toContain("custo");
  });
});

describe("buildQuoteDraftFromCalculation", () => {
  it("monta um rascunho de orçamento com um único item e referência ao cálculo", () => {
    const calculation = buildCalculation();
    const draft = buildQuoteDraftFromCalculation(calculation);

    expect(draft.calculationId).toBe("calc-1");
    expect(draft.itens).toHaveLength(1);
    expect(draft.descricaoServico).toBe("Chaveiro personalizado");
  });
});
