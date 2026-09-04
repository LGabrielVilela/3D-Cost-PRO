"use client";

import { AlertTriangle, Copy, Download, FileX, MessageCircle, Pencil, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";
import { formatCentavos } from "@/lib/money";
import { downloadQuotePdf } from "@/pdf/downloadQuotePdf";
import { buildQuotationPublicData } from "@/quotation/buildQuotationPublicData";
import { buildQuoteWhatsappMessage, buildWhatsappUrl } from "@/quotation/whatsappMessage";
import { quotesRepository } from "@/services/repositories/quotesRepository";
import type { Quote } from "@/types/entities";

import { QUOTE_STATUS_OPTIONS } from "./schema";

const QuotePdfPreview = dynamic(
  () => import("@/pdf/QuotePdfPreview").then((mod) => mod.QuotePdfPreview),
  { ssr: false },
);

/** Página de visualização de um orçamento salvo: pré-visualização real + ações. */
export function QuoteViewPage({ id }: { id: string }) {
  const router = useRouter();
  const { clients } = useClients();
  const { settings, loading: loadingSettings } = useSettings();

  const [quote, setQuote] = useState<Quote | undefined | null>(undefined);
  const [pdfState, setPdfState] = useState<"idle" | "gerando" | "erro">("idle");
  const [whatsappAviso, setWhatsappAviso] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [duplicando, setDuplicando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    quotesRepository.getById(id).then((result) => {
      if (!cancelled) setQuote(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const client = clients.find((c) => c.id === quote?.clientId);

  const publicData = useMemo(() => {
    if (!quote || loadingSettings) return null;
    return buildQuotationPublicData(quote, client, settings);
  }, [quote, client, settings, loadingSettings]);

  async function handleStatusChange(status: Quote["status"]) {
    if (!quote) return;
    const updated = await quotesRepository.update(quote.id, { status });
    if (updated) setQuote(updated);
  }

  async function handleGerarPdf() {
    if (!publicData) return;
    setPdfState("gerando");
    try {
      await downloadQuotePdf(publicData);
      setPdfState("idle");
    } catch {
      setPdfState("erro");
      setTimeout(() => setPdfState("idle"), 3000);
    }
  }

  function handleEnviarWhatsapp() {
    if (!publicData) return;
    const mensagem = buildQuoteWhatsappMessage(publicData);
    const url = buildWhatsappUrl(publicData.cliente?.whatsapp, mensagem);
    window.open(url, "_blank", "noopener,noreferrer");
    setWhatsappAviso(true);
  }

  async function handleDuplicar() {
    if (!quote) return;
    setDuplicando(true);
    const duplicado = await quotesRepository.duplicate(quote.id);
    setDuplicando(false);
    if (duplicado) {
      router.push(`/orcamentos/${duplicado.id}/editar`);
    }
  }

  async function handleExcluir() {
    if (!quote) return;
    await quotesRepository.remove(quote.id);
    router.push("/orcamentos");
  }

  if (quote === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[70vh] w-full rounded-xl" />
      </div>
    );
  }

  if (quote === null) {
    return (
      <EmptyState
        icon={FileX}
        title="Orçamento não encontrado"
        description="Esse orçamento pode ter sido excluído."
        action={
          <Button asChild>
            <Link href="/orcamentos">Voltar para orçamentos</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Orçamento #${String(quote.numero).padStart(6, "0")}`}
        description={client ? `${client.nome}${client.empresa ? ` — ${client.empresa}` : ""}` : "Sem cliente vinculado"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={quote.status} onValueChange={(v) => handleStatusChange(v as Quote["status"])}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild variant="outline">
              <Link href={`/orcamentos/${quote.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total do orçamento</p>
          <p className="text-xl font-semibold tabular-nums">{formatCentavos(quote.totalCentavos)}</p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge variant="secondary" className="mt-1">
            {QUOTE_STATUS_OPTIONS.find((o) => o.value === quote.status)?.label}
          </Badge>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Validade</p>
          <p className="text-sm font-medium">{publicData?.validadeFormatada ?? "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleGerarPdf} disabled={!publicData || pdfState === "gerando"}>
          <Download className="h-4 w-4" />
          {pdfState === "gerando" ? "Gerando PDF..." : pdfState === "erro" ? "Erro ao gerar" : "Gerar PDF"}
        </Button>
        <Button variant="outline" onClick={handleDuplicar} disabled={duplicando}>
          <Copy className="h-4 w-4" />
          {duplicando ? "Duplicando..." : "Duplicar"}
        </Button>
        <Button variant="outline" onClick={handleEnviarWhatsapp} disabled={!publicData}>
          <MessageCircle className="h-4 w-4" />
          Enviar pelo WhatsApp
        </Button>
        <Button variant="ghost" onClick={() => setConfirmarExclusao(true)}>
          <Trash2 className="h-4 w-4 text-destructive" />
          Excluir
        </Button>
      </div>

      {whatsappAviso ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/15 px-3 py-2.5 text-sm text-warning-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            O WhatsApp abriu com a mensagem pronta. O navegador não permite anexar o PDF
            automaticamente — baixe o PDF em &ldquo;Gerar PDF&rdquo; e anexe manualmente na conversa.
          </span>
        </div>
      ) : null}

      {publicData ? (
        <div className="h-[75vh] overflow-hidden rounded-xl border shadow-sm">
          <QuotePdfPreview data={publicData} className="h-full w-full" />
        </div>
      ) : (
        <Skeleton className="h-[75vh] w-full rounded-xl" />
      )}

      <ConfirmDeleteDialog
        open={confirmarExclusao}
        onOpenChange={setConfirmarExclusao}
        title={`Excluir orçamento #${String(quote.numero).padStart(6, "0")}?`}
        description="Essa ação não pode ser desfeita."
        onConfirm={handleExcluir}
      />
    </div>
  );
}
