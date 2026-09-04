"use client";

import { Plus, Printer as PrinterIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrinters } from "@/hooks/usePrinters";
import type { Printer } from "@/types/entities";

import { PrinterFormDialog } from "./PrinterFormDialog";
import { PrintersTable } from "./PrintersTable";
import { formValuesToPrinter } from "./schema";

function matchesSearch(printer: Printer, termo: string): boolean {
  const alvo = `${printer.nome} ${printer.marca ?? ""} ${printer.modelo ?? ""}`.toLowerCase();
  return alvo.includes(termo.toLowerCase());
}

/** Tela de cadastro de impressoras: busca, criação, edição e exclusão. */
export function PrintersPage() {
  const { printers, loading, create, update, remove } = usePrinters();
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [printerEmEdicao, setPrinterEmEdicao] = useState<Printer | undefined>(undefined);
  const [printerParaExcluir, setPrinterParaExcluir] = useState<Printer | undefined>(undefined);

  const printersFiltrados = useMemo(
    () => printers.filter((printer) => matchesSearch(printer, busca)),
    [printers, busca],
  );

  const nomesExistentes = useMemo(
    () =>
      printers
        .filter((printer) => printer.id !== printerEmEdicao?.id)
        .map((printer) => printer.nome),
    [printers, printerEmEdicao],
  );

  function abrirNovo() {
    setPrinterEmEdicao(undefined);
    setDialogAberto(true);
  }

  function abrirEdicao(printer: Printer) {
    setPrinterEmEdicao(printer);
    setDialogAberto(true);
  }

  async function salvar(values: Parameters<typeof formValuesToPrinter>[0]) {
    const data = formValuesToPrinter(values);
    if (printerEmEdicao) {
      await update(printerEmEdicao.id, data);
    } else {
      await create(data);
    }
  }

  async function confirmarExclusao() {
    if (!printerParaExcluir) return;
    await remove(printerParaExcluir.id);
    setPrinterParaExcluir(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impressoras"
        description="Cadastro de impressoras para cálculo de energia e depreciação."
        actions={
          <Button onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Nova impressora
          </Button>
        }
      />

      <SearchInput value={busca} onChange={setBusca} placeholder="Pesquisar por nome, marca ou modelo…" />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : printers.length === 0 ? (
        <EmptyState
          icon={PrinterIcon}
          title="Nenhuma impressora cadastrada"
          description="Cadastre suas impressoras para calcular energia e depreciação automaticamente na calculadora."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Nova impressora
            </Button>
          }
        />
      ) : printersFiltrados.length === 0 ? (
        <EmptyState
          icon={PrinterIcon}
          title="Nenhum resultado"
          description={`Nenhuma impressora encontrada para "${busca}".`}
        />
      ) : (
        <PrintersTable printers={printersFiltrados} onEdit={abrirEdicao} onDelete={setPrinterParaExcluir} />
      )}

      <PrinterFormDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        printer={printerEmEdicao}
        existingNames={nomesExistentes}
        onSubmit={salvar}
      />

      <ConfirmDeleteDialog
        open={Boolean(printerParaExcluir)}
        onOpenChange={(open) => !open && setPrinterParaExcluir(undefined)}
        title={`Excluir "${printerParaExcluir?.nome}"?`}
        description="Cálculos já salvos que usam esta impressora não serão afetados, mas ela deixará de aparecer na lista de seleção da calculadora."
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
