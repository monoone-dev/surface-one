import { afterEach } from "vitest";

// The SSR tests run in the node environment: there is no DOM to clean up there.
if (typeof document !== "undefined") {
  const { cleanup } = await import("@testing-library/react");
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });
  // jsdom has no Element#scrollTo (every browser does); the agent logs call it to follow
  // the newest line.
  if (typeof Element.prototype.scrollTo !== "function") {
    Element.prototype.scrollTo = function scrollTo(
      this: Element,
      options?: ScrollToOptions | number,
    ) {
      if (typeof options === "object" && options.top !== undefined) {
        this.scrollTop = options.top;
      }
    } as Element["scrollTo"];
  }
}

// jsdom has no canvas, matchMedia or ResizeObserver (every browser does); the graph canvas
// engine reads them once mounted. The canvas stays blank: getContext returns null.
if (typeof window !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as unknown as HTMLCanvasElement["getContext"];
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
}
