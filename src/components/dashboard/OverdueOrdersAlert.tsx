"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { computeOverdueOrders } from "@/lib/dashboardStats";
import type { Order } from "@/types/entities";

interface OverdueOrdersAlertProps {
  orders: Order[];
}

const MAX_LISTADOS = 3;

/** Banner de aviso — só aparece quando há pedidos com entrega atrasada e ainda não finalizados. */
export function OverdueOrdersAlert({ orders }: OverdueOrdersAlertProps) {
  const atrasados = computeOverdueOrders(orders);
  if (atrasados.length === 0) return null;

  const listados = atrasados.slice(0, MAX_LISTADOS);
  const restantes = atrasados.length - listados.length;
  const nomes = listados.map((order) => order.titulo).join(", ");

  return (
    <Alert className="border-warning/40 bg-warning/10 [&_svg]:text-warning-foreground">
      <TriangleAlert />
      <AlertTitle className="text-warning-foreground">
        {atrasados.length === 1 ? "1 pedido atrasado" : `${atrasados.length} pedidos atrasados`}
      </AlertTitle>
      <AlertDescription className="text-warning-foreground/80">
        {nomes}
        {restantes > 0 ? ` e mais ${restantes}` : ""} —{" "}
        <Link href="/pedidos" className="font-medium">
          ver painel de pedidos
        </Link>
      </AlertDescription>
    </Alert>
  );
}
