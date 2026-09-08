"use client";

import { useCallback, useEffect, useState } from "react";

import { ordersRepository } from "@/services/repositories/ordersRepository";
import type { Order } from "@/types/entities";

export interface OrdersCollection {
  orders: Order[];
  loading: boolean;
  reload: () => Promise<void>;
  create: (
    data: Omit<Order, "id" | "createdAt" | "updatedAt" | "posicao" | "finalizadoEm">,
  ) => Promise<Order>;
  update: (id: string, patch: Partial<Omit<Order, "id" | "createdAt">>) => Promise<Order | undefined>;
  remove: (id: string) => Promise<void>;
  /**
   * Aplica de uma vez o resultado de um drag-and-drop: atualiza a tela
   * imediatamente (otimista) e persiste em segundo plano só os pedidos cujo
   * status/posição realmente mudou — evita 1 request por card no board.
   */
  applyBoardChange: (next: Order[]) => Promise<void>;
}

/** Coleção de pedidos do Painel de Pedidos (kanban: agendado/em andamento/finalizado). */
export function useOrders(): OrdersCollection {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await ordersRepository.list();
    setOrders(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    ordersRepository.list().then((list) => {
      if (!cancelled) {
        setOrders(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const create = useCallback<OrdersCollection["create"]>(
    async (data) => {
      const posicao = await ordersRepository.nextPosicao(data.status);
      const finalizadoEm = data.status === "finalizado" ? new Date().toISOString() : undefined;
      const created = await ordersRepository.create({ ...data, posicao, finalizadoEm });
      await reload();
      return created;
    },
    [reload],
  );

  const update = useCallback<OrdersCollection["update"]>(
    async (id, patch) => {
      const updated = await ordersRepository.update(id, patch);
      await reload();
      return updated;
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await ordersRepository.remove(id);
      await reload();
    },
    [reload],
  );

  const applyBoardChange = useCallback(
    async (next: Order[]) => {
      const previousById = new Map(orders.map((order) => [order.id, order]));
      setOrders(next);

      const changed = next.filter((order) => {
        const previous = previousById.get(order.id);
        return (
          !previous ||
          previous.status !== order.status ||
          previous.posicao !== order.posicao ||
          previous.finalizadoEm !== order.finalizadoEm
        );
      });

      await Promise.all(
        changed.map((order) =>
          ordersRepository.update(order.id, {
            status: order.status,
            posicao: order.posicao,
            finalizadoEm: order.finalizadoEm,
          }),
        ),
      );
    },
    [orders],
  );

  return { orders, loading, reload, create, update, remove, applyBoardChange };
}
