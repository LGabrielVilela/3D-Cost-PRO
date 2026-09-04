"use client";

import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fileToOptimizedDataUrl, isAcceptedImageFile, type OptimizeImageOptions } from "@/lib/image";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  /** Formato do preview: "square" (logo) ou "wide" (foto do produto). */
  shape?: "square" | "wide";
  optimizeOptions?: OptimizeImageOptions;
  emptyLabel?: string;
}

/**
 * Upload de imagem com pré-visualização, substituição e remoção. Aceita
 * PNG/JPG/JPEG/WEBP e sempre converte para PNG/JPEG (via `fileToOptimizedDataUrl`)
 * para garantir compatibilidade com o gerador de PDF.
 */
export function ImageUploadField({
  value,
  onChange,
  shape = "square",
  optimizeOptions,
  emptyLabel = "Nenhuma imagem selecionada",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | undefined>(undefined);
  const [carregando, setCarregando] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isAcceptedImageFile(file)) {
      setErro("Formato não suportado. Envie um arquivo PNG, JPG, JPEG ou WEBP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 8MB.");
      return;
    }

    setErro(undefined);
    setCarregando(true);
    try {
      const dataUrl = await fileToOptimizedDataUrl(file, optimizeOptions);
      onChange(dataUrl);
    } catch {
      setErro("Não foi possível processar essa imagem.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40",
            shape === "square" ? "h-16 w-16" : "h-20 w-32",
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview de data URL local, não precisa de otimização do Next/Image
            <img src={value} alt="Pré-visualização" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={carregando}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {value ? "Substituir" : "Enviar imagem"}
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                Remover
              </Button>
            ) : null}
          </div>
          {!value && !erro ? <p className="text-xs text-muted-foreground">{emptyLabel}</p> : null}
          {erro ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {erro}
            </p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
