/**
 * Contrato de armazenamento de coleções.
 *
 * Hoje implementado com `localStorage` (ver `localStorageAdapter.ts`).
 * No futuro, para migrar para Supabase/PostgreSQL, basta criar uma nova
 * classe que implemente `StorageAdapter<T>` fazendo chamadas HTTP/SDK —
 * nenhum componente ou hook precisa mudar, pois todos dependem apenas
 * desta interface (via os repositórios em `services/repositories`).
 */
export interface StorageAdapter<T> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(item: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | undefined>;
  remove(id: string): Promise<void>;
  replaceAll(items: T[]): Promise<void>;
}
