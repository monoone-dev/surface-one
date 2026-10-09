import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  EMPTY_GRAPH_SCENE,
  SoneGraphEngine,
  type GraphScene,
  type GraphSceneAnchor,
  type SceneCursor,
} from "@surface-one/angular/graph-layout";

/**
 * The canvas part of `<sone-graph>`: binds a `GraphScene` to the framework-free
 * `SoneGraphEngine`. The engine (and with it `getContext`, `matchMedia` and the
 * observers) is created after the first render, so the directive is SSR-safe.
 * Use it on its own when you build the scene yourself.
 */
@Directive({
  selector: "canvas[soneGraphCanvas]",
  exportAs: "soneGraphCanvas",
  host: {
    "data-slot": "graph-canvas",
    tabindex: "0",
    "[style.cursor]": "cursor()",
    "(pointerdown)": "engine()?.pointerDown($event)",
    "(pointermove)": "engine()?.pointerMove($event)",
    "(pointerup)": "engine()?.pointerUp($event)",
    "(pointercancel)": "engine()?.pointerUp($event)",
    "(pointerleave)": "engine()?.pointerLeave()",
    "(dblclick)": "engine()?.doubleClick($event)",
    "(wheel)": "engine()?.wheel($event)",
    "(keydown)": "engine()?.keydown($event)",
  },
})
export class SoneGraphCanvasDirective {
  /** The positioned nodes, edges, columns and clusters to draw. */
  readonly scene = input<GraphScene>(EMPTY_GRAPH_SCENE);
  /** Tone name → custom property (or `"--a, --b"` fallback chain). */
  readonly tones = input<Readonly<Record<string, string>>>({});
  readonly selectedKey = input<string | null>(null);

  /** The user picked a node with the pointer or keyboard; `null` clears. */
  readonly nodePick = output<string | null>();
  /** Double-click, or Enter on the picked node. */
  readonly nodeOpen = output<string>();
  readonly nodeHover = output<string | null>();
  /** Zoom in percent of the fitted view. */
  readonly zoomChange = output<number>();
  /** Screen position of the hovered (else the picked) node, for a floating card. */
  readonly anchor = output<GraphSceneAnchor | null>();

  protected readonly engine = signal<SoneGraphEngine | null>(null);
  protected readonly cursor = signal<SceneCursor>("grab");

  constructor() {
    const canvas =
      inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const engine = new SoneGraphEngine(canvas, {
        pick: (key) => this.nodePick.emit(key),
        open: (key) => this.nodeOpen.emit(key),
        hover: (key) => this.nodeHover.emit(key),
        zoom: (pct) => this.zoomChange.emit(pct),
        anchor: (a) => this.anchor.emit(a),
        cursor: (c) => this.cursor.set(c),
      });
      destroyRef.onDestroy(() => engine.dispose());
      this.engine.set(engine);
    });

    effect(() => this.engine()?.setScene(this.scene()));
    effect(() => this.engine()?.setTones(this.tones()));
    effect(() => this.engine()?.setSelected(this.selectedKey()));
  }

  zoomBy(factor: number): void {
    this.engine()?.zoomBy(factor);
  }

  /** Glides back to the view that fits every node. */
  fit(): void {
    this.engine()?.fit();
  }
}
