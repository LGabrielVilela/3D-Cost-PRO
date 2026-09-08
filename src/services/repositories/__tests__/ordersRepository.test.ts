// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { ordersRepository } from "../ordersRepository";

describe("ordersRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("cria e lista um pedido", async () => {
    const created = await ordersRepository.create({
      titulo: "Vaso geométrico",
      valorCentavos: 9900,
      status: "agendado",
      posicao: 0,
    });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();

    const list = await ordersRepository.list();
    expect(list).toHaveLength(1);
    expect(list[0].titulo).toBe("Vaso geométrico");
  });

  it("atualiza o status de um pedido (mover de coluna)", async () => {
    const created = await ordersRepository.create({
      titulo: "Suporte de celular",
      valorCentavos: 3500,
      status: "agendado",
      posicao: 0,
    });

    const updated = await ordersRepository.update(created.id, {
      status: "finalizado",
      finalizadoEm: "2026-09-08T12:00:00.000Z",
    });

    expect(updated?.status).toBe("finalizado");
    expect(updated?.finalizadoEm).toBe("2026-09-08T12:00:00.000Z");
  });

  it("remove um pedido", async () => {
    const created = await ordersRepository.create({
      titulo: "Miniatura",
      valorCentavos: 1500,
      status: "em_andamento",
      posicao: 0,
    });

    await ordersRepository.remove(created.id);
    const list = await ordersRepository.list();
    expect(list).toHaveLength(0);
  });

  it("nextPosicao aponta para o final da coluna informada, ignorando outras colunas", async () => {
    await ordersRepository.create({
      titulo: "Pedido 1",
      valorCentavos: 1000,
      status: "agendado",
      posicao: 0,
    });
    await ordersRepository.create({
      titulo: "Pedido 2",
      valorCentavos: 1000,
      status: "agendado",
      posicao: 1,
    });
    await ordersRepository.create({
      titulo: "Pedido 3",
      valorCentavos: 1000,
      status: "finalizado",
      posicao: 0,
    });

    expect(await ordersRepository.nextPosicao("agendado")).toBe(2);
    expect(await ordersRepository.nextPosicao("finalizado")).toBe(1);
    expect(await ordersRepository.nextPosicao("em_andamento")).toBe(0);
  });
});
