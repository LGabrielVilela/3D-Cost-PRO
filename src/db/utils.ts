import "server-only";

/**
 * Colunas opcionais do schema Drizzle voltam como `null` quando vazias, mas
 * os tipos de `src/types/entities.ts` usam `undefined` (convenção do
 * `LocalStorageAdapter` original). Normaliza `null -> undefined` ao ler.
 */
export function normalizeRow<T>(row: Record<string, unknown> | undefined): T | undefined {
  if (!row) return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key] = value === null ? undefined : value;
  }
  return result as T;
}

export function normalizeRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => normalizeRow<T>(row) as T);
}
