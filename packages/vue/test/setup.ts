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
