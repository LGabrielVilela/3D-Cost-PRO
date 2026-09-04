// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { materialsRepository } from "@/services/repositories/materialsRepository";
import { __resetSeedCacheForTests, SEED_VERSION } from "@/services/seed/demoData";
import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";

import { MaterialsPage } from "../MaterialsPage";

function skipDemoSeed() {
  window.localStorage.setItem(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

async function seedMaterial(nome: string, precoCentavos = 9900) {
  return materialsRepository.create({
    nome,
    tipo: "PLA",
    marca: "",
    cor: "",
    precoCentavos,
    pesoRoloGramas: 1000,
    fornecedor: "",
    observacoes: "",
  });
}

describe("MaterialsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetSeedCacheForTests();
    skipDemoSeed();
  });

  it("mostra o estado vazio e permite cadastrar um novo material", async () => {
    const user = userEvent.setup();
    render(<MaterialsPage />);

    expect(await screen.findByText("Nenhum material cadastrado")).toBeInTheDocument();

    const novoBotoes = screen.getAllByRole("button", { name: "Novo material" });
    await user.click(novoBotoes[0]);

    await user.type(screen.getByLabelText("Nome"), "PLA Novo");
    await user.type(screen.getByLabelText("Preço do rolo"), "99,90");
    await user.click(screen.getByRole("button", { name: "Adicionar material" }));

    expect(await screen.findByText("PLA Novo")).toBeInTheDocument();

    const persisted = await materialsRepository.list();
    expect(persisted).toHaveLength(1);
    expect(persisted[0].nome).toBe("PLA Novo");
    expect(persisted[0].precoCentavos).toBe(9990);
  });

  it("filtra a lista pela busca", async () => {
    await seedMaterial("PLA Alpha");
    await seedMaterial("PETG Beta");
    const user = userEvent.setup();

    render(<MaterialsPage />);
    expect(await screen.findByText("PLA Alpha")).toBeInTheDocument();
    expect(screen.getByText("PETG Beta")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/pesquisar/i), "alpha");

    expect(screen.getByText("PLA Alpha")).toBeInTheDocument();
    expect(screen.queryByText("PETG Beta")).not.toBeInTheDocument();
  });

  it("edita um material existente e reflete a mudança na tabela e no storage", async () => {
    const material = await seedMaterial("PLA Editável", 5000);
    const user = userEvent.setup();

    render(<MaterialsPage />);
    await screen.findByText("PLA Editável");

    await user.click(screen.getByRole("button", { name: "Editar PLA Editável" }));

    const precoInput = await screen.findByLabelText("Preço do rolo");
    await user.clear(precoInput);
    await user.type(precoInput, "60,00");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByText("R$ 60,00")).toBeInTheDocument();
    const updated = await materialsRepository.getById(material.id);
    expect(updated?.precoCentavos).toBe(6000);
  });

  it("exclui um material após confirmação", async () => {
    await seedMaterial("PLA Removível");
    const user = userEvent.setup();

    render(<MaterialsPage />);
    await screen.findByText("PLA Removível");

    await user.click(screen.getByRole("button", { name: "Excluir PLA Removível" }));

    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    expect(screen.queryByText("PLA Removível")).not.toBeInTheDocument();
    expect(await materialsRepository.list()).toHaveLength(0);
  });

  it("impede o cadastro de um material com nome já existente", async () => {
    await seedMaterial("PLA Único");
    const user = userEvent.setup();

    render(<MaterialsPage />);
    await screen.findByText("PLA Único");

    await user.click(screen.getAllByRole("button", { name: "Novo material" })[0]);
    await user.type(screen.getByLabelText("Nome"), "PLA Único");
    await user.type(screen.getByLabelText("Preço do rolo"), "10,00");
    await user.click(screen.getByRole("button", { name: "Adicionar material" }));

    expect(
      await screen.findByText("Já existe um material cadastrado com esse nome"),
    ).toBeInTheDocument();
    expect(await materialsRepository.list()).toHaveLength(1);
  });
});
