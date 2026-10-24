// Runs before every component test file (`npm run test:angular-components`). The built-in
// strings use `$localize`, which an app loads as a polyfill (`@angular/localize/init`); the
// unit-test builder takes no polyfills for a library, so the global is installed here.
import { ɵ$localize } from "@angular/localize";

(globalThis as { $localize?: unknown }).$localize = ɵ$localize;

// jsdom lays nothing out, so every element has no boxes and nothing counts as tabbable
// (`isTabbable` reads `getClientRects()`). Give a connected element outside `[hidden]` and
// `display: none` one box, the way a browser would.
const rect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  top: 0,
  left: 0,
  right: 1,
  bottom: 1,
};
Element.prototype.getClientRects = function getClientRects(this: Element) {
  const shown =
    this.isConnected &&
    !this.closest("[hidden]") &&
    getComputedStyle(this).display !== "none";
  const list = shown ? [{ ...rect, toJSON: () => rect }] : [];
  return Object.assign(list, {
    item: (i: number) => list[i] ?? null,
  }) as unknown as DOMRectList;
};

// jsdom has no Element#scrollIntoView, matchMedia or ResizeObserver (every browser does).
Element.prototype.scrollIntoView ??= function scrollIntoView(): void {};
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
globalThis.ResizeObserver ??= class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};
