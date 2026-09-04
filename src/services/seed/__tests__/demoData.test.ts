// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { clientsRepository } from "@/services/repositories/clientsRepository";
import { materialsRepository } from "@/services/repositories/materialsRepository";
import { printersRepository } from "@/services/repositories/printersRepository";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import { __resetSeedCacheForTests, seedDemoDataIfNeeded } from "../demoData";

describe("seedDemoDataIfNeeded", () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetSeedCacheForTests();
  });

  it("popula materiais, impressoras, clientes e orçamentos de demonstração", async () => {
    await seedDemoDataIfNeeded();

    const materials = await materialsRepository.list();
    const printers = await printersRepository.list();
    const clients = await clientsRepository.list();
    const quotes = await quotesRepository.list();

    expect(materials.length).toBeGreaterThanOrEqual(4);
    expect(materials.map((m) => m.nome)).toEqual(
      expect.arrayContaining(["PLA Basic", "PLA Premium", "PETG", "TPU"]),
    );

    expect(printers.length).toBeGreaterThanOrEqual(5);
    expect(printers.map((p) => p.nome)).toEqual(
      expect.arrayContaining(["Bambu A1", "Bambu A1 Mini", "Bambu P1S", "Bambu X1C", "Ender 3"]),
    );

    expect(clients.length).toBeGreaterThan(0);
    expect(quotes.length).toBeGreaterThan(0);
  });

  it("nenhum material ou impressora de demonstração tem nome duplicado", async () => {
    await seedDemoDataIfNeeded();

    const materials = await materialsRepository.list();
    const printers = await printersRepository.list();

    expect(new Set(materials.map((m) => m.nome)).size).toBe(materials.length);
    expect(new Set(printers.map((p) => p.nome)).size).toBe(printers.length);
  });

  it("é idempotente: rodar novamente não duplica os dados", async () => {
    await seedDemoDataIfNeeded();
    const antes = await materialsRepository.list();

    // Mesmo chamando de novo (com o cache resetado), a versão do seed já
    // salva no localStorage impede um novo seed.
    __resetSeedCacheForTests();
    await seedDemoDataIfNeeded();
    const depois = await materialsRepository.list();

    expect(depois).toHaveLength(antes.length);
  });
});
