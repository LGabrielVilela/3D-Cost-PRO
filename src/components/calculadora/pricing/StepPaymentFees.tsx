"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId } from "@/lib/id";

/** Taxas e formas de pagamento (PIX, cartão, marketplaces...). */
export function StepPaymentFees() {
  const { control, register } = useFormContext<CalculatorFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "taxasPagamento" });

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma forma de pagamento cadastrada. Adicione PIX, cartão, marketplaces, etc.
        </p>
      ) : (
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_7rem_7rem_5rem_auto]">
          <span>Forma de pagamento</span>
          <span className="hidden sm:block">Taxa %</span>
          <span className="hidden sm:block">Taxa fixa</span>
          <span className="hidden sm:block">Parcelas</span>
          <span />
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-2 items-center gap-2 rounded-lg border p-2.5 sm:grid-cols-[1fr_7rem_7rem_5rem_auto] sm:border-0 sm:p-0"
        >
          <Input
            placeholder="Ex: Mercado Pago"
            className="col-span-2 sm:col-span-1"
            {...register(`taxasPagamento.${index}.nome` as const)}
          />
          <Controller
            control={control}
            name={`taxasPagamento.${index}.taxaPercentual` as const}
            render={({ field: taxaField }) => (
              <SuffixNumberInput suffix="%" value={taxaField.value} onChange={taxaField.onChange} />
            )}
          />
          <Controller
            control={control}
            name={`taxasPagamento.${index}.taxaFixa` as const}
            render={({ field: fixaField }) => (
              <CurrencyInput value={fixaField.value} onChange={fixaField.onChange} />
            )}
          />
          <Controller
            control={control}
            name={`taxasPagamento.${index}.parcelas` as const}
            render={({ field: parcelasField }) => (
              <SuffixNumberInput
                suffix="x"
                value={parcelasField.value ?? 1}
                onChange={parcelasField.onChange}
                step={1}
              />
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover forma de pagamento"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ id: generateId(), nome: "", taxaPercentual: 0, taxaFixa: "0,00", parcelas: 1 })
        }
      >
        <Plus className="h-4 w-4" />
        Adicionar forma de pagamento
      </Button>
    </div>
  );
}
