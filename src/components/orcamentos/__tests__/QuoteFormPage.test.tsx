// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { calculationsRepository } from "@/services/repositories/calculationsRepository";
import { clientsRepository } from "@/services/repositories/clientsRepository";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import { __resetSeedCacheForTests, SEED_VERSION } from "@/services/seed/demoData";
import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type { Calculation } from "@/types/entities";

import { QuoteFormPage } from "../QuoteFormPage";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

function skipDemoSeed() {
  window.localStorage.setItem(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

function buildCalculation(overrides: Partial<Calculation> = {}): Calculation {
  return {
    id: "calc-1",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    nome: "Chaveiro personalizado",
    input: {
      materialNome: "PLA",
      filamentoPrecoCentavos: 9900,
      filamentoPesoRoloGramas: 1000,
      gramasUtilizadas: 100,
      tempoImpressaoMinutos: 300,
      quantidadePecas: 20,
      printerNome: "Bambu A1",
      consumoWatts: 200,
      valorKwhCentavos: 80,
      depreciacaoAtiva: true,
      precoImpressoraCentavos: 219900,
      vidaUtilHoras: 8000,
      manutencaoMetodo: "percentual",
      manutencaoPorHoraCentavos: 0,
      manutencaoPercentual: 5,
      taxaFalhasPercentual: 10,
      tempoPreparacaoMinutos: 10,
      tempoAcabamentoMinutos: 10,
      tempoEmbalagemMinutos: 5,
      valorHoraTrabalhoCentavos: 2000,
      maoDeObraUsarValorFixo: true,
      maoDeObraValorFixoCentavos: 1500,
      embalagemCentavos: 200,
      etiquetaCentavos: 0,
      adesivoCentavos: 0,
      protecaoCentavos: 0,
      embalagemOutrosCentavos: 0,
      outrosCustos: [],
      metodoPrecificacao: "margem",
      margemPercentual: 30,
      markupPercentual: 100,
      taxasPagamento: [],
      descontoPercentual: 0,
      faixasQuantidade: [],
    },
    custos: {
      filamentoCentavos: 990,
      energiaCentavos: 80,
      depreciacaoCentavos: 137,
      manutencaoCentavos: 60,
      custoAntesPerdasCentavos: 1267,
      perdasCentavos: 127,
      custoAposPerdasCentavos: 1394,
      maoDeObraCentavos: 1500,
      embalagemCentavos: 200,
      outrosCentavos: 0,
      custoTotalCentavos: 3262,
      custoPorUnidadeCentavos: 3262,
    },
    precos: {
      precoMinimoCentavos: 3990,
      precoRecomendadoCentavos: 4660,
      precoAnuncioCentavos: 4990,
    },
    ...overrides,
  };
}

describe("QuoteFormPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetSeedCacheForTests();
    skipDemoSeed();
    pushMock.mockClear();
  });

  it("cria um orçamento do zero: seleciona cliente, preenche item e salva", async () => {
    await clientsRepository.create({
      nome: "Maria Silva",
      empresa: "Studio Maria",
      whatsapp: "(11) 97777-5678",
    });

    const user = userEvent.setup();
    render(<QuoteFormPage />);

    await user.click(await screen.findByRole("combobox", { name: "Cliente" }));
    await user.click(await screen.findByRole("option", { name: /Maria Silva/ }));

    await user.type(screen.getByLabelText("Descrição do serviço"), "Chaveiros personalizados");
    await user.type(screen.getByLabelText("Descrição"), "Chaveiro abridor de lata");

    const precoInput = screen.getByLabelText("Preço unitário") as HTMLInputElement;
    await user.clear(precoInput);
    await user.type(precoInput, "14,90");

    const quantidadeInput = screen.getByLabelText("Quantidade") as HTMLInputElement;
    await user.clear(quantidadeInput);
    await user.type(quantidadeInput, "20");

    await user.click(screen.getByRole("button", { name: "Salvar orçamento" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalled());

    const quotes = await quotesRepository.list();
    expect(quotes).toHaveLength(1);
    expect(quotes[0].itens[0].totalCentavos).toBe(29800); // 20 × R$14,90
    expect(quotes[0].clientId).toBeTruthy();
  });

  it("transfere item, quantidade e preço de anúncio automaticamente ao vir da calculadora", async () => {
    await clientsRepository.create({ nome: "João Pereira" });
    const calculation = await calculationsRepository.create(buildCalculation());

    render(<QuoteFormPage initialCalculation={calculation} />);

    // 20 unidades ao preço de anúncio (R$49,90) — nunca o custo ou o preço mínimo/recomendado.
    const descricaoItem = (await screen.findByLabelText("Descrição")) as HTMLInputElement;
    await waitFor(() => expect(descricaoItem.value).toBe("Chaveiro personalizado"));
    expect((screen.getByLabelText("Preço unitário") as HTMLInputElement).value).toBe("49,90");
    expect((screen.getByLabelText("Quantidade") as HTMLInputElement).value).toBe("20");
  });
});
