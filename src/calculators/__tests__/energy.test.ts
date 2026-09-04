import { describe, expect, it } from "vitest";

import { calculateEnergyCost } from "../energy";

describe("calculateEnergyCost", () => {
  it("calcula o custo de energia pelo exemplo da especificação", () => {
    // 200W, 5h, R$0,80/kWh => 0,2kW × 5h = 1kWh × R$0,80 = R$0,80
    const custo = calculateEnergyCost({
      consumoWatts: 200,
      tempoImpressaoMinutos: 300,
      valorKwhCentavos: 80,
    });
    expect(custo).toBe(80);
  });

  it("retorna 0 quando o tempo de impressão é zero", () => {
    const custo = calculateEnergyCost({
      consumoWatts: 200,
      tempoImpressaoMinutos: 0,
      valorKwhCentavos: 80,
    });
    expect(custo).toBe(0);
  });

  it("retorna 0 quando o consumo em watts é zero", () => {
    const custo = calculateEnergyCost({
      consumoWatts: 0,
      tempoImpressaoMinutos: 300,
      valorKwhCentavos: 80,
    });
    expect(custo).toBe(0);
  });

  it("ignora valores negativos de watts", () => {
    const custo = calculateEnergyCost({
      consumoWatts: -200,
      tempoImpressaoMinutos: 300,
      valorKwhCentavos: 80,
    });
    expect(custo).toBe(0);
  });
});
