"use client";

import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@/types/entities";

import { ClientFormDialog } from "./ClientFormDialog";
import { ClientsTable } from "./ClientsTable";
import { formValuesToClient } from "./schema";

function matchesSearch(client: Client, termo: string): boolean {
  const alvo = `${client.nome} ${client.empresa ?? ""} ${client.email ?? ""} ${client.whatsapp ?? ""}`.toLowerCase();
  return alvo.includes(termo.toLowerCase());
}

/** Tela de cadastro de clientes: busca, criação, edição e exclusão. */
export function ClientsPage() {
  const { clients, loading, create, update, remove } = useClients();
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [clientEmEdicao, setClientEmEdicao] = useState<Client | undefined>(undefined);
  const [clientParaExcluir, setClientParaExcluir] = useState<Client | undefined>(undefined);

  const clientesFiltrados = useMemo(
    () => clients.filter((client) => matchesSearch(client, busca)),
    [clients, busca],
  );

  function abrirNovo() {
    setClientEmEdicao(undefined);
    setDialogAberto(true);
  }

  function abrirEdicao(client: Client) {
    setClientEmEdicao(client);
    setDialogAberto(true);
  }

  async function salvar(values: Parameters<typeof formValuesToClient>[0]) {
    const data = formValuesToClient(values);
    if (clientEmEdicao) {
      await update(clientEmEdicao.id, data);
    } else {
      await create(data);
    }
  }

  async function confirmarExclusao() {
    if (!clientParaExcluir) return;
    await remove(clientParaExcluir.id);
    setClientParaExcluir(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes para orçamentos."
        actions={
          <Button onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <SearchInput value={busca} onChange={setBusca} placeholder="Pesquisar por nome, empresa, e-mail ou WhatsApp…" />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Cadastre clientes para reutilizar os dados automaticamente nos orçamentos."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Novo cliente
            </Button>
          }
        />
      ) : clientesFiltrados.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum resultado" description={`Nenhum cliente encontrado para "${busca}".`} />
      ) : (
        <ClientsTable clients={clientesFiltrados} onEdit={abrirEdicao} onDelete={setClientParaExcluir} />
      )}

      <ClientFormDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        client={clientEmEdicao}
        onSubmit={salvar}
      />

      <ConfirmDeleteDialog
        open={Boolean(clientParaExcluir)}
        onOpenChange={(open) => !open && setClientParaExcluir(undefined)}
        title={`Excluir "${clientParaExcluir?.nome}"?`}
        description="Orçamentos já salvos que referenciam este cliente não serão afetados, mas ele deixará de aparecer na lista de seleção."
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
