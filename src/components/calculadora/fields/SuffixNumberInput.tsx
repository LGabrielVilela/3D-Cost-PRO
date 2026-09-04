"use client";

import { forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SuffixNumberInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

/** Campo numérico com sufixo de unidade (g, W, min, %, h) alinhado à direita. */
export const SuffixNumberInput = forwardRef<HTMLInputElement, SuffixNumberInputProps>(
  function SuffixNumberInput({ value, onChange, suffix, className, step = "any", ...props }, ref) {
    return (
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          step={step}
          className={cn(suffix && "pr-10", className)}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    );
  },
);
