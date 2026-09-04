import { describe, expect, it } from "vitest";

import { calculateNetAfterFee, calculatePaymentFeeRows, calculatePriceForDesiredNet } from "../platformFees";

describe("calculateNetAfterFee", () => {
  it("desconta taxa percentual e fixa de um preço", () => {
    // R$50,00 com taxa de 10% + R$1,00 fixo => 45,00 - 1,00 = 44,00
    expect(calculateNetAfterFee(5000, 10, 100)).toBe(4400);
  });

  it("taxa 0% retorna o preço integral", () => {
    expect(calculateNetAfterFee(5000, 0, 0)).toBe(5000);
  });
});

describe("calculatePriceForDesiredNet", () => {
  it("calcula o preço necessário para preservar o líquido desejado", () => {
    // quer líquido de R$46,60 numa taxa de 15% sem parte fixa
    // preço = 46,60 / 0,85 = 54,8235... -> 5482 centavos
    const preco = calculatePriceForDesiredNet(4660, 15, 0);
    expect(preco).toBe(5482);
    // conferindo: aplicar a taxa sobre o preço encontrado deve devolver ~o líquido desejado
    expect(calculateNetAfterFee(preco, 15, 0)).toBeGreaterThanOrEqual(4660);
  });

  it("com taxa 0%, o preço necessário é igual ao líquido desejado", () => {
    expect(calculatePriceForDesiredNet(4660, 0, 0)).toBe(4660);
  });
});

describe("calculatePaymentFeeRows", () => {
  it("identifica quando uma taxa alta elimina o lucro no preço de anúncio", () => {
    const rows = calculatePaymentFeeRows(
      [{ id: "1", nome: "Marketplace", taxaPercentual: 30, taxaFixaCentavos: 0 }],
      4660, // preço recomendado
      3262, // preço de anúncio == custo (cenário artificial para forçar o alerta)
      3262, // custo total
    );
    expect(rows[0].eliminaLucro).toBe(true);
  });

  it("taxa 0% (ex: PIX) nunca elimina o lucro se o anúncio cobre o custo", () => {
    const rows = calculatePaymentFeeRows(
      [{ id: "1", nome: "PIX", taxaPercentual: 0, taxaFixaCentavos: 0 }],
      4660,
      4990,
      3262,
    );
    expect(rows[0].eliminaLucro).toBe(false);
    expect(rows[0].liquidoNoPrecoAnuncioCentavos).toBe(4990);
  });
});
