import { describe, expect, it } from "vitest";

import { calculateFilamentCost, calculateMateriaisCost, getMateriaisUsados } from "../filament";
import { buildExampleInput } from "./fixtures";

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

describe("calculateMateriaisCost", () => {
  it("soma o custo de mais de um material (ex: peça com duas cores)", () => {
    const result = calculateMateriaisCost([
      { id: "1", materialNome: "PLA Branco", filamentoPrecoCentavos: 9900, filamentoPesoRoloGramas: 1000, gramasUtilizadas: 100 },
      { id: "2", materialNome: "PLA Vermelho", filamentoPrecoCentavos: 12000, filamentoPesoRoloGramas: 1000, gramasUtilizadas: 50 },
    ]);

    expect(result.itens).toHaveLength(2);
    expect(result.itens[0].custoTotalCentavos).toBe(990); // R$9,90
    expect(result.itens[1].custoTotalCentavos).toBe(600); // R$6,00
    expect(result.custoTotalCentavos).toBe(1590); // R$15,90
  });

  it("lista vazia resulta em custo zero", () => {
    const result = calculateMateriaisCost([]);
    expect(result.itens).toHaveLength(0);
    expect(result.custoTotalCentavos).toBe(0);
  });
});

describe("getMateriaisUsados", () => {
  it("retorna o array `materiais` quando o cálculo já está no formato atual", () => {
    const input = buildExampleInput();
    const materiais = getMateriaisUsados(input);
    expect(materiais).toBe(input.materiais);
  });

  it("converte um `CalculationInput` no formato antigo (campos soltos) em um array de 1 material", () => {
    const inputAntigo = {
      ...buildExampleInput(),
      materiais: undefined,
      materialId: "mat-antigo",
      materialNome: "PLA Legado",
      filamentoPrecoCentavos: 5000,
      filamentoPesoRoloGramas: 1000,
      gramasUtilizadas: 80,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const materiais = getMateriaisUsados(inputAntigo);
    expect(materiais).toHaveLength(1);
    expect(materiais[0]).toMatchObject({
      materialId: "mat-antigo",
      materialNome: "PLA Legado",
      filamentoPrecoCentavos: 5000,
      filamentoPesoRoloGramas: 1000,
      gramasUtilizadas: 80,
    });
  });
});
