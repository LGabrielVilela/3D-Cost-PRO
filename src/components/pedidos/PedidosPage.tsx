"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { useOrders } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/types/entities";

import { KanbanColumn } from "./KanbanColumn";
import { OrderCard } from "./OrderCard";
import { OrderFormDialog } from "./OrderFormDialog";
import { formValuesToOrder, ORDER_STATUS_OPTIONS } from "./schema";

const COLUMN_STATUSES: OrderStatus[] = ORDER_STATUS_OPTIONS.map((o) => o.value);

/**
 * O card inteiro é arrastável (ver `OrderCard`) — exceto os controles
 * marcados com `data-no-dnd` (título/menu de ações), que precisam continuar
 * clicáveis normalmente. Sem esse sensor customizado, o dnd-kit tentaria
 * iniciar um arraste a partir de qualquer pointerdown no card, inclusive
 * nesses botões.
 */
class CardDragSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent }: ReactPointerEvent) => {
        const target = nativeEvent.target;
        return !(target instanceof HTMLElement && target.closest("[data-no-dnd]"));
      },
    },
  ];
}

/** Painel de Pedidos: kanban de agendado -> em andamento -> finalizado, com drag-and-drop. */
export function PedidosPage() {
  const { orders, loading, create, update, remove, applyBoardChange } = useOrders();
  const { clients } = useClients();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Atalho "Novo pedido" do Dashboard entra como /pedidos?novo=1 — abre o
  // diálogo de criação já na primeira renderização (ver efeito abaixo, que
  // só cuida de limpar a URL).
  const [dialogAberto, setDialogAberto] = useState(() => searchParams.get("novo") === "1");
  const [pedidoEmEdicao, setPedidoEmEdicao] = useState<Order | undefined>(undefined);
  const [colunaParaNovo, setColunaParaNovo] = useState<OrderStatus>("agendado");
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<Order | undefined>(undefined);
  const [activeOrder, setActiveOrder] = useState<Order | undefined>(undefined);

  const sensors = useSensors(
    useSensor(CardDragSensor, { activationConstraint: { distance: 6 } }),
  );

  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  const ordersByStatus = useMemo(() => {
    const grouped = new Map<OrderStatus, Order[]>(COLUMN_STATUSES.map((status) => [status, []]));
    for (const order of orders) {
      grouped.get(order.status)?.push(order);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => a.posicao - b.posicao);
    }
    return grouped;
  }, [orders]);

  function abrirNovo(status: OrderStatus) {
    setPedidoEmEdicao(undefined);
    setColunaParaNovo(status);
    setDialogAberto(true);
  }

  function abrirEdicao(order: Order) {
    setPedidoEmEdicao(order);
    setDialogAberto(true);
  }

  // Limpa o `?novo=1` da URL depois de ler (evita reabrir o diálogo num refresh).
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      router.replace("/pedidos");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function salvar(values: Parameters<typeof formValuesToOrder>[0]) {
    const data = formValuesToOrder(values);
    if (pedidoEmEdicao) {
      await update(pedidoEmEdicao.id, data);
    } else {
      await create(data);
    }
  }

  async function confirmarExclusao() {
    if (!pedidoParaExcluir) return;
    await remove(pedidoParaExcluir.id);
    setPedidoParaExcluir(undefined);
  }

  function handleDragStart(event: DragStartEvent) {
    const order = orders.find((o) => o.id === event.active.id);
    setActiveOrder(order);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveOrder(undefined);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const activeOrderItem = orders.find((o) => o.id === activeId);
    if (!activeOrderItem) return;

    const overId = String(over.id);
    const overIsColumn = COLUMN_STATUSES.includes(overId as OrderStatus);
    const destStatus: OrderStatus = overIsColumn
      ? (overId as OrderStatus)
      : (orders.find((o) => o.id === overId)?.status ?? activeOrderItem.status);

    const sourceStatus = activeOrderItem.status;
    if (sourceStatus === destStatus && overIsColumn) return; // solto na própria coluna, sem alvo

    const destColumn = orders
      .filter((o) => o.status === destStatus && o.id !== activeId)
      .sort((a, b) => a.posicao - b.posicao);

    let destIndex = destColumn.length;
    if (!overIsColumn) {
      const overIndex = destColumn.findIndex((o) => o.id === overId);
      if (overIndex !== -1) destIndex = overIndex;
    }
    destColumn.splice(destIndex, 0, activeOrderItem);

    const now = new Date().toISOString();
    const updatedDestColumn = destColumn.map((o, index) => ({
      ...o,
      status: destStatus,
      posicao: index,
      finalizadoEm: destStatus === "finalizado" ? (o.finalizadoEm ?? now) : undefined,
    }));

    const updatedSourceColumn =
      sourceStatus === destStatus
        ? []
        : orders
            .filter((o) => o.status === sourceStatus && o.id !== activeId)
            .sort((a, b) => a.posicao - b.posicao)
            .map((o, index) => ({ ...o, posicao: index }));

    const updatedById = new Map(
      [...updatedDestColumn, ...updatedSourceColumn].map((o) => [o.id, o]),
    );
    const next = orders.map((o) => updatedById.get(o.id) ?? o);

    void applyBoardChange(next);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Pedidos"
        description="Organize os pedidos a montar, em andamento e finalizados — arraste entre as colunas."
        actions={
          <Button onClick={() => abrirNovo("agendado")}>
            <Plus className="h-4 w-4" />
            Novo pedido
          </Button>
        }
      />

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMN_STATUSES.map((status) => (
            <div key={status} className="w-full space-y-2 sm:w-80 sm:shrink-0">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveOrder(undefined)}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:overflow-x-auto sm:pb-2">
            {ORDER_STATUS_OPTIONS.map((option) => (
              <KanbanColumn
                key={option.value}
                status={option.value}
                title={option.label}
                orders={ordersByStatus.get(option.value) ?? []}
                clientsById={clientsById}
                onAdd={abrirNovo}
                onEdit={abrirEdicao}
                onDelete={setPedidoParaExcluir}
              />
            ))}
          </div>

          <DragOverlay>
            {activeOrder ? (
              <OrderCard
                order={activeOrder}
                client={activeOrder.clientId ? clientsById.get(activeOrder.clientId) : undefined}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <OrderFormDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        order={pedidoEmEdicao}
        defaultStatus={colunaParaNovo}
        onSubmit={salvar}
      />

      <ConfirmDeleteDialog
        open={Boolean(pedidoParaExcluir)}
        onOpenChange={(open) => !open && setPedidoParaExcluir(undefined)}
        title={`Excluir "${pedidoParaExcluir?.titulo}"?`}
        description="Essa ação não pode ser desfeita."
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
