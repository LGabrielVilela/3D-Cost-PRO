"use client";

import { Controller, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/** Etapa 4 — custo de manutenção da impressora (peças, lubrificação, etc.). */
export function StepMaintenance() {
  const { control, watch, formState } = useFormContext<CalculatorFormValues>();
  const metodo = watch("manutencaoMetodo");
  const errors = formState.errors;

  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="manutencaoMetodo"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Label
              htmlFor="manutencao-percentual"
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value="percentual" id="manutencao-percentual" className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Percentual sobre a produção</span>
                <span className="block text-xs text-muted-foreground">
                  Ex: 5% do custo de filamento + energia + depreciação
                </span>
              </span>
            </Label>
            <Label
              htmlFor="manutencao-porHora"
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value="porHora" id="manutencao-porHora" className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Valor fixo por hora</span>
                <span className="block text-xs text-muted-foreground">
                  Ex: R$ 0,20 por hora de impressão
                </span>
              </span>
            </Label>
          </RadioGroup>
        )}
      />

      {metodo === "percentual" ? (
        <FieldShell
          label="Percentual de manutenção"
          htmlFor="manutencaoPercentual"
          hint="Percentual aplicado sobre filamento + energia + depreciação"
          error={errors.manutencaoPercentual?.message}
          className="max-w-xs"
        >
          <Controller
            control={control}
            name="manutencaoPercentual"
            render={({ field }) => (
              <SuffixNumberInput
                id="manutencaoPercentual"
                suffix="%"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FieldShell>
      ) : (
        <FieldShell
          label="Custo de manutenção por hora"
          htmlFor="manutencaoPorHora"
          error={errors.manutencaoPorHora?.message}
          className="max-w-xs"
        >
          <Controller
            control={control}
            name="manutencaoPorHora"
            render={({ field }) => (
              <CurrencyInput id="manutencaoPorHora" value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldShell>
      )}
    </div>
  );
}
