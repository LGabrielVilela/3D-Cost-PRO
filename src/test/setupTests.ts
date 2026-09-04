import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { LocalStorageAdapter, STORAGE_KEYS } from "@/services/storage/localStorageAdapter";

// Desmonta os componentes renderizados após cada teste (evita vazamento entre testes).
afterEach(() => {
  cleanup();
});

/**
 * Os repositórios (`materialsRepository` etc.) hoje falam com o Postgres via
 * Server Actions (`services/db/*Actions.ts`), que exigem sessão autenticada
 * e uma conexão real com o banco — indisponíveis em teste unitário (jsdom).
 *
 * Para manter os testes existentes funcionando sem reescrevê-los, cada módulo
 * de ações é substituído por uma versão que grava no mesmo `localStorage`
 * usado antes da migração para o banco (mesmas `STORAGE_KEYS`, então testes
 * que leem a chave bruta continuam válidos).
 */
function fakeCollectionActions<T extends { id: string }>(storageKey: string) {
  const adapter = new LocalStorageAdapter<T>(storageKey);
  return {
    list: () => adapter.list(),
    getById: (id: string) => adapter.getById(id),
    create: (item: T) => adapter.create(item),
    update: (id: string, patch: Partial<T>) => adapter.update(id, patch),
    remove: (id: string) => adapter.remove(id),
    replaceAll: (items: T[]) => adapter.replaceAll(items),
  };
}

vi.mock("@/services/db/materialsActions", () => fakeCollectionActions(STORAGE_KEYS.materials));
vi.mock("@/services/db/printersActions", () => fakeCollectionActions(STORAGE_KEYS.printers));
vi.mock("@/services/db/clientsActions", () => fakeCollectionActions(STORAGE_KEYS.clients));
vi.mock("@/services/db/calculationsActions", () => fakeCollectionActions(STORAGE_KEYS.calculations));
vi.mock("@/services/db/quotesActions", () => fakeCollectionActions(STORAGE_KEYS.quotes));

vi.mock("@/services/db/settingsActions", () => {
  function isBrowser() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }
  return {
    getSettings: async () => {
      if (!isBrowser()) return undefined;
      const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
      if (!raw) return undefined;
      try {
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    },
    saveSettings: async (next: unknown) => {
      if (isBrowser()) {
        window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
      }
      return next;
    },
  };
});

/**
 * jsdom não implementa algumas APIs de layout/ponteiro que os componentes
 * Radix (Select, Dialog) usam internamente. Sem esses stubs, interagir com
 * eles em testes lança erros mesmo quando o comportamento não depende de
 * layout real.
 */
if (typeof window !== "undefined") {
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!window.HTMLElement.prototype.releasePointerCapture) {
    window.HTMLElement.prototype.releasePointerCapture = () => {};
  }
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
}
