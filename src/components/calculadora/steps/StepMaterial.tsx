"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { FieldShell } from "@/components/calculadora/fields/FieldShell";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import type { CalculatorFormValues } from "@/components/calculadora/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMaterials } from "@/hooks/useMaterials";
import { generateId } from "@/lib/id";
import { formatCentavos } from "@/lib/money";

/** Etapa 1 — materiais usados (peça pode combinar mais de um, ex: duas cores) e dados da impressão. */
export function StepMaterial() {
  const { control, register, setValue, formState } = useFormContext<CalculatorFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "materiais" });
  const { materials } = useMaterials();
  const errors = formState.errors;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {fields.map((field, index) => {
          const idPrefix = `material-${index}`;
          const materialErrors = errors.materiais?.[index];

          return (
            <div key={field.id} className="space-y-3 rounded-xl border p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Material {index + 1}
                </span>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover material ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell
                  label="Material cadastrado"
                  htmlFor={`${idPrefix}-materialId`}
                  className="sm:col-span-2"
                >
                  <Controller
                    control={control}
                    name={`materiais.${index}.materialId` as const}
                    render={({ field: materialIdField }) => (
                      <Select
                        value={materialIdField.value}
                        onValueChange={(materialId) => {
                          const material = materials.find((m) => m.id === materialId);
                          if (!material) return;
                          materialIdField.onChange(materialId);
                          setValue(`materiais.${index}.materialNome`, material.nome, {
                            shouldValidate: true,
                          });
                          setValue(
                            `materiais.${index}.filamentoPreco`,
                            (material.precoCentavos / 100).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            }),
                            { shouldValidate: true },
                          );
                          setValue(
                            `materiais.${index}.filamentoPesoRolo`,
                            material.pesoRoloGramas,
                            { shouldValidate: true },
                          );
                        }}
                      >
                        <SelectTrigger id={`${idPrefix}-materialId`} className="w-full">
                          <SelectValue placeholder="Selecionar material cadastrado (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.nome} — {formatCentavos(material.precoCentavos)} /{" "}
                              {material.pesoRoloGramas}g
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecionar preenche preço e peso automaticamente — você ainda pode ajustar os
                    valores.
                  </p>
                </FieldShell>

                <FieldShell
                  label="Material utilizado"
                  htmlFor={`${idPrefix}-materialNome`}
                  error={materialErrors?.materialNome?.message}
                >
                  <Input
                    id={`${idPrefix}-materialNome`}
                    placeholder="Ex: PLA Basic"
                    aria-invalid={Boolean(materialErrors?.materialNome)}
                    {...register(`materiais.${index}.materialNome` as const)}
                  />
                </FieldShell>

                <FieldShell
                  label="Preço pago no rolo"
                  htmlFor={`${idPrefix}-filamentoPreco`}
                  hint="Quanto você pagou neste rolo?"
                  error={materialErrors?.filamentoPreco?.message}
                >
                  <Controller
                    control={control}
                    name={`materiais.${index}.filamentoPreco` as const}
                    render={({ field: precoField }) => (
                      <CurrencyInput
                        id={`${idPrefix}-filamentoPreco`}
                        value={precoField.value}
                        onChange={precoField.onChange}
                      />
                    )}
                  />
                </FieldShell>

                <FieldShell
                  label="Peso do rolo"
                  htmlFor={`${idPrefix}-filamentoPesoRolo`}
                  hint="Peso total do rolo, geralmente 1.000g"
                  error={materialErrors?.filamentoPesoRolo?.message}
                >
                  <Controller
                    control={control}
                    name={`materiais.${index}.filamentoPesoRolo` as const}
                    render={({ field: pesoField }) => (
                      <SuffixNumberInput
                        id={`${idPrefix}-filamentoPesoRolo`}
                        suffix="g"
                        value={pesoField.value}
                        onChange={pesoField.onChange}
                      />
                    )}
                  />
                </FieldShell>

                <FieldShell
                  label="Quantidade utilizada"
                  htmlFor={`${idPrefix}-gramasUtilizadas`}
                  hint="Quantos gramas deste material foram utilizados?"
                  error={materialErrors?.gramasUtilizadas?.message}
                >
                  <Controller
                    control={control}
                    name={`materiais.${index}.gramasUtilizadas` as const}
                    render={({ field: gramasField }) => (
                      <SuffixNumberInput
                        id={`${idPrefix}-gramasUtilizadas`}
                        suffix="g"
                        value={gramasField.value}
                        onChange={gramasField.onChange}
                      />
                    )}
                  />
                </FieldShell>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              id: generateId(),
              materialId: undefined,
              materialNome: "",
              filamentoPreco: "",
              filamentoPesoRolo: 1000,
              gramasUtilizadas: 0,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Adicionar material
        </Button>
        <p className="text-xs text-muted-foreground">
          Use mais de um material quando a peça combinar cores ou filamentos diferentes — o custo
          de cada um entra na soma do filamento.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell
          label="Tempo de impressão"
          htmlFor="tempoImpressaoHoras"
          hint="Duração total da impressão (o lote inteiro, se imprimir várias peças juntas)"
          error={errors.tempoImpressaoMinutos?.message}
        >
          <Controller
            control={control}
            name="tempoImpressaoMinutos"
            render={({ field }) => (
              <SuffixNumberInput
                id="tempoImpressaoHoras"
                suffix="h"
                value={Number.isFinite(field.value) ? field.value / 60 : field.value}
                onChange={(horas) => field.onChange(Number.isFinite(horas) ? horas * 60 : horas)}
              />
            )}
          />
        </FieldShell>

        <FieldShell
          label="Quantidade de peças"
          htmlFor="quantidadePecas"
          hint="Quantas peças saem deste lote/impressão?"
          error={errors.quantidadePecas?.message}
        >
          <Controller
            control={control}
            name="quantidadePecas"
            render={({ field }) => (
              <SuffixNumberInput
                id="quantidadePecas"
                suffix="un."
                step={1}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FieldShell>
      </div>
    </div>
  );
}
