import { z } from "zod";

import { centavosToReais, reaisToCentavos } from "@/lib/money";
import type { Order, OrderStatus } from "@/types/entities";

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "agendado", label: "Agendado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "finalizado", label: "Finalizado" },
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  agendado: "Agendado",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
};

/** Sentinela usado no `<Select>` de cliente — Radix não aceita `value=""` num item. */
const NO_CLIENT_VALUE = "none";

export const orderFormSchema = z.object({
  titulo: z.string().min(1, "Informe um título para o pedido"),
  clientId: z.string(),
  descricao: z.string(),
  valor: z.string().refine((v) => reaisToCentavos(v) > 0, "Informe um valor maior que zero"),
  dataEntrega: z.string(),
  status: z.enum(["agendado", "em_andamento", "finalizado"]),
  observacoes: z.string(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export function buildDefaultOrderFormValues(status: OrderStatus = "agendado"): OrderFormValues {
  return {
    titulo: "",
    clientId: NO_CLIENT_VALUE,
    descricao: "",
    valor: "",
    dataEntrega: "",
    status,
    observacoes: "",
  };
}

export function orderToFormValues(order: Order): OrderFormValues {
  return {
    titulo: order.titulo,
    clientId: order.clientId ?? NO_CLIENT_VALUE,
    descricao: order.descricao ?? "",
    valor: centavosToReais(order.valorCentavos)
      .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    dataEntrega: order.dataEntrega ?? "",
    status: order.status,
    observacoes: order.observacoes ?? "",
  };
}

export function formValuesToOrder(
  values: OrderFormValues,
): Omit<Order, "id" | "createdAt" | "updatedAt" | "posicao"> {
  return {
    titulo: values.titulo.trim(),
    clientId: values.clientId === NO_CLIENT_VALUE ? undefined : values.clientId,
    descricao: values.descricao.trim() || undefined,
    valorCentavos: reaisToCentavos(values.valor),
    dataEntrega: values.dataEntrega || undefined,
    status: values.status,
    observacoes: values.observacoes.trim() || undefined,
  };
}

export { NO_CLIENT_VALUE };
