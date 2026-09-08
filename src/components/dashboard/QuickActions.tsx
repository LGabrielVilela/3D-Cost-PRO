import Link from "next/link";
import { FilePlus2, PackagePlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Botões de atalho para as ações mais frequentes do sistema. */
export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm">
        <Link href="/calculadora">
          <Plus className="h-4 w-4" />
          Novo cálculo
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href="/orcamentos/novo">
          <FilePlus2 className="h-4 w-4" />
          Novo orçamento
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        {/* `?novo=1` abre o painel já com o diálogo de criação — ver PedidosPage. */}
        <Link href="/pedidos?novo=1">
          <PackagePlus className="h-4 w-4" />
          Novo pedido
        </Link>
      </Button>
    </div>
  );
}
