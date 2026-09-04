"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Printer } from "@/types/entities";

import {
  buildDefaultPrinterFormValues,
  printerFormSchema,
  printerToFormValues,
  type PrinterFormValues,
} from "./schema";

interface PrinterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer?: Printer;
  /** Nomes já cadastrados (exceto o do item em edição) — evita impressoras duplicadas. */
  existingNames: string[];
  onSubmit: (values: PrinterFormValues) => Promise<void>;
}

/** Formulário de criação/edição de impressora, em um Dialog reutilizado nos dois fluxos. */
export function PrinterFormDialog({
  open,
  onOpenChange,
  printer,
  existingNames,
  onSubmit,
}: PrinterFormDialogProps) {
  const isEditing = Boolean(printer);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: buildDefaultPrinterFormValues(),
  });

  useEffect(() => {
    if (open) {
      reset(printer ? printerToFormValues(printer) : buildDefaultPrinterFormValues());
    }
  }, [open, printer, reset]);

  async function onValidSubmit(values: PrinterFormValues) {
    const nomeNormalizado = values.nome.trim().toLowerCase();
    if (existingNames.some((nome) => nome.toLowerCase() === nomeNormalizado)) {
      setError("nome", { message: "Já existe uma impressora cadastrada com esse nome" });
      return;
    }
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar impressora" : "Nova impressora"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Nome" htmlFor="nome" error={errors.nome?.message} className="sm:col-span-2">
              <Input id="nome" placeholder="Ex: Bambu A1" {...register("nome")} />
            </FieldShell>

            <FieldShell label="Marca" htmlFor="marca">
              <Input id="marca" placeholder="Ex: Bambu Lab" {...register("marca")} />
            </FieldShell>

            <FieldShell label="Modelo" htmlFor="modelo">
              <Input id="modelo" {...register("modelo")} />
            </FieldShell>

            <FieldShell
              label="Preço de aquisição"
              htmlFor="precoAquisicao"
              error={errors.precoAquisicao?.message}
            >
              <Controller
                control={control}
                name="precoAquisicao"
                render={({ field }) => (
                  <CurrencyInput id="precoAquisicao" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>

            <FieldShell
              label="Consumo médio"
              htmlFor="consumoWatts"
              error={errors.consumoWatts?.message}
            >
              <Controller
                control={control}
                name="consumoWatts"
                render={({ field }) => (
                  <SuffixNumberInput id="consumoWatts" suffix="W" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>

            <FieldShell
              label="Vida útil estimada"
              htmlFor="vidaUtilHoras"
              error={errors.vidaUtilHoras?.message}
            >
              <Controller
                control={control}
                name="vidaUtilHoras"
                render={({ field }) => (
                  <SuffixNumberInput id="vidaUtilHoras" suffix="h" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>

            <FieldShell
              label="Manutenção por hora"
              htmlFor="manutencaoPorHora"
              error={errors.manutencaoPorHora?.message}
            >
              <Controller
                control={control}
                name="manutencaoPorHora"
                render={({ field }) => (
                  <CurrencyInput id="manutencaoPorHora" value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldShell>

            <FieldShell label="Observações" htmlFor="observacoes" className="sm:col-span-2">
              <Textarea id="observacoes" rows={2} {...register("observacoes")} />
            </FieldShell>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Salvar alterações" : "Adicionar impressora"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
