import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS } from "@/services/repositories/settingsRepository";
import type { AppSettings, Client, Quote } from "@/types/entities";

import { buildQuotationPublicData } from "../buildQuotationPublicData";

function buildQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    id: "quote-1",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    numero: 125,
    clientId: "client-1",
    calculationId: "calc-1",
    descricaoServico: "Chaveiro personalizado abridor de lata",
    itens: [
      {
        id: "item-1",
        descricao: "Chaveiro personalizado abridor de lata",
        material: "PLA",
        cor: "Preto",
        quantidade: 20,
        precoUnitarioCentavos: 1490,
        totalCentavos: 29800,
      },
    ],
    prazoEntrega: "7 dias úteis",
    dataOrcamento: "2026-09-03",
    validadeData: "2026-09-10",
    formasPagamento: [{ id: "pag-1", nome: "PIX", descontoPercentual: 0 }],
    descontoPercentual: 0,
    descontoTipo: "percentual",
    observacoes: "",
    status: "enviado",
    subtotalCentavos: 29800,
    totalCentavos: 29800,
    ...overrides,
  };
}

function buildClient(overrides: Partial<Client> = {}): Client {
  return {
    id: "client-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    nome: "Maria Silva",
    empresa: "Studio Maria",
    whatsapp: "(11) 97777-5678",
    ...overrides,
  };
}

const settings: AppSettings = DEFAULT_SETTINGS;

describe("buildQuotationPublicData", () => {
  it("nunca inclui campos de custo interno (filamento, energia, margem, etc.)", () => {
    const data = buildQuotationPublicData(buildQuote(), buildClient(), settings);
    const serializado = JSON.stringify(data).toLowerCase();

    const termosProibidos = [
      "filamento",
      "energia",
      "depreciac",
      "manutencao",
      "custo",
      "margem",
      "markup",
      "maodeobra",
      "mao_de_obra",
    ];

    for (const termo of termosProibidos) {
      expect(serializado).not.toContain(termo);
    }
  });

  it("monta os totais corretamente a partir dos itens do orçamento", () => {
    const data = buildQuotationPublicData(buildQuote(), buildClient(), settings);
    expect(data.totais.subtotalCentavos).toBe(29800);
    expect(data.totais.totalCentavos).toBe(29800);
    expect(data.totais.temDesconto).toBe(false);
  });

  it("aplica o desconto configurado no orçamento", () => {
    const quote = buildQuote({ descontoTipo: "percentual", descontoPercentual: 10 });
    const data = buildQuotationPublicData(quote, buildClient(), settings);
    expect(data.totais.descontoCentavos).toBe(2980);
    expect(data.totais.totalCentavos).toBe(26820);
    expect(data.totais.temDesconto).toBe(true);
  });

  it("formata o número e as datas do orçamento", () => {
    const data = buildQuotationPublicData(buildQuote(), buildClient(), settings);
    expect(data.numeroFormatado).toBe("000125");
    expect(data.dataFormatada).toBe("03/09/2026");
    expect(data.validadeFormatada).toBe("10/09/2026");
    expect(data.validadeDias).toBe(7);
  });

  it("funciona sem cliente (cliente removido ou não selecionado)", () => {
    const data = buildQuotationPublicData(buildQuote(), undefined, settings);
    expect(data.cliente).toBeUndefined();
  });

  it("usa os dados da empresa vindos das configurações", () => {
    const data = buildQuotationPublicData(buildQuote(), buildClient(), {
      ...settings,
      empresa: { ...settings.empresa, nome: "Minha Gráfica 3D" },
    });
    expect(data.empresa.nome).toBe("Minha Gráfica 3D");
  });
});
