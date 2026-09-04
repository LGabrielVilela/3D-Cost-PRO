"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { useSettings } from "@/hooks/useSettings";
import { downloadQuotePdf } from "@/pdf/downloadQuotePdf";
import { buildQuotationPublicData } from "@/quotation/buildQuotationPublicData";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Quote } from "@/types/entities";

import { QuotesTable } from "./QuotesTable";

function matchesSearch(quote: Quote, clienteNome: string, termo: string): boolean {
  const alvo = `${quote.numero} ${clienteNome} ${quote.descricaoServico}`.toLowerCase();
  return alvo.includes(termo.toLowerCase());
}

/** Tela de gerenciamento de orçamentos: busca, listagem e ações rápidas. */
export function QuotesListPage() {
  const { quotes, loading, remove, reload } = useQuotes();
  const { clients } = useClients();
  const { settings } = useSettings();
  const [busca, setBusca] = useState("");
  const [quoteParaExcluir, setQuoteParaExcluir] = useState<Quote | undefined>(undefined);

  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  const quotesOrdenados = useMemo(
    () => [...quotes].sort((a, b) => b.numero - a.numero),
    [quotes],
  );

  const quotesFiltrados = useMemo(
    () =>
      quotesOrdenados.filter((quote) =>
        matchesSearch(quote, quote.clientId ? clientsById.get(quote.clientId)?.nome ?? "" : "", busca),
      ),
    [quotesOrdenados, clientsById, busca],
  );

  async function handleDuplicate(quote: Quote) {
    await quotesRepository.duplicate(quote.id);
    await reload();
  }

  async function handleGeneratePdf(quote: Quote) {
    const client = quote.clientId ? clientsById.get(quote.clientId) : undefined;
    const publicData = buildQuotationPublicData(quote, client, settings);
    await downloadQuotePdf(publicData);
  }

  async function confirmarExclusao() {
    if (!quoteParaExcluir) return;
    await remove(quoteParaExcluir.id);
    setQuoteParaExcluir(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Gerencie, envie e acompanhe o status dos seus orçamentos."
        actions={
          <Button asChild>
            <Link href="/orcamentos/novo">
              <Plus className="h-4 w-4" />
              Novo orçamento
            </Link>
          </Button>
        }
      />

      <SearchInput value={busca} onChange={setBusca} placeholder="Pesquisar por número, cliente ou descrição…" />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento ainda"
          description="Crie um orçamento a partir da calculadora ou comece um novo por aqui."
          action={
            <Button asChild>
              <Link href="/orcamentos/novo">
                <Plus className="h-4 w-4" />
                Novo orçamento
              </Link>
            </Button>
          }
        />
      ) : quotesFiltrados.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum resultado" description={`Nenhum orçamento encontrado para "${busca}".`} />
      ) : (
        <QuotesTable
          quotes={quotesFiltrados}
          clientsById={clientsById}
          onDuplicate={handleDuplicate}
          onGeneratePdf={handleGeneratePdf}
          onDelete={setQuoteParaExcluir}
        />
      )}

      <ConfirmDeleteDialog
        open={Boolean(quoteParaExcluir)}
        onOpenChange={(open) => !open && setQuoteParaExcluir(undefined)}
        title={`Excluir orçamento #${String(quoteParaExcluir?.numero ?? 0).padStart(6, "0")}?`}
        description="Essa ação não pode ser desfeita."
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
