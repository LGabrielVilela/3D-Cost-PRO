import type { StorageAdapter } from "./storageAdapter";

type WithId = { id: string };

/**
 * Implementação de `StorageAdapter` baseada em `localStorage`.
 *
 * Guarda uma coleção inteira sob uma única chave, serializada em JSON.
 * Segura para SSR (Next.js): todo acesso a `window`/`localStorage` é
 * protegido, retornando coleção vazia no servidor.
 */
export class LocalStorageAdapter<T extends WithId> implements StorageAdapter<T> {
  constructor(private readonly storageKey: string) {}

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private readAll(): T[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  private writeAll(items: T[]): void {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async list(): Promise<T[]> {
    return this.readAll();
  }

  async getById(id: string): Promise<T | undefined> {
    return this.readAll().find((item) => item.id === id);
  }

  async create(item: T): Promise<T> {
    const items = this.readAll();
    items.push(item);
    this.writeAll(items);
    return item;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const items = this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    const updated = { ...items[index], ...patch } as T;
    items[index] = updated;
    this.writeAll(items);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const items = this.readAll().filter((item) => item.id !== id);
    this.writeAll(items);
  }

  async replaceAll(items: T[]): Promise<void> {
    this.writeAll(items);
  }
}

/** Namespace único das chaves de storage do app — evita colisão com outros apps. */
export const STORAGE_KEYS = {
  materials: "3dcp:materials",
  printers: "3dcp:printers",
  clients: "3dcp:clients",
  calculations: "3dcp:calculations",
  quotes: "3dcp:quotes",
  settings: "3dcp:settings",
  seedVersion: "3dcp:seed-version",
} as const;
