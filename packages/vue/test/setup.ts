// jsdom has no Element#scrollTo (every browser does); the agent logs (SoneTerminalLog,
// SoneAgentChatLog) scroll their viewport to the newest line when they mount.
if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo(
    this: Element,
    options?: ScrollToOptions | number,
    y?: number,
  ): void {
    const top = typeof options === "number" ? y : options?.top;
    if (typeof top === "number") this.scrollTop = top;
  } as Element["scrollTo"];
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
