import { describe, expect, it } from "vitest";

import {
  applyCommercialRounding,
  calculateMarginPrice,
  calculateMarkupPrice,
  calculateRealMargin,
  calculateRealMarkup,
  calculateSuggestedPrices,
} from "../pricing";

describe("calculateMarkupPrice", () => {
  it("markup 100% dobra o custo", () => {
    expect(calculateMarkupPrice(3000, 100)).toBe(6000);
  });

  it("markup 0% mantém o preço igual ao custo", () => {
    expect(calculateMarkupPrice(3000, 0)).toBe(3000);
  });
});

describe("calculateMarginPrice", () => {
  it("calcula o preço pelo exemplo da especificação: custo R$32,62, margem 30%", () => {
    // 32,62 / 0,70 = 46,60
    expect(calculateMarginPrice(3262, 30)).toBe(4660);
  });

  it("margem 0% mantém o preço igual ao custo", () => {
    expect(calculateMarginPrice(3000, 0)).toBe(3000);
  });

  it("margem >= 100% é inválida e retorna 0 (não confundir com markup)", () => {
    expect(calculateMarginPrice(3000, 100)).toBe(0);
    expect(calculateMarginPrice(3000, 150)).toBe(0);
  });
});

describe("markup vs. margem não são o mesmo cálculo", () => {
  it("um markup de 100% e uma margem de 50% chegam ao mesmo preço, mas markup 30% ≠ margem 30%", () => {
    const custo = 10000;
    expect(calculateMarkupPrice(custo, 100)).toBe(calculateMarginPrice(custo, 50));
    expect(calculateMarkupPrice(custo, 30)).not.toBe(calculateMarginPrice(custo, 30));
  });
});

describe("calculateRealMargin / calculateRealMarkup", () => {
  it("recupera a margem configurada a partir do preço gerado", () => {
    const custo = 3262;
    const preco = calculateMarginPrice(custo, 30);
    expect(calculateRealMargin(custo, preco)).toBeCloseTo(30, 1);
  });

  it("recupera o markup configurado a partir do preço gerado", () => {
    const custo = 3000;
    const preco = calculateMarkupPrice(custo, 40);
    expect(calculateRealMarkup(custo, preco)).toBeCloseTo(40, 1);
  });

  it("margem real é 0 quando o preço é 0 (evita divisão por zero)", () => {
    expect(calculateRealMargin(1000, 0)).toBe(0);
  });
});

describe("applyCommercialRounding", () => {
  it("arredonda R$32,62 para R$39,90 (exemplo do preço mínimo)", () => {
    expect(applyCommercialRounding(3262)).toBe(3990);
  });

  it("arredonda R$46,60 para R$49,90 (exemplo do preço de anúncio)", () => {
    expect(applyCommercialRounding(4660)).toBe(4990);
  });

  it("nunca arredonda para um valor menor que o original", () => {
    const centavos = 3990; // já termina em ,90 e é múltiplo-10 exato
    const arredondado = applyCommercialRounding(centavos);
    expect(arredondado).toBeGreaterThanOrEqual(centavos);
  });

  it("valores baixos usam passo 1 (não salta para a dezena seguinte)", () => {
    // R$2,20 -> passo 1 -> próximo inteiro (3) - 0,10 = R$2,90
    expect(applyCommercialRounding(220)).toBe(290);
  });

  it("retorna 0 para custo 0", () => {
    expect(applyCommercialRounding(0)).toBe(0);
  });
});

describe("calculateSuggestedPrices", () => {
  it("reproduz os três preços do exemplo da especificação a partir do custo total", () => {
    const result = calculateSuggestedPrices({
      custoTotalCentavos: 3262,
      metodoPrecificacao: "margem",
      percentual: 30,
    });

    expect(result.precoMinimoCentavos).toBe(3990); // custo arredondado comercialmente
    expect(result.precoRecomendadoCentavos).toBe(4660); // margem 30% aplicada, sem arredondar
    expect(result.precoAnuncioCentavos).toBe(4990); // recomendado arredondado comercialmente
  });

  it("preço mínimo nunca fica abaixo do custo total", () => {
    const result = calculateSuggestedPrices({
      custoTotalCentavos: 3262,
      metodoPrecificacao: "margem",
      percentual: 30,
    });
    expect(result.precoMinimoCentavos).toBeGreaterThanOrEqual(3262);
  });
});
