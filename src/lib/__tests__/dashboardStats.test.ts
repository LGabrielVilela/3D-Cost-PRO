import { describe, expect, it } from "vitest";

import { computeDashboardStats, computeOrdersWeeklySeries, computeOverdueOrders } from "@/lib/dashboardStats";
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

  it("conta pedidos agendados, em andamento e atrasados", () => {
    const orders: Order[] = [
      makeOrder({ id: "1", status: "agendado" }),
      makeOrder({ id: "2", status: "agendado" }),
      makeOrder({ id: "3", status: "em_andamento" }),
      makeOrder({ id: "4", status: "agendado", dataEntrega: "2020-01-01" }), // atrasado
      makeOrder({ id: "5", status: "finalizado", dataEntrega: "2020-01-01" }), // finalizado não conta como atrasado
    ];

    const stats = computeDashboardStats([], [], orders);

    expect(stats.pedidosAgendados).toBe(3);
    expect(stats.pedidosEmAndamento).toBe(1);
    expect(stats.pedidosAtrasados).toBe(1);
  });
});

describe("computeOverdueOrders", () => {
  it("lista apenas pedidos não finalizados com dataEntrega no passado, do mais atrasado pro mais recente", () => {
    const orders: Order[] = [
      makeOrder({ id: "no-prazo", status: "agendado", dataEntrega: "2099-01-01" }),
      makeOrder({ id: "sem-data", status: "agendado" }),
      makeOrder({ id: "atrasado-recente", status: "em_andamento", dataEntrega: "2026-09-05" }),
      makeOrder({ id: "atrasado-antigo", status: "agendado", dataEntrega: "2026-08-01" }),
      makeOrder({ id: "finalizado-atrasado", status: "finalizado", dataEntrega: "2020-01-01" }),
    ];

    const atrasados = computeOverdueOrders(orders, "2026-09-08");

    expect(atrasados.map((o) => o.id)).toEqual(["atrasado-antigo", "atrasado-recente"]);
  });

  it("retorna lista vazia quando nada está atrasado", () => {
    const orders: Order[] = [makeOrder({ status: "agendado", dataEntrega: "2099-01-01" })];
    expect(computeOverdueOrders(orders, "2026-09-08")).toHaveLength(0);
  });
});

describe("computeOrdersWeeklySeries", () => {
  it("soma quantidade e valor dos pedidos finalizados por semana, ignorando os não finalizados", () => {
    const hoje = new Date();
    const isoHoje = hoje.toISOString();

    const orders: Order[] = [
      makeOrder({ id: "1", status: "finalizado", valorCentavos: 5000, finalizadoEm: isoHoje }),
      makeOrder({ id: "2", status: "finalizado", valorCentavos: 3000, finalizadoEm: isoHoje }),
      makeOrder({ id: "3", status: "agendado", valorCentavos: 9999 }),
    ];

    const series = computeOrdersWeeklySeries(orders, 3);

    expect(series).toHaveLength(3);
    const ultimaSemana = series[series.length - 1];
    expect(ultimaSemana.quantidade).toBe(2);
    expect(ultimaSemana.valorCentavos).toBe(8000);
  });
});
