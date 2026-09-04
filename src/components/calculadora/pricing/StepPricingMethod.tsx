"use client";

import { Controller, useFormContext } from "react-hook-form";

import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SUGESTOES = [10, 20, 30, 40, 50, 60, 80, 100];

/**
 * Formação do preço: o usuário escolhe explicitamente entre MARKUP (% sobre o
 * custo) e MARGEM (% do preço de venda) — os dois conceitos não são
 * intercambiáveis e o app nunca deve confundi-los.
 */
export function StepPricingMethod() {
  const { control, setValue, watch, formState } = useFormContext<CalculatorFormValues>();
  const metodo = watch("metodoPrecificacao");
  const fieldName = metodo === "margem" ? "margemPercentual" : "markupPercentual";
  const valorAtual = watch(fieldName);
  const errors = formState.errors;

  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="metodoPrecificacao"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Label
              htmlFor="metodo-margem"
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value="margem" id="metodo-margem" className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Margem de lucro</span>
                <span className="block text-xs text-muted-foreground">
                  % do preço de venda que é lucro · preço = custo ÷ (1 − margem)
                </span>
              </span>
            </Label>
            <Label
              htmlFor="metodo-markup"
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value="markup" id="metodo-markup" className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Markup</span>
                <span className="block text-xs text-muted-foreground">
                  % aplicado sobre o custo · preço = custo × (1 + markup)
                </span>
              </span>
            </Label>
          </RadioGroup>
        )}
      />

      <FieldShell
        label={metodo === "margem" ? "Margem de lucro desejada" : "Markup desejado"}
        htmlFor={fieldName}
        hint="Qual margem de lucro você deseja?"
        error={errors[fieldName]?.message}
        className="max-w-xs"
      >
        <Controller
          control={control}
          name={fieldName}
          render={({ field }) => (
            <SuffixNumberInput id={fieldName} suffix="%" value={field.value} onChange={field.onChange} />
          )}
        />
      </FieldShell>

      <div className="flex flex-wrap gap-1.5">
        {SUGESTOES.map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => setValue(fieldName, valor, { shouldValidate: true })}
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
