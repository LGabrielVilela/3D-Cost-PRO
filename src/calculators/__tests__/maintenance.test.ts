import { describe, expect, it } from "vitest";

import { calculateMaintenance } from "../maintenance";

describe("calculateMaintenance", () => {
  it("método 'porHora': custo por hora × horas de impressão", () => {
    const custo = calculateMaintenance({
      metodo: "porHora",
      manutencaoPorHoraCentavos: 20,
      manutencaoPercentual: 0,
      tempoImpressaoMinutos: 300,
      custoBaseCentavos: 0,
    });
    expect(custo).toBe(100); // R$0,20/h × 5h
  });

  it("método 'percentual': percentual aplicado sobre o custo de produção base", () => {
    const custo = calculateMaintenance({
      metodo: "percentual",
      manutencaoPorHoraCentavos: 0,
      manutencaoPercentual: 10,
      tempoImpressaoMinutos: 300,
      custoBaseCentavos: 1320, // filamento+energia+depreciação
    });
    expect(custo).toBe(132);
  });

  it("método 'porHora' retorna 0 quando o tempo é zero", () => {
    const custo = calculateMaintenance({
      metodo: "porHora",
      manutencaoPorHoraCentavos: 20,
      manutencaoPercentual: 0,
      tempoImpressaoMinutos: 0,
      custoBaseCentavos: 0,
    });
    expect(custo).toBe(0);
  });
});
