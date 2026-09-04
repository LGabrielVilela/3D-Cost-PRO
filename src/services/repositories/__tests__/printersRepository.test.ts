// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { printersRepository } from "../printersRepository";

describe("printersRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("cria, atualiza e remove uma impressora", async () => {
    const created = await printersRepository.create({
      nome: "Impressora Teste",
      marca: "Marca X",
      modelo: "Modelo 1",
      precoAquisicaoCentavos: 200000,
      consumoWatts: 200,
      vidaUtilHoras: 8000,
      manutencaoPorHoraCentavos: 50,
      observacoes: "",
    });

    expect(created.id).toBeTruthy();

    const updated = await printersRepository.update(created.id, { consumoWatts: 250 });
    expect(updated?.consumoWatts).toBe(250);

    await printersRepository.remove(created.id);
    const list = await printersRepository.list();
    expect(list).toHaveLength(0);
  });
});
