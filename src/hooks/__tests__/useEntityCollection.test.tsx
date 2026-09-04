// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useEntityCollection } from "@/hooks/useEntityCollection";
import { materialsRepository } from "@/services/repositories/materialsRepository";
import { __resetSeedCacheForTests, SEED_VERSION } from "@/services/seed/demoData";
import { STORAGE_KEYS } from "@/services/storage/localStorageAdapter";

function skipDemoSeed() {
  // Marca o seed como "já feito" para testar a coleção em estado limpo,
  // sem os materiais de demonstração interferindo nas asserções.
  window.localStorage.setItem(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

describe("useEntityCollection (via materialsRepository)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetSeedCacheForTests();
    skipDemoSeed();
  });

  it("carrega a lista vazia e depois cria, atualiza e remove um item", async () => {
    const { result } = renderHook(() => useEntityCollection(materialsRepository));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(0);

    let created: Awaited<ReturnType<typeof result.current.create>>;
    await act(async () => {
      created = await result.current.create({
        nome: "Material Hook",
        tipo: "PLA",
        marca: "",
        cor: "",
        precoCentavos: 5000,
        pesoRoloGramas: 1000,
        fornecedor: "",
        observacoes: "",
      });
    });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.items[0].nome).toBe("Material Hook");

    await act(async () => {
      await result.current.update(created!.id, { precoCentavos: 7500 });
    });
    await waitFor(() => expect(result.current.items[0].precoCentavos).toBe(7500));

    await act(async () => {
      await result.current.remove(created!.id);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(0));
  });
});
