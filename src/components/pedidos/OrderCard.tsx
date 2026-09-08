"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, GripVertical, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateBr } from "@/lib/date";
import { formatCentavos } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Client, Order } from "@/types/entities";

interface OrderCardProps {
  order: Order;
  client?: Client;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

/**
 * Card de um pedido — usado dentro de uma `KanbanColumn`. Arrastável em
 * qualquer ponto do card (exceto título e menu de ações, marcados com
 * `data-no-dnd`) para mover entre colunas ou reordenar.
 */
export function OrderCard({ order, client, onEdit, onDelete }: OrderCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order.id,
    data: { order },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab touch-none border-border/70 shadow-sm transition-shadow active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg",
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="space-y-2.5 px-3 py-3">
        <div className="flex items-start gap-2">
          <GripVertical
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40"
          />

          <button
            type="button"
            data-no-dnd
            onClick={() => onEdit(order)}
            className="min-w-0 flex-1 cursor-pointer text-left text-sm font-medium leading-snug text-foreground hover:underline"
          >
            {order.titulo}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-no-dnd
                className="h-7 w-7 shrink-0 cursor-pointer"
                aria-label={`Ações do pedido "${order.titulo}"`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(order)}>
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(order)}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {order.descricao ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{order.descricao}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {client ? (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {client.nome}
            </span>
          ) : null}
          {order.dataEntrega ? (
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDateBr(order.dataEntrega)}
            </span>
          ) : null}
        </div>

        <Badge variant="secondary" className="font-medium tabular-nums">
          {formatCentavos(order.valorCentavos)}
        </Badge>
      </CardContent>
    </Card>
  );
}
