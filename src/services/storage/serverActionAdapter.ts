import type { StorageAdapter } from "./storageAdapter";

/** As 6 Server Actions que um módulo `services/db/*Actions.ts` precisa exportar. */
export interface ServerActionOps<T> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(item: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | undefined>;
  remove(id: string): Promise<void>;
  replaceAll(items: T[]): Promise<void>;
}

/**
 * Implementação de `StorageAdapter` que delega para Server Actions (banco real).
 *
 * Recebe o módulo de ações inteiro (`import * as fooActions from ".../fooActions"`)
 * — cada método aqui só repassa a chamada, então nenhum componente/hook precisa
 * saber que a "coleção" agora vive no Postgres em vez do localStorage.
 */
export class ServerActionAdapter<T> implements StorageAdapter<T> {
  constructor(private readonly ops: ServerActionOps<T>) {}

  list(): Promise<T[]> {
    return this.ops.list();
  }

  getById(id: string): Promise<T | undefined> {
    return this.ops.getById(id);
  }

  create(item: T): Promise<T> {
    return this.ops.create(item);
  }

  update(id: string, patch: Partial<T>): Promise<T | undefined> {
    return this.ops.update(id, patch);
  }

  remove(id: string): Promise<void> {
    return this.ops.remove(id);
  }

  replaceAll(items: T[]): Promise<void> {
    return this.ops.replaceAll(items);
  }
}
