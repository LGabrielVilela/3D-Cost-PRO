/**
 * Utilitários de precisão financeira.
 *
 * REGRA: nunca fazer aritmética monetária em `number` fracionário (ex: 9.9 + 0.1).
 * Internamente todo valor monetário trafega em CENTAVOS (inteiro).
 * A conversão para Real (float) só acontece na hora de EXIBIR.
 */

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Converte um valor em reais (aceita vírgula ou ponto) para centavos (inteiro). */
export function reaisToCentavos(valor: number | string): number {
  if (typeof valor === "string") {
    const normalizado = valor
      .trim()
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "") // remove separador de milhar
      .replace(",", ".");
    const parsed = Number.parseFloat(normalizado);
    valor = Number.isFinite(parsed) ? parsed : 0;
  }
  if (!Number.isFinite(valor)) return 0;
  return Math.round(valor * 100);
}

/** Converte centavos (inteiro) para reais (float) — usar apenas para exibição/inputs. */
export function centavosToReais(centavos: number): number {
  return centavos / 100;
}

/** Formata centavos como moeda BRL: "R$ 32,62". */
export function formatCentavos(centavos: number): string {
  if (!Number.isFinite(centavos)) return BRL_FORMATTER.format(0);
  return BRL_FORMATTER.format(centavosToReais(centavos));
}

/** Formata um número em reais (float) como moeda BRL. */
export function formatReais(valor: number): string {
  if (!Number.isFinite(valor)) return BRL_FORMATTER.format(0);
  return BRL_FORMATTER.format(valor);
}

/** Soma uma lista de valores em centavos com segurança contra NaN/undefined. */
export function sumCentavos(...valores: (number | undefined | null)[]): number {
  return valores.reduce<number>((acc, v) => acc + (Number.isFinite(v) ? (v as number) : 0), 0);
}

/** Multiplica um valor em centavos por um fator decimal, arredondando ao final. */
export function multiplyCentavos(centavos: number, fator: number): number {
  if (!Number.isFinite(centavos) || !Number.isFinite(fator)) return 0;
  return Math.round(centavos * fator);
}

/** Aplica um percentual (0-100) sobre um valor em centavos. */
export function applyPercentual(centavos: number, percentual: number): number {
  return multiplyCentavos(centavos, percentual / 100);
}

/** Garante que um número seja não-negativo (usado em validações de input). */
export function clampNonNegative(valor: number): number {
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

/** Formata um peso em gramas, alternando para kg quando >= 1000g. */
export function formatPeso(gramas: number): string {
  if (!Number.isFinite(gramas)) return "0 g";
  if (Math.abs(gramas) >= 1000) {
    return `${(gramas / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`;
  }
  return `${gramas.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} g`;
}

/** Formata minutos como "Xh Ymin" (ou apenas uma das partes quando aplicável). */
export function formatDuracao(minutos: number): string {
  if (!Number.isFinite(minutos) || minutos <= 0) return "0 min";
  const horas = Math.floor(minutos / 60);
  const restante = Math.round(minutos % 60);
  if (horas === 0) return `${restante} min`;
  if (restante === 0) return `${horas}h`;
  return `${horas}h ${restante}min`;
}

/** Formata um percentual (0-100) com no máximo 2 casas decimais. */
export function formatPercentual(percentual: number): string {
  if (!Number.isFinite(percentual)) return "0%";
  return `${percentual.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}
