"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import { CurrencyInput } from "@/components/calculadora/fields/CurrencyInput";
import { SuffixNumberInput } from "@/components/calculadora/fields/SuffixNumberInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCentavos, reaisToCentavos } from "@/lib/money";
import { calculateItemTotal, calculateQuoteTotals } from "@/quotation/quotationCalculator";

import type { QuoteFormValues } from "./schema";

/** Desconto do orçamento — percentual ou valor fixo — com impacto calculado ao vivo. */
export function QuoteDiscountEditor() {
  const { control } = useFormContext<QuoteFormValues>();
  const values = useWatch({ control });

  const itens = (values.itens ?? []).map((item) => ({
    totalCentavos: calculateItemTotal(item?.quantidade ?? 0, reaisToCentavos(item?.precoUnitario ?? "0")),
  }));
  const descontoTipo = values.descontoTipo ?? "percentual";
  const totals = calculateQuoteTotals({
    itens,
    descontoTipo,
    descontoValor:
      descontoTipo === "percentual"
        ? (values.descontoPercentual ?? 0)
        : reaisToCentavos(values.descontoValorFixo ?? "0"),
  });

  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="descontoTipo"
        render={({ field }) => (
          <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2">
            <Label
              htmlFor="desconto-percentual"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value="percentual" id="desconto-percentual" />
              <span className="text-sm font-medium">Percentual</span>
            </Label>
            <Label
              htmlFor="desconto-valorFixo"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value="valorFixo" id="desconto-valorFixo" />
              <span className="text-sm font-medium">Valor fixo</span>
            </Label>
          </RadioGroup>
        )}
      />

      <div className="max-w-xs">
        {descontoTipo === "percentual" ? (
          <Controller
            control={control}
            name="descontoPercentual"
            render={({ field }) => <SuffixNumberInput suffix="%" value={field.value} onChange={field.onChange} />}
          />
        ) : (
          <Controller
            control={control}
            name="descontoValorFixo"
            render={({ field }) => <CurrencyInput value={field.value} onChange={field.onChange} />}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="font-medium tabular-nums">{formatCentavos(totals.subtotalCentavos)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Desconto</p>
          <p className="font-medium tabular-nums text-destructive">
            - {formatCentavos(totals.descontoCentavos)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold tabular-nums">{formatCentavos(totals.totalCentavos)}</p>
        </div>
      </div>
    </div>
  );
}
