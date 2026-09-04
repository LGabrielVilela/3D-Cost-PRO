import { generateId } from "@/lib/id";
import type { StorageAdapter } from "@/services/storage/storageAdapter";
import type { BaseEntity } from "@/types/entities";

/**
 * Repositório genérico de entidades com `id`/`createdAt`/`updatedAt`.
 * Encapsula o `StorageAdapter` — os hooks/telas nunca falam com o
 * storage diretamente, apenas com repositórios como este.
 */
export class BaseRepository<T extends BaseEntity> {
  constructor(protected readonly adapter: StorageAdapter<T>) {}

  list(): Promise<T[]> {
    return this.adapter.list();
  }

  getById(id: string): Promise<T | undefined> {
    return this.adapter.getById(id);
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const now = new Date().toISOString();
    const entity = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as T;
    return this.adapter.create(entity);
  }

  async update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): Promise<T | undefined> {
    return this.adapter.update(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    } as Partial<T>);
  }

  remove(id: string): Promise<void> {
    return this.adapter.remove(id);
  }

  /** Cria uma entidade já com id/timestamps definidos (uso interno: seed/import). */
  createRaw(entity: T): Promise<T> {
    return this.adapter.create(entity);
  }

  replaceAll(items: T[]): Promise<void> {
    return this.adapter.replaceAll(items);
  }
}
