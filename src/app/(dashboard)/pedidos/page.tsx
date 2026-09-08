import { Suspense } from "react";

import { PedidosPage } from "@/components/pedidos/PedidosPage";

export default function Pedidos() {
  // PedidosPage lê `useSearchParams` (atalho ?novo=1 do Dashboard), que
  // exige um limite de Suspense acima dele para não quebrar o build estático.
  return (
    <Suspense fallback={null}>
      <PedidosPage />
    </Suspense>
  );
}
