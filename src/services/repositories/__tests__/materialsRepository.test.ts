// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { materialsRepository } from "../materialsRepository";

describe("materialsRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("cria e lista um material", async () => {
    const created = await materialsRepository.create({
      nome: "PLA Teste",
      tipo: "PLA",
      marca: "Marca X",
      cor: "Azul",
      precoCentavos: 9900,
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();

    const list = await materialsRepository.list();
    expect(list).toHaveLength(1);
    expect(list[0].nome).toBe("PLA Teste");
  });

  it("atualiza um material existente", async () => {
    const created = await materialsRepository.create({
      nome: "PETG Teste",
      tipo: "PETG",
      marca: "",
      cor: "",
      precoCentavos: 10900,
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    });

    const updated = await materialsRepository.update(created.id, { precoCentavos: 12000 });

    expect(updated?.precoCentavos).toBe(12000);
    const list = await materialsRepository.list();
    expect(list[0].precoCentavos).toBe(12000);
  });

  it("remove um material", async () => {
    const created = await materialsRepository.create({
      nome: "TPU Teste",
      tipo: "TPU",
      marca: "",
      cor: "",
      precoCentavos: 12900,
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    });

    await materialsRepository.remove(created.id);
    const list = await materialsRepository.list();
    expect(list).toHaveLength(0);
  });

  it("persiste os dados em localStorage entre chamadas (não apenas em memória)", async () => {
    await materialsRepository.create({
      nome: "ABS Teste",
      tipo: "ABS",
      marca: "",
      cor: "",
      precoCentavos: 8900,
      pesoRoloGramas: 1000,
      fornecedor: "",
      observacoes: "",
    });

    const raw = window.localStorage.getItem("3dcp:materials");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string)).toHaveLength(1);
  });
});
