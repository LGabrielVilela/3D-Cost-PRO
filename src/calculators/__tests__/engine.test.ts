import { describe, expect, it } from "vitest";

import { runCalculationEngine } from "../engine";
import { buildExampleInput } from "./fixtures";

describe("runCalculationEngine", () => {
  it("reproduz de ponta a ponta os três preços do exemplo da especificação", () => {
    const result = runCalculationEngine(buildExampleInput());

    expect(result.custos.custoTotalCentavos).toBe(3262);
    expect(result.precos.precoMinimoCentavos).toBe(3990);
    expect(result.precos.precoRecomendadoCentavos).toBe(4660);
    expect(result.precos.precoAnuncioCentavos).toBe(4990);
    expect(result.margemRealRecomendadoPercentual).toBeCloseTo(30, 1);
  });

  it("sem nenhum problema, o alerta principal é de sucesso", () => {
    const result = runCalculationEngine(buildExampleInput());
    expect(result.alerts.some((a) => a.level === "success")).toBe(true);
    expect(result.alerts.some((a) => a.level === "danger")).toBe(false);
  });

  it("alerta de perigo quando o desconto joga o preço abaixo do mínimo (e do custo)", () => {
    const result = runCalculationEngine(buildExampleInput({ descontoPercentual: 40 }));
    expect(result.discount.abaixoDoPrecoMinimo).toBe(true);
    expect(result.alerts.some((a) => a.level === "danger")).toBe(true);
  });

  it("alerta quando uma taxa de plataforma elimina o lucro", () => {
    const result = runCalculationEngine(
      buildExampleInput({
        taxasPagamento: [
          { id: "1", nome: "Marketplace caro", taxaPercentual: 90, taxaFixaCentavos: 0 },
        ],
      }),
    );
    expect(result.paymentFeeRows[0].eliminaLucro).toBe(true);
    expect(
      result.alerts.some((a) => a.level === "warning" && a.message.includes("Marketplace caro")),
    ).toBe(true);
  });

  it("monta a tabela de preços por quantidade a partir do preço de anúncio", () => {
    const result = runCalculationEngine(
      buildExampleInput({
        faixasQuantidade: [
          { id: "1", quantidade: 1, descontoPercentual: 0 },
          { id: "2", quantidade: 10, descontoPercentual: 10 },
        ],
      }),
    );
    expect(result.quantityPricing).toHaveLength(2);
    expect(result.quantityPricing[0].precoUnitarioCentavos).toBe(result.precos.precoAnuncioCentavos);
  });

  it("markup e margem produzem preços recomendados diferentes para o mesmo percentual", () => {
    const viaMargem = runCalculationEngine(
      buildExampleInput({ metodoPrecificacao: "margem", margemPercentual: 30 }),
    );
    const viaMarkup = runCalculationEngine(
      buildExampleInput({ metodoPrecificacao: "markup", markupPercentual: 30 }),
    );
    expect(viaMargem.precos.precoRecomendadoCentavos).not.toBe(
      viaMarkup.precos.precoRecomendadoCentavos,
    );
  });
});
