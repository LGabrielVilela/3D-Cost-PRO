/**
 * Utilitário de imagem para uploads (logo da empresa, foto do produto).
 *
 * Sempre converte para PNG ou JPEG via canvas, mesmo que o arquivo original
 * seja WEBP — o formato de PDF não embute WEBP nativamente, então salvar já
 * convertido garante que a imagem sempre apareça no PDF. Também redimensiona
 * para manter o tamanho salvo no localStorage sob controle.
 */

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  /** "image/png" preserva transparência (bom para logo); "image/jpeg" é mais leve (bom para fotos). */
  outputType?: "image/png" | "image/jpeg";
  quality?: number;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
    img.src = dataUrl;
  });
}

/** Lê, redimensiona (se necessário) e converte um arquivo de imagem para um data URL PNG/JPEG. */
export async function fileToOptimizedDataUrl(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<string> {
  const { maxWidth = 800, maxHeight = 800, outputType = "image/png", quality = 0.85 } = options;

  const originalDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(originalDataUrl);

  const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return originalDataUrl;

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL(outputType, quality);
}

/** Valida a extensão/tipo aceito antes de processar o upload. */
export function isAcceptedImageFile(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}
