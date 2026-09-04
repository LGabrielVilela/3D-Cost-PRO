"use client";

import { Controller, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import type { CalculatorFormValues } from "@/components/calculadora/schema";

const CAMPOS = [
  { name: "embalagem" as const, label: "Embalagem" },
  { name: "etiqueta" as const, label: "Etiqueta" },
  { name: "adesivo" as const, label: "Adesivo" },
  { name: "protecao" as const, label: "Proteção" },
  { name: "embalagemOutros" as const, label: "Outros" },
];

/** Etapa 7 — custos de embalagem (caixa, etiqueta, adesivo, proteção, outros). */
export function StepPackaging() {
  const { control, formState } = useFormContext<CalculatorFormValues>();
  const errors = formState.errors;

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CAMPOS.map((campo) => (
        <FieldShell key={campo.name} label={campo.label} htmlFor={campo.name} error={errors[campo.name]?.message}>
          <Controller
            control={control}
            name={campo.name}
            render={({ field }) => (
              <CurrencyInput id={campo.name} value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldShell>
      ))}
    </div>
  );
}
