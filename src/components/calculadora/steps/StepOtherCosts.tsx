"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId } from "@/lib/id";

/** Etapa 8 — lista livre de outros custos (imã, argola, pintura, etc.). */
export function StepOtherCosts() {
  const { control, register } = useFormContext<CalculatorFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "outrosCustos" });

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum custo extra adicionado. Use para itens como imã, argola ou pintura.
        </p>
      ) : null}

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            {index === 0 ? (
              <label className="text-sm font-medium leading-none">Descrição</label>
            ) : null}
            <Input
              placeholder="Ex: Imã"
              {...register(`outrosCustos.${index}.descricao` as const)}
            />
          </div>
          <div className="w-32 space-y-1.5">
            {index === 0 ? (
              <label className="text-sm font-medium leading-none">Valor</label>
            ) : null}
            <Controller
              control={control}
              name={`outrosCustos.${index}.valor` as const}
              render={({ field: valorField }) => (
                <CurrencyInput value={valorField.value} onChange={valorField.onChange} />
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover item"
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
        onClick={() => append({ id: generateId(), descricao: "", valor: "0,00" })}
      >
        <Plus className="h-4 w-4" />
        Adicionar custo
      </Button>
    </div>
  );
}
