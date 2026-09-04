"use client";

import { Controller, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/** Etapa 3 — depreciação da impressora ao longo da vida útil. */
export function StepDepreciation() {
  const { control, watch, formState } = useFormContext<CalculatorFormValues>();
  const ativa = watch("depreciacaoAtiva");
  const errors = formState.errors;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <div>
          <Label htmlFor="depreciacaoAtiva">Considerar depreciação da impressora</Label>
          <p className="text-xs text-muted-foreground">
            Reserva uma parte do valor da impressora a cada impressão, para trocá-la no futuro.
          </p>
        </div>
        <Controller
          control={control}
          name="depreciacaoAtiva"
          render={({ field }) => (
            <Switch
              id="depreciacaoAtiva"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell
          label="Preço da impressora"
          htmlFor="precoImpressora"
          hint="Quanto custou sua impressora?"
          error={errors.precoImpressora?.message}
        >
          <Controller
            control={control}
            name="precoImpressora"
            render={({ field }) => (
              <CurrencyInput
                id="precoImpressora"
                value={field.value}
                onChange={field.onChange}
                disabled={!ativa}
              />
            )}
          />
        </FieldShell>

        <FieldShell
          label="Vida útil estimada"
          htmlFor="vidaUtilHoras"
          hint="Quantas horas de uso você espera obter dela?"
          error={errors.vidaUtilHoras?.message}
        >
          <Controller
            control={control}
            name="vidaUtilHoras"
            render={({ field }) => (
              <SuffixNumberInput
                id="vidaUtilHoras"
                suffix="h"
                value={field.value}
                onChange={field.onChange}
                disabled={!ativa}
              />
            )}
          />
        </FieldShell>
      </div>
    </div>
  );
}
