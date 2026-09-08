"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCentavos } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Client, Order, OrderStatus } from "@/types/entities";

import { OrderCard } from "./OrderCard";

interface KanbanColumnProps {
  status: OrderStatus;
  title: string;
  orders: Order[];
  clientsById: Map<string, Client>;
  onAdd: (status: OrderStatus) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

/** Uma coluna do kanban (droppable) — soma o valor dos pedidos que ela contém. */
export function KanbanColumn({
  status,
  title,
  orders,
  clientsById,
  onAdd,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const totalCentavos = orders.reduce((acc, order) => acc + order.valorCentavos, 0);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:w-80 sm:shrink-0">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {orders.length}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{formatCentavos(totalCentavos)}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onAdd(status)} aria-label={`Novo pedido em "${title}"`}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 p-2 transition-colors",
          isOver && "border-primary/50 bg-primary/5",
        )}
      >
        <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              client={order.clientId ? clientsById.get(order.clientId) : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {orders.length === 0 ? (
          <button
            type="button"
            onClick={() => onAdd(status)}
            className="flex flex-1 items-center justify-center rounded-lg py-6 text-xs text-muted-foreground hover:text-foreground"
          >
            Arraste um pedido aqui ou clique para adicionar
          </button>
        ) : null}
      </div>
    </div>
  );
}
