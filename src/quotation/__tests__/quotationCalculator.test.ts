import { describe, expect, it } from "vitest";

import {
  calculateItemTotal,
  calculateQuoteDiscount,
  calculateQuoteTotals,
  calculateSubtotal,
} from "../quotationCalculator";

describe("calculateItemTotal", () => {
  it("multiplica quantidade × preço unitário", () => {
    // 20 × R$14,90 = R$298,00 (exemplo da especificação)
    expect(calculateItemTotal(20, 1490)).toBe(29800);
  });

  it("quantidade zero resulta em total zero", () => {
    expect(calculateItemTotal(0, 1490)).toBe(0);
  });
});

describe("calculateSubtotal", () => {
  it("soma o total de múltiplos itens", () => {
    const subtotal = calculateSubtotal([
      { totalCentavos: 29800 },
      { totalCentavos: 5000 },
      { totalCentavos: 1200 },
    ]);
    expect(subtotal).toBe(36000);
  });

  it("lista vazia resulta em subtotal zero", () => {
    expect(calculateSubtotal([])).toBe(0);
  });
});

describe("calculateQuoteDiscount", () => {
  it("desconto percentual: R$1.000,00 com 10% = R$100,00, total R$900,00", () => {
    const result = calculateQuoteDiscount(100000, "percentual", 10);
    expect(result.descontoCentavos).toBe(10000);
    expect(result.totalCentavos).toBe(90000);
  });

  it("desconto em valor fixo é aplicado diretamente", () => {
    const result = calculateQuoteDiscount(100000, "valorFixo", 15000);
    expect(result.descontoCentavos).toBe(15000);
    expect(result.totalCentavos).toBe(85000);
  });

  it("desconto fixo nunca deixa o total negativo (limitado ao subtotal)", () => {
    const result = calculateQuoteDiscount(5000, "valorFixo", 999999);
    expect(result.descontoCentavos).toBe(5000);
    expect(result.totalCentavos).toBe(0);
  });

  it("sem desconto, o total é igual ao subtotal", () => {
    const result = calculateQuoteDiscount(29800, "percentual", 0);
    expect(result.descontoCentavos).toBe(0);
    expect(result.totalCentavos).toBe(29800);
  });
});

describe("calculateQuoteTotals", () => {
  it("reproduz o exemplo da especificação: 20un × R$14,90 = R$298,00", () => {
    const totals = calculateQuoteTotals({
      itens: [{ totalCentavos: calculateItemTotal(20, 1490) }],
      descontoTipo: "percentual",
      descontoValor: 0,
    });
    expect(totals.subtotalCentavos).toBe(29800);
    expect(totals.totalCentavos).toBe(29800);
  });

  it("combina múltiplos produtos com desconto percentual", () => {
    const totals = calculateQuoteTotals({
      itens: [
        { totalCentavos: calculateItemTotal(20, 1490) }, // 29800
        { totalCentavos: calculateItemTotal(5, 2000) }, // 10000
      ],
      descontoTipo: "percentual",
      descontoValor: 10,
    });
    expect(totals.subtotalCentavos).toBe(39800);
    expect(totals.descontoCentavos).toBe(3980);
    expect(totals.totalCentavos).toBe(35820);
  });
});
