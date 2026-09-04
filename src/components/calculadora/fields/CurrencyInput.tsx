"use client";

import { forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

/** Campo de dinheiro no formato pt-BR ("R$ 99,90") — mantém o valor como string com vírgula. */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, className, placeholder = "0,00", ...props }, ref) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
          R$
        </span>
        <Input
          ref={ref}
          inputMode="decimal"
          placeholder={placeholder}
          className={cn("pl-9", className)}
          value={value}
          onChange={(e) => {
            const digitsAndComma = e.target.value.replace(/[^0-9,]/g, "");
            const [inteiro, ...resto] = digitsAndComma.split(",");
            const cleaned = resto.length > 0 ? `${inteiro},${resto.join("")}` : inteiro;
            onChange(cleaned);
          }}
          {...props}
        />
      </div>
    );
  },
);
