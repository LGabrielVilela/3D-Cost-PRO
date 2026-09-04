import { addDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Data de hoje no formato usado para armazenamento (ISO, apenas a parte da data). */
export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Formata uma data ISO ("2026-09-03") como pt-BR ("03/09/2026"). */
export function formatDateBr(isoDate: string | undefined): string {
  if (!isoDate) return "";
  try {
    return format(parseISO(isoDate), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "";
  }
}

/** Soma dias a uma data ISO, retornando outra data ISO ("apenas data"). */
export function addDaysIso(isoDate: string, dias: number): string {
  return format(addDays(parseISO(isoDate), dias), "yyyy-MM-dd");
}
