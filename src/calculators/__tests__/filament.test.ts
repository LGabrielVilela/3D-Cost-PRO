import { describe, expect, it } from "vitest";

import { calculateFilamentCost } from "../filament";

describe("calculateFilamentCost", () => {
  it("calcula o custo do filamento pelo exemplo da especificação", () => {
    // R$ 99,00 / 1000g = R$ 0,099/g · 100g usados = R$ 9,90
    const result = calculateFilamentCost({
      precoRoloCentavos: 9900,
      pesoRoloGramas: 1000,
      gramasUtilizadas: 100,
    });

    expect(result.custoTotalCentavos).toBe(990);
    expect(result.custoPorGramaReais).toBeCloseTo(0.099, 5);
  });

  it("retorna 0 quando o peso do rolo é zero (evita divisão por zero)", () => {
    const result = calculateFilamentCost({
      precoRoloCentavos: 9900,
      pesoRoloGramas: 0,
      gramasUtilizadas: 100,
    });
    expect(result.custoTotalCentavos).toBe(0);
  });

  it("retorna 0 quando o preço do rolo é zero", () => {
    const result = calculateFilamentCost({
      precoRoloCentavos: 0,
      pesoRoloGramas: 1000,
      gramasUtilizadas: 100,
    });
    expect(result.custoTotalCentavos).toBe(0);
  });

  it("ignora gramas utilizadas negativas (trata como 0)", () => {
    const result = calculateFilamentCost({
      precoRoloCentavos: 9900,
      pesoRoloGramas: 1000,
      gramasUtilizadas: -50,
    });
    expect(result.custoTotalCentavos).toBe(0);
  });

  it("não perde precisão por arredondamento intermediário em lotes grandes", () => {
    // 33g a R$0,033/g exatos seria fracionário; a multiplicação cruzada evita erro acumulado
    const result = calculateFilamentCost({
      precoRoloCentavos: 3300, // R$33,00
      pesoRoloGramas: 1000,
      gramasUtilizadas: 333,
    });
    // 3300 * 333 / 1000 = 1098.9 -> arredonda para 1099
    expect(result.custoTotalCentavos).toBe(1099);
  });
});
