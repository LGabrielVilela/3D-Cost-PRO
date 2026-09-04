"use client";

import { useEntityCollection } from "@/hooks/useEntityCollection";
import { clientsRepository } from "@/services/repositories/clientsRepository";
import type { Client } from "@/types/entities";

/**
 * Coleção de clientes cadastrados — usada tanto pelo orçamento (leitura, para
 * selecionar/carregar automaticamente) quanto pela tela de cadastro (leitura + escrita).
 */
export function useClients() {
  const { items, loading, reload, create, update, remove } =
    useEntityCollection<Client>(clientsRepository);

  return { clients: items, loading, reload, create, update, remove };
}
