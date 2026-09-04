"use client";

import { Controller, useFormContext } from "react-hook-form";

import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";

const SUGESTOES = [5, 10, 15, 20];

/** Etapa 5 — percentual estimado de peças perdidas/falhas. */
export function StepLosses() {
  const { control, setValue, watch, formState } = useFormContext<CalculatorFormValues>();
  const valorAtual = watch("taxaFalhasPercentual");
  const errors = formState.errors;

  return (
    <div className="max-w-xs space-y-3">
      <FieldShell
        label="Taxa de falhas"
        htmlFor="taxaFalhasPercentual"
        hint="Qual percentual de peças costuma falhar ou ser descartado?"
        error={errors.taxaFalhasPercentual?.message}
      >
        <Controller
          control={control}
          name="taxaFalhasPercentual"
          render={({ field }) => (
            <SuffixNumberInput
              id="taxaFalhasPercentual"
              suffix="%"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FieldShell>
      <div className="flex flex-wrap gap-1.5">
        {SUGESTOES.map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => setValue("taxaFalhasPercentual", valor, { shouldValidate: true })}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              valorAtual === valor
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:bg-accent"
            }`}
          >
            {valor}%
          </button>
        ))}
      </div>
    </div>
  );
}
