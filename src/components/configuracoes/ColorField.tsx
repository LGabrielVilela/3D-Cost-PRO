"use client";

import { Input } from "@/components/ui/input";

interface ColorFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

/** Campo de cor: seletor visual + código hexadecimal editável em texto. */
export function ColorField({ id, value, onChange }: ColorFieldProps) {
  const valido = /^#([0-9a-fA-F]{6})$/.test(value);

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={valido ? value : "#000000"}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="h-8 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
        aria-label="Selecionar cor"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#2563EB"
        className="uppercase"
        aria-labelledby={id}
      />
    </div>
  );
}
