// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { printersRepository } from "@/services/repositories/printersRepository";
import { __resetSeedCacheForTests, SEED_VERSION } from "@/services/seed/demoData";
import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";

import { PrintersPage } from "../PrintersPage";

function skipDemoSeed() {
  window.localStorage.setItem(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

async function seedPrinter(nome: string, precoAquisicaoCentavos = 200000) {
  return printersRepository.create({
    nome,
    marca: "",
    modelo: "",
    precoAquisicaoCentavos,
    consumoWatts: 200,
    vidaUtilHoras: 8000,
    manutencaoPorHoraCentavos: 50,
    observacoes: "",
  });
}

describe("PrintersPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetSeedCacheForTests();
    skipDemoSeed();
  });

  it("mostra o estado vazio e permite cadastrar uma nova impressora", async () => {
    const user = userEvent.setup();
    render(<PrintersPage />);

    expect(await screen.findByText("Nenhuma impressora cadastrada")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Nova impressora" })[0]);
    await user.type(screen.getByLabelText("Nome"), "Impressora Nova");
    await user.type(screen.getByLabelText("Preço de aquisição"), "2000,00");
    await user.click(screen.getByRole("button", { name: "Adicionar impressora" }));

    expect(await screen.findByText("Impressora Nova")).toBeInTheDocument();
    const persisted = await printersRepository.list();
    expect(persisted).toHaveLength(1);
    expect(persisted[0].precoAquisicaoCentavos).toBe(200000);
  });

  it("calcula depreciação/hora automaticamente a partir do preço e da vida útil", async () => {
    // R$2.000,00 / 8.000h = R$0,25/h
    await seedPrinter("Impressora Depreciação", 200000);
    render(<PrintersPage />);

    await screen.findByText("Impressora Depreciação");
    expect(screen.getByText("R$ 0,25")).toBeInTheDocument();
  });

  it("edita e exclui uma impressora existente", async () => {
    const printer = await seedPrinter("Impressora Editável");
    const user = userEvent.setup();

    render(<PrintersPage />);
    await screen.findByText("Impressora Editável");

    await user.click(screen.getByRole("button", { name: "Editar Impressora Editável" }));
    const consumoInput = await screen.findByLabelText("Consumo médio");
    await user.clear(consumoInput);
    await user.type(consumoInput, "300");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await screen.findByText("Impressora Editável");
    const updated = await printersRepository.getById(printer.id);
    expect(updated?.consumoWatts).toBe(300);

    await user.click(screen.getByRole("button", { name: "Excluir Impressora Editável" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    expect(screen.queryByText("Impressora Editável")).not.toBeInTheDocument();
    expect(await printersRepository.list()).toHaveLength(0);
  });

  it("impede o cadastro de uma impressora com nome já existente", async () => {
    await seedPrinter("Bambu Única");
    const user = userEvent.setup();

    render(<PrintersPage />);
    await screen.findByText("Bambu Única");

    await user.click(screen.getAllByRole("button", { name: "Nova impressora" })[0]);
    await user.type(screen.getByLabelText("Nome"), "Bambu Única");
    await user.type(screen.getByLabelText("Preço de aquisição"), "500,00");
    await user.click(screen.getByRole("button", { name: "Adicionar impressora" }));

    expect(
      await screen.findByText("Já existe uma impressora cadastrada com esse nome"),
    ).toBeInTheDocument();
    expect(await printersRepository.list()).toHaveLength(1);
  });
});
