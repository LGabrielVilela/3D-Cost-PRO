import { describe, expect, it } from "vitest";

import { calculateLabor } from "../labor";

describe("calculateLabor", () => {
  it("usa o valor fixo quando 'usarValorFixo' é true", () => {
    const custo = calculateLabor({
      usarValorFixo: true,
      valorFixoCentavos: 1500,
      tempoPreparacaoMinutos: 999,
      tempoAcabamentoMinutos: 999,
      tempoEmbalagemMinutos: 999,
      valorHoraTrabalhoCentavos: 5000,
    });
    expect(custo).toBe(1500);
  });

  it("calcula por tempo total × valor da hora quando não usa valor fixo", () => {
    const custo = calculateLabor({
      usarValorFixo: false,
      tempoPreparacaoMinutos: 10,
      tempoAcabamentoMinutos: 15,
      tempoEmbalagemMinutos: 5,
      valorHoraTrabalhoCentavos: 2000, // R$20,00/h
    });
    // 30 minutos = 0,5h × R$20,00 = R$10,00
    expect(custo).toBe(1000);
  });

  it("valor fixo ausente é tratado como 0", () => {
    const custo = calculateLabor({
      usarValorFixo: true,
      tempoPreparacaoMinutos: 0,
      tempoAcabamentoMinutos: 0,
      tempoEmbalagemMinutos: 0,
      valorHoraTrabalhoCentavos: 0,
    });
    expect(custo).toBe(0);
  });
});
