import { describe, expect, it } from "vitest";

import { calculateDepreciation } from "../depreciation";

describe("calculateDepreciation", () => {
  it("calcula a depreciação proporcional ao tempo de impressão", () => {
    // R$2.199,00 / 8000h = R$0,274875/h × 5h = R$1,374375 -> 137 centavos
    const custo = calculateDepreciation({
      ativa: true,
      precoImpressoraCentavos: 219900,
      vidaUtilHoras: 8000,
      tempoImpressaoMinutos: 300,
    });
    expect(custo).toBe(137);
  });

  it("retorna 0 quando a depreciação está desativada", () => {
    const custo = calculateDepreciation({
      ativa: false,
      precoImpressoraCentavos: 219900,
      vidaUtilHoras: 8000,
      tempoImpressaoMinutos: 300,
    });
    expect(custo).toBe(0);
  });

  it("retorna 0 quando a vida útil é zero (evita divisão por zero)", () => {
    const custo = calculateDepreciation({
      ativa: true,
      precoImpressoraCentavos: 219900,
      vidaUtilHoras: 0,
      tempoImpressaoMinutos: 300,
    });
    expect(custo).toBe(0);
  });
});
