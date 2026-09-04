"use client";

import { Controller, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrinters } from "@/hooks/usePrinters";

/** Etapa 2 — consumo de energia da impressora. */
export function StepEnergy() {
  const { control, register, setValue, formState } = useFormContext<CalculatorFormValues>();
  const { printers } = usePrinters();
  const errors = formState.errors;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldShell label="Impressora cadastrada" htmlFor="printerId" className="sm:col-span-2">
        <Controller
          control={control}
          name="printerId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(printerId) => {
                const printer = printers.find((p) => p.id === printerId);
                if (!printer) return;
                field.onChange(printerId);
                setValue("printerNome", printer.nome, { shouldValidate: true });
                setValue("consumoWatts", printer.consumoWatts, { shouldValidate: true });
                setValue(
                  "precoImpressora",
                  (printer.precoAquisicaoCentavos / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  }),
                  { shouldValidate: true },
                );
                setValue("vidaUtilHoras", printer.vidaUtilHoras, { shouldValidate: true });
                setValue(
                  "manutencaoPorHora",
                  (printer.manutencaoPorHoraCentavos / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  }),
                  { shouldValidate: true },
                );
              }}
            >
              <SelectTrigger id="printerId" className="w-full">
                <SelectValue placeholder="Selecionar impressora cadastrada (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer.id} value={printer.id}>
                    {printer.nome} — {printer.consumoWatts}W
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Preenche consumo, preço e vida útil automaticamente — ajuste se necessário.
        </p>
      </FieldShell>

      <FieldShell
        label="Impressora utilizada"
        htmlFor="printerNome"
        error={errors.printerNome?.message}
      >
        <Input
          id="printerNome"
          placeholder="Ex: Bambu A1"
          aria-invalid={Boolean(errors.printerNome)}
          {...register("printerNome")}
        />
      </FieldShell>

      <FieldShell
        label="Consumo da impressora"
        htmlFor="consumoWatts"
        hint="Quanto sua impressora consome?"
        error={errors.consumoWatts?.message}
      >
        <Controller
          control={control}
          name="consumoWatts"
          render={({ field }) => (
            <SuffixNumberInput
              id="consumoWatts"
              suffix="W"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FieldShell>

      <FieldShell
        label="Valor do kWh"
        htmlFor="valorKwh"
        hint="Confira o valor na sua conta de energia"
        error={errors.valorKwh?.message}
      >
        <Controller
          control={control}
          name="valorKwh"
          render={({ field }) => (
            <CurrencyInput id="valorKwh" value={field.value} onChange={field.onChange} />
          )}
        />
      </FieldShell>
    </div>
  );
}
