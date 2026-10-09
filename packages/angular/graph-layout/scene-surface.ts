export interface SceneSurfaceHooks {
  paint(now: number): void;
  onResize(): void;
  onTheme(): void;
}

/**
 * The browser plumbing of one canvas: size (ResizeObserver), a single pending
 * animation frame, the device-pixel ratio (capped at 2), reduced motion, the
 * colour scheme, `data-theme` / `data-skin` / `data-accent` on the root, and tab
 * visibility (no frames while hidden). Construct it in the browser only;
 * `dispose()` releases every listener.
 */
export class SceneSurface {
  readonly el: HTMLCanvasElement;
  cssW = 0;
  cssH = 0;

  private readonly hooks: SceneSurfaceHooks;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly doc: Document;
  private readonly win: Window & typeof globalThis;
  private readonly teardown: (() => void)[] = [];
  private rafId: number | null = null;
  private reducedNow: boolean;

  constructor(el: HTMLCanvasElement, hooks: SceneSurfaceHooks) {
    this.el = el;
    this.hooks = hooks;
    this.ctx = el.getContext("2d");
    this.doc = el.ownerDocument;
    this.win = (this.doc.defaultView ?? globalThis) as Window &
      typeof globalThis;

    const media = this.win.matchMedia("(prefers-reduced-motion: reduce)");
    const scheme = this.win.matchMedia("(prefers-color-scheme: light)");
    this.reducedNow = media.matches;

    const onMotion = (): void => {
      this.reducedNow = media.matches;
      this.invalidate();
    };
    const onTheme = (): void => {
      this.hooks.onTheme();
      this.invalidate();
    };
    const onVisibility = (): void => {
      if (!this.doc.hidden) {
        this.invalidate();
      }
    };
    const resize = new ResizeObserver((entries) => {
      const rect = entries[entries.length - 1]?.contentRect;
      if (!rect || rect.width < 2 || rect.height < 2) {
        return;
      }
      this.cssW = rect.width;
      this.cssH = rect.height;
      this.hooks.onResize();
      this.invalidate();
    });
    const skin = new MutationObserver(onTheme);

    media.addEventListener("change", onMotion);
    scheme.addEventListener("change", onTheme);
    this.doc.addEventListener("visibilitychange", onVisibility);
    resize.observe(el);
    skin.observe(this.doc.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-skin", "data-accent"],
    });

    this.teardown.push(
      () => resize.disconnect(),
      () => skin.disconnect(),
      () => media.removeEventListener("change", onMotion),
      () => scheme.removeEventListener("change", onTheme),
      () => this.doc.removeEventListener("visibilitychange", onVisibility),
    );
  }

  get reduced(): boolean {
    return this.reducedNow;
  }

  invalidate(): void {
    if (this.rafId !== null || this.doc.hidden) {
      return;
    }
    this.rafId = this.win.requestAnimationFrame((t) => {
      this.rafId = null;
      this.hooks.paint(t);
    });
  }

  beginFrame(): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
    const ctx = this.ctx;
    const w = this.cssW;
    const h = this.cssH;
    if (!ctx || w < 4 || h < 4 || this.doc.hidden) {
      return null;
    }
    const dpr = Math.min(2, this.win.devicePixelRatio || 1);
    const bw = Math.max(1, Math.round(w * dpr));
    const bh = Math.max(1, Math.round(h * dpr));
    if (this.el.width !== bw || this.el.height !== bh) {
      this.el.width = bw;
      this.el.height = bh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }

  dispose(): void {
    if (this.rafId !== null) {
      this.win.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    for (const release of this.teardown.splice(0)) {
      release();
    }
  }
}
