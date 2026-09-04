"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateId } from "@/lib/id";
import { formatCentavos, reaisToCentavos } from "@/lib/money";
import { calculateItemTotal } from "@/quotation/quotationCalculator";

import type { QuoteFormValues } from "./schema";

/** Editor de itens do orçamento (produto/serviço) — um ou vários, com total calculado ao vivo. */
export function QuoteItemsEditor() {
  const { control, register, formState } = useFormContext<QuoteFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itens = useWatch({ control, name: "itens" });
  const errosItens = formState.errors.itens;
  const erroGeral = errosItens && !Array.isArray(errosItens) ? errosItens.message : undefined;

  return (
    <div className="space-y-4">
      {erroGeral ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {erroGeral}
        </p>
      ) : null}

      {fields.map((field, index) => {
        const item = itens?.[index];
        const totalCentavos = item
          ? calculateItemTotal(item.quantidade, reaisToCentavos(item.precoUnitario))
          : 0;
        const itemErrors = Array.isArray(errosItens) ? errosItens[index] : undefined;
        const idPrefix = `item-${index}`;

        return (
          <div key={field.id} className="space-y-3 rounded-xl border p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
              {fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover item ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                <Label htmlFor={`${idPrefix}-descricao`}>Descrição</Label>
                <Input
                  id={`${idPrefix}-descricao`}
                  placeholder="Ex: Chaveiro personalizado abridor de lata"
                  aria-invalid={Boolean(itemErrors?.descricao)}
                  {...register(`itens.${index}.descricao` as const)}
                />
                {itemErrors?.descricao ? (
                  <p className="text-xs font-medium text-destructive">{itemErrors.descricao.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-material`}>Material</Label>
                <Input
                  id={`${idPrefix}-material`}
                  placeholder="Ex: PLA"
                  {...register(`itens.${index}.material` as const)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-cor`}>Cor</Label>
                <Input id={`${idPrefix}-cor`} placeholder="Ex: Preto" {...register(`itens.${index}.cor` as const)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-quantidade`}>Quantidade</Label>
                <Controller
                  control={control}
                  name={`itens.${index}.quantidade` as const}
                  render={({ field: qtyField }) => (
                    <SuffixNumberInput
                      id={`${idPrefix}-quantidade`}
                      suffix="un."
                      step={1}
                      value={qtyField.value}
                      onChange={qtyField.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-precoUnitario`}>Preço unitário</Label>
                <Controller
                  control={control}
                  name={`itens.${index}.precoUnitario` as const}
                  render={({ field: precoField }) => (
                    <CurrencyInput
                      id={`${idPrefix}-precoUnitario`}
                      value={precoField.value}
                      onChange={precoField.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total do item</span>
              <span className="font-semibold tabular-nums">{formatCentavos(totalCentavos)}</span>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ id: generateId(), descricao: "", material: "", cor: "", quantidade: 1, precoUnitario: "0,00" })
        }
      >
        <Plus className="h-4 w-4" />
        Adicionar item
      </Button>
    </div>
  );
}
