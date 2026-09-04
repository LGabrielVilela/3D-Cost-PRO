import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Desmonta os componentes renderizados após cada teste (evita vazamento entre testes).
afterEach(() => {
  cleanup();
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
