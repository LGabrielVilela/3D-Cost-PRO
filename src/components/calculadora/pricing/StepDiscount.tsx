"use client";

import { Controller, useFormContext } from "react-hook-form";

import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";

const SUGESTOES = [0, 5, 10, 15, 20];

/** Desconto aplicado sobre o preço de anúncio (ex: negociação com o cliente). */
export function StepDiscount() {
  const { control, setValue, watch, formState } = useFormContext<CalculatorFormValues>();
  const valorAtual = watch("descontoPercentual");
  const errors = formState.errors;

  return (
    <div className="max-w-xs space-y-3">
      <FieldShell
        label="Desconto"
        htmlFor="descontoPercentual"
        hint="Aplicado sobre o preço de anúncio"
        error={errors.descontoPercentual?.message}
      >
        <Controller
          control={control}
          name="descontoPercentual"
          render={({ field }) => (
            <SuffixNumberInput
              id="descontoPercentual"
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
            onClick={() => setValue("descontoPercentual", valor, { shouldValidate: true })}
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
