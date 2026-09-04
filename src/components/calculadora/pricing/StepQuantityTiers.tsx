"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/id";

/** Faixas de desconto por quantidade — alimentam a tabela "Preços por quantidade" no resumo. */
export function StepQuantityTiers() {
  const { control } = useFormContext<CalculatorFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "faixasQuantidade" });

  return (
    <div className="space-y-3">
      {fields.length > 0 ? (
        <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 text-xs font-medium text-muted-foreground sm:max-w-sm">
          <span>A partir de</span>
          <span>Desconto</span>
          <span />
        </div>
      ) : null}

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:max-w-sm">
          <Controller
            control={control}
            name={`faixasQuantidade.${index}.quantidade` as const}
            render={({ field: qtyField }) => (
              <SuffixNumberInput suffix="un." step={1} value={qtyField.value} onChange={qtyField.onChange} />
            )}
          />
          <Controller
            control={control}
            name={`faixasQuantidade.${index}.descontoPercentual` as const}
            render={({ field: descField }) => (
              <SuffixNumberInput suffix="%" value={descField.value} onChange={descField.onChange} />
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover faixa"
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
        onClick={() => append({ id: generateId(), quantidade: 10, descontoPercentual: 10 })}
      >
        <Plus className="h-4 w-4" />
        Adicionar faixa
      </Button>
    </div>
  );
}
