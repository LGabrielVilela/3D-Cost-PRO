import { describe, expect, it } from "vitest";

import { computeDashboardStats } from "@/lib/dashboardStats";
import type { Order } from "@/types/entities";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    titulo: "Pedido teste",
    valorCentavos: 10000,
    status: "agendado",
    posicao: 0,
    ...overrides,
  };
}

describe("computeDashboardStats — pedidos", () => {
  it("soma apenas o valor dos pedidos finalizados no faturamento de pedidos", () => {
    const orders: Order[] = [
      makeOrder({ id: "1", status: "agendado", valorCentavos: 5000 }),
      makeOrder({ id: "2", status: "em_andamento", valorCentavos: 7000 }),
      makeOrder({ id: "3", status: "finalizado", valorCentavos: 12000 }),
      makeOrder({ id: "4", status: "finalizado", valorCentavos: 8000 }),
    ];

    const stats = computeDashboardStats([], [], orders);

    expect(stats.faturamentoPedidosCentavos).toBe(20000);
    expect(stats.pedidosFinalizados).toBe(2);
  });

  it("não conta nada quando não há pedidos finalizados", () => {
    const orders: Order[] = [makeOrder({ status: "agendado" }), makeOrder({ status: "em_andamento" })];

    const stats = computeDashboardStats([], [], orders);

    expect(stats.faturamentoPedidosCentavos).toBe(0);
    expect(stats.pedidosFinalizados).toBe(0);
  });

  it("funciona sem receber pedidos (parâmetro opcional)", () => {
    const stats = computeDashboardStats([], []);

    expect(stats.faturamentoPedidosCentavos).toBe(0);
    expect(stats.pedidosFinalizados).toBe(0);
  });
});
