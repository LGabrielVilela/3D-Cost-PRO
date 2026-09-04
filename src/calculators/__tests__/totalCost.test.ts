import { describe, expect, it } from "vitest";

import { calculateTotalCost } from "../totalCost";
import { buildExampleInput } from "./fixtures";

describe("calculateTotalCost", () => {
  it("reproduz o breakdown de custo do exemplo da especificação (total R$32,62)", () => {
    const custos = calculateTotalCost(buildExampleInput());

    expect(custos.filamentoCentavos).toBe(990); // R$9,90
    expect(custos.energiaCentavos).toBe(80); // R$0,80
    expect(custos.depreciacaoCentavos).toBe(250); // R$2,50
    expect(custos.manutencaoCentavos).toBe(100); // R$1,00
    expect(custos.custoAntesPerdasCentavos).toBe(1420); // R$14,20
    expect(custos.perdasCentavos).toBe(142); // 10% de R$14,20
    expect(custos.custoAposPerdasCentavos).toBe(1562); // R$15,62
    expect(custos.maoDeObraCentavos).toBe(1500); // valor fixo R$15,00
    expect(custos.embalagemCentavos).toBe(200); // R$2,00
    expect(custos.outrosCentavos).toBe(0);
    expect(custos.custoTotalCentavos).toBe(3262); // R$32,62
    expect(custos.custoPorUnidadeCentavos).toBe(3262);
  });

  it("custo por unidade divide o custo total pela quantidade de peças", () => {
    const input = buildExampleInput({ quantidadePecas: 4 });
    const custos = calculateTotalCost(input);
    expect(custos.custoPorUnidadeCentavos).toBe(Math.round(custos.custoTotalCentavos / 4));
  });

  it("quantidade de peças zero ou inválida é tratada como 1 (evita divisão por zero)", () => {
    const input = buildExampleInput({ quantidadePecas: 0 });
    const custos = calculateTotalCost(input);
    expect(custos.custoPorUnidadeCentavos).toBe(custos.custoTotalCentavos);
  });

  it("soma outros custos ao total (ex: imã + argola + pintura)", () => {
    const input = buildExampleInput({
      outrosCustos: [
        { id: "1", descricao: "Imã", valorCentavos: 200 },
        { id: "2", descricao: "Argola", valorCentavos: 50 },
        { id: "3", descricao: "Pintura", valorCentavos: 300 },
      ],
    });
    const custos = calculateTotalCost(input);
    expect(custos.outrosCentavos).toBe(550);
  });

  it("desativar a depreciação remove esse custo do total", () => {
    const input = buildExampleInput({ depreciacaoAtiva: false });
    const custos = calculateTotalCost(input);
    expect(custos.depreciacaoCentavos).toBe(0);
  });
});
