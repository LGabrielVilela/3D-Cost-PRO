"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId } from "@/lib/id";

import type { QuoteFormValues } from "./schema";

/** Condições de pagamento do orçamento: forma, desconto, parcelamento e observação. */
export function QuotePaymentTermsEditor() {
  const { control, register } = useFormContext<QuoteFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "formasPagamento" });

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma forma de pagamento adicionada. Ex: PIX, Cartão, Boleto.
        </p>
      ) : null}

      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_6rem_1fr_1fr_auto] sm:items-center sm:border-0 sm:p-0">
          <Input
            aria-label="Forma de pagamento"
            placeholder="Ex: PIX"
            {...register(`formasPagamento.${index}.nome` as const)}
          />
          <Controller
            control={control}
            name={`formasPagamento.${index}.descontoPercentual` as const}
            render={({ field: descField }) => (
              <SuffixNumberInput
                aria-label="Desconto"
                suffix="%"
                value={descField.value}
                onChange={descField.onChange}
              />
            )}
          />
          <Input
            aria-label="Parcelamento"
            placeholder="Ex: Até 3x sem juros"
            {...register(`formasPagamento.${index}.parcelamento` as const)}
          />
          <Input
            aria-label="Observação da forma de pagamento"
            placeholder="Observação"
            {...register(`formasPagamento.${index}.observacao` as const)}
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
          append({ id: generateId(), nome: "", descontoPercentual: 0, parcelamento: "", observacao: "" })
        }
      >
        <Plus className="h-4 w-4" />
        Adicionar forma de pagamento
      </Button>
    </div>
  );
}
