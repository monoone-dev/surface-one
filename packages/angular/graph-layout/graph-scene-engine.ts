import {
  EMPTY_GRAPH_SCENE,
  type GraphScene,
  type GraphSceneAnchor,
  type GraphSceneNode,
} from "./graph-scene";
import { keyIndex, linkEnds } from "./graph-layout";
import {
  canvasPoint,
  wheelFocus,
  zoomPanAbout,
  type SceneView,
} from "./scene-camera";
import { mix, rgba, type Rgb } from "./scene-color";
import { traceDisc, traceHull, traceLayerEdge } from "./scene-geometry";
import {
  LabelField,
  boxHitsDisc,
  clipLabel,
  drawPlateText,
  setTracking,
  type LabelBox,
} from "./scene-labels";
import { clamp, easeOutCubic, emptyBounds, growBounds } from "./scene-math";
import { ScenePointer, type SceneCursor } from "./scene-pointer";
import { SceneSurface } from "./scene-surface";
import { readSceneTheme, type SceneTheme } from "./scene-theme";

interface SceneLink {
  a: number;
  b: number;
  weight: number;
  dashed: boolean;
}

/** What the engine reports back; every callback is optional and fires outside any framework. */
export interface SoneGraphEngineEvents {
  /** The user picked a node (pointer or keyboard), or cleared the pick (`null`). */
  pick?(key: string | null): void;
  /** Double-click or Enter on the picked node. */
  open?(key: string): void;
  hover?(key: string | null): void;
  /** Zoom in percent of the fitted view; fires only when it changes. */
  zoom?(percent: number): void;
  /** Screen position of the hovered (else the picked) node; fires only when it changes. */
  anchor?(anchor: GraphSceneAnchor | null): void;
  cursor?(cursor: SceneCursor): void;
}

/** The fallback tone a node with an unknown tone is painted in. */
export const DEFAULT_GRAPH_TONE = "default";

const WEIGHT_BANDS = 4;
const VIEW_MS = 220;
const LAYOUT_MS = 420;
const MAX_SCALE = 6;
const LABEL_FONT_PX = 11;
const LABEL_H = 15;
const LABEL_PAD = 3;
const LABEL_CHARS = 28;
const COLUMN_LABEL_BUDGET = 12;
const FREE_LABEL_BUDGET = 28;
const HULL_PAD = 20;
const DIM = 0.8;
const MAX_FIT_SCALE = 1.15;
const BRIDGE = 0.4;
const DOUBLE_CLICK_MS = 400;
/** The factor one zoom-in step applies; zoom-out is its inverse (0.8). */
export const GRAPH_ZOOM_STEP = 1.25;

/**
 * The framework-free Canvas 2D graph renderer: draws a `GraphScene` (hulls, edges in
 * weight bands, nodes batched by tone, column and cluster titles, collision-free
 * labels), animates the camera and layout changes, and turns pointer, wheel and
 * keyboard events into picks, opens and camera moves. Construct it in the browser
 * once the canvas is in the document; forward the canvas events to its handlers;
 * call `dispose()` when the canvas goes away.
 */
export class SoneGraphEngine {
  private readonly surface: SceneSurface;
  private readonly pointer: ScenePointer;
  private readonly events: SoneGraphEngineEvents;

  private scene: GraphScene = EMPTY_GRAPH_SCENE;
  private tones: Readonly<Record<string, string>> = {};
  private theme: SceneTheme | null = null;

  private nodes: GraphSceneNode[] = [];
  private index = new Map<string, number>();
  private links: SceneLink[] = [];
  private bands: number[][] = [];
  private neighbours: number[][] = [];
  private toneNames: string[] = [];
  private toneOf = new Int32Array(0);

  private wx = new Float64Array(0);
  private wy = new Float64Array(0);
  private fromX = new Float64Array(0);
  private fromY = new Float64Array(0);
  private sx = new Float64Array(0);
  private sy = new Float64Array(0);
  private sr = new Float64Array(0);
  private lit = new Uint8Array(0);

  private layoutStart = -1;
  private layoutPending = false;

  private view: SceneView = { scale: 1, panX: 0, panY: 0 };
  private viewFrom: SceneView = { scale: 1, panX: 0, panY: 0 };
  private viewTo: SceneView | null = null;
  private viewStart = -1;
  private fitScale = 1;
  private fitMode: "none" | "snap" | "glide" = "snap";
  private painted = false;
  private touched = false;

  private lastZoom = -1;
  private lastAnchor = "";

  // Key presses can outrun the host's change detection, so the selection the keyboard
  // steps from is kept here and only reconciled with the host once it catches up.
  private picked: string | null = null;
  private pickedAt = 0;

  constructor(canvas: HTMLCanvasElement, events: SoneGraphEngineEvents = {}) {
    this.events = events;
    this.pointer = new ScenePointer((cursor) => this.events.cursor?.(cursor));
    this.surface = new SceneSurface(canvas, {
      paint: (now) => this.render(now),
      onResize: () => {
        if (!this.touched && this.fitMode === "none") {
          this.fitMode = "snap";
        }
      },
      onTheme: () => {
        this.theme = null;
      },
    });
  }

  setScene(scene: GraphScene): void {
    this.scene = scene;
    this.rebuild(scene);
    const hover = this.pointer.hoverId;
    if (hover !== null && !this.index.has(hover)) {
      this.pointer.setHover(null);
      this.events.hover?.(null);
    }
    this.surface.invalidate();
  }

  /** Tone name → custom property (or fallback chain) the tone is painted with. */
  setTones(tones: Readonly<Record<string, string>>): void {
    this.tones = tones;
    this.theme = null;
    this.surface.invalidate();
  }

  setSelected(key: string | null): void {
    this.picked = key;
    this.surface.invalidate();
  }

  /** Re-reads the tokens on the next frame (after a skin or token change the observers cannot see). */
  refreshTheme(): void {
    this.theme = null;
    this.surface.invalidate();
  }

  zoomBy(factor: number): void {
    const base = this.viewTo ?? this.view;
    const scale = this.clampScale(base.scale * factor);
    const k = scale / base.scale;
    this.touched = true;
    this.glideTo({ scale, panX: base.panX * k, panY: base.panY * k });
  }

  fit(): void {
    this.touched = false;
    this.fitMode = "glide";
    this.surface.invalidate();
  }

  dispose(): void {
    this.surface.dispose();
  }

  pointerDown(event: PointerEvent): void {
    this.pointer.press(event);
  }

  pointerMove(event: PointerEvent): void {
    const drag = this.pointer.drag(event);
    if (drag) {
      if (drag.moved) {
        this.touched = true;
        this.viewTo = null;
        this.view.panX += drag.dx;
        this.view.panY += drag.dy;
        this.surface.invalidate();
      }
      return;
    }
    this.hover(this.hitTest(event.clientX, event.clientY));
  }

  pointerUp(event: PointerEvent): void {
    if (this.pointer.release(event)) {
      const hit = this.hitTest(event.clientX, event.clientY);
      const again = hit !== null && hit === this.picked;
      if (again) {
        if (performance.now() - this.pickedAt > DOUBLE_CLICK_MS) {
          this.pick(null);
        }
      } else if (hit !== null || this.picked !== null) {
        this.pick(hit);
      }
    }
    this.surface.invalidate();
  }

  pointerLeave(): void {
    this.hover(null);
  }

  doubleClick(event: MouseEvent): void {
    const hit = this.hitTest(event.clientX, event.clientY);
    if (hit !== null) {
      this.events.open?.(hit);
    }
  }

  wheel(event: WheelEvent): void {
    event.preventDefault();
    const { ox, oy, step } = wheelFocus(this.surface.el, event);
    const old = this.view.scale;
    const scale = this.clampScale(old * Math.exp(-step));
    const k = scale / old;
    this.touched = true;
    this.viewTo = null;
    this.view = {
      scale,
      panX: zoomPanAbout(ox, this.view.panX, k),
      panY: zoomPanAbout(oy, this.view.panY, k),
    };
    this.surface.invalidate();
  }

  /**
   * Arrows move to the nearest node in that direction, PageUp / PageDown step through
   * every node, Enter picks the first node or opens the picked one, Escape clears the
   * pick, `+` / `-` zoom and `0` fits the view.
   */
  keydown(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowLeft":
        this.stepSelection(event, -1, 0);
        break;
      case "ArrowRight":
        this.stepSelection(event, 1, 0);
        break;
      case "ArrowUp":
        this.stepSelection(event, 0, -1);
        break;
      case "ArrowDown":
        this.stepSelection(event, 0, 1);
        break;
      case "PageDown":
        this.cycleSelection(event, 1);
        break;
      case "PageUp":
        this.cycleSelection(event, -1);
        break;
      case "Enter":
        if (this.picked !== null) {
          event.preventDefault();
          this.events.open?.(this.picked);
        } else if (this.nodes.length > 0) {
          event.preventDefault();
          this.pickByKeyboard(0);
        }
        break;
      case "Escape":
        if (this.picked !== null) {
          event.preventDefault();
          this.pick(null);
        }
        break;
      case "+":
      case "=":
        event.preventDefault();
        this.zoomBy(GRAPH_ZOOM_STEP);
        break;
      case "-":
        event.preventDefault();
        this.zoomBy(1 / GRAPH_ZOOM_STEP);
        break;
      case "0":
        event.preventDefault();
        this.fit();
        break;
    }
  }

  private stepSelection(event: KeyboardEvent, dx: number, dy: number): void {
    if (this.nodes.length === 0) {
      return;
    }
    event.preventDefault();
    const from = this.index.get(this.picked ?? this.pointer.hoverId ?? "");
    if (from === undefined) {
      this.pickByKeyboard(0);
      return;
    }
    let best = -1;
    let bestCost = Infinity;
    for (let j = 0; j < this.nodes.length; j++) {
      if (j === from) {
        continue;
      }
      const vx = this.sx[j] - this.sx[from];
      const vy = this.sy[j] - this.sy[from];
      const along = vx * dx + vy * dy;
      if (along < 1) {
        continue;
      }
      const cost = along + 2.5 * Math.abs(vx * dy - vy * dx);
      if (cost < bestCost) {
        bestCost = cost;
        best = j;
      }
    }
    if (best >= 0) {
      this.pickByKeyboard(best);
    }
  }

  private cycleSelection(event: KeyboardEvent, step: number): void {
    const n = this.nodes.length;
    if (n === 0) {
      return;
    }
    event.preventDefault();
    const from = this.index.get(this.picked ?? "");
    this.pickByKeyboard(from === undefined ? 0 : (from + step + n) % n);
  }

  private pick(key: string | null): void {
    this.picked = key;
    this.pickedAt = performance.now();
    this.events.pick?.(key);
    this.surface.invalidate();
  }

  private pickByKeyboard(i: number): void {
    this.pick(this.nodes[i].key);
    const w = this.surface.cssW;
    const h = this.surface.cssH;
    const base = this.viewTo ?? this.view;
    const x = w / 2 + base.panX + this.nodes[i].x * base.scale;
    const y = h / 2 + base.panY + this.nodes[i].y * base.scale;
    const margin = 72;
    if (x < margin || x > w - margin || y < margin || y > h - margin) {
      this.touched = true;
      this.glideTo({
        scale: base.scale,
        panX: -this.nodes[i].x * base.scale,
        panY: -this.nodes[i].y * base.scale,
      });
    }
  }

  private hover(key: string | null): void {
    if (this.pointer.setHover(key)) {
      this.events.hover?.(key);
      this.surface.invalidate();
    }
  }

  private clampScale(scale: number): number {
    return clamp(
      scale,
      this.fitScale * 0.4,
      Math.max(MAX_SCALE, this.fitScale),
    );
  }

  private glideTo(target: SceneView): void {
    if (this.surface.reduced || !this.painted) {
      this.view = target;
      this.viewTo = null;
    } else {
      this.viewFrom = { ...this.view };
      this.viewTo = target;
      this.viewStart = -1;
    }
    this.surface.invalidate();
  }

  private rebuild(scene: GraphScene): void {
    const previous = new Map<string, [number, number]>();
    for (let i = 0; i < this.nodes.length; i++) {
      previous.set(this.nodes[i].key, [this.wx[i], this.wy[i]]);
    }
    const nodes = scene.nodes;
    const n = nodes.length;
    this.nodes = nodes;
    this.index = keyIndex(nodes);
    const tones = new Map<string, number>();
    this.toneOf = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      const tone = nodes[i].tone;
      let at = tones.get(tone);
      if (at === undefined) {
        at = tones.size;
        tones.set(tone, at);
      }
      this.toneOf[i] = at;
    }
    this.toneNames = [...tones.keys()];
    this.wx = new Float64Array(n);
    this.wy = new Float64Array(n);
    this.fromX = new Float64Array(n);
    this.fromY = new Float64Array(n);
    this.sx = new Float64Array(n);
    this.sy = new Float64Array(n);
    this.sr = new Float64Array(n);
    this.lit = new Uint8Array(n);
    let carried = 0;
    for (let i = 0; i < n; i++) {
      const was = previous.get(nodes[i].key);
      if (was) {
        carried++;
      }
      this.fromX[i] = was ? was[0] : nodes[i].x;
      this.fromY[i] = was ? was[1] : nodes[i].y;
      this.wx[i] = this.fromX[i];
      this.wy[i] = this.fromY[i];
    }
    this.layoutPending = carried > 0 && this.painted && !this.surface.reduced;
    this.layoutStart = -1;
    if (!this.layoutPending) {
      for (let i = 0; i < n; i++) {
        this.wx[i] = nodes[i].x;
        this.wy[i] = nodes[i].y;
      }
    }

    this.links = [];
    this.bands = Array.from({ length: WEIGHT_BANDS * 4 }, () => []);
    this.neighbours = Array.from({ length: n }, () => []);
    for (const e of scene.edges) {
      const ends = linkEnds(this.index, e.a, e.b);
      if (!ends) {
        continue;
      }
      const [a, b] = ends;
      const weight = clamp(e.weight, 0, 1);
      const bridge =
        !scene.layered && scene.nodes[a].group !== scene.nodes[b].group;
      const band =
        Math.min(WEIGHT_BANDS - 1, Math.floor(weight * WEIGHT_BANDS)) +
        (e.dashed ? WEIGHT_BANDS : 0) +
        (bridge ? WEIGHT_BANDS * 2 : 0);
      this.bands[band].push(this.links.length);
      this.links.push({ a, b, weight, dashed: e.dashed });
      this.neighbours[a].push(b);
      this.neighbours[b].push(a);
    }
    this.touched = false;
    this.fitMode = "glide";
  }

  private fitTarget(w: number, h: number): SceneView {
    const nodes = this.nodes;
    if (nodes.length === 0) {
      return { scale: 1, panX: 0, panY: 0 };
    }
    const box = emptyBounds();
    for (const nd of nodes) {
      growBounds(box, nd.x, nd.y, nd.r);
    }
    const { minX, maxX, minY, maxY } = box;
    const layered = this.scene.layered;
    const shrink = clamp(w / 1000, 0.45, 1);
    const left = (layered ? 150 : 56) * shrink;
    const right = (layered ? 190 : 56) * shrink;
    const top = layered ? 96 : 76;
    const bottom = 30;
    const availW = Math.max(40, w - left - right);
    const availH = Math.max(40, h - top - bottom);
    const scale = Math.min(
      MAX_FIT_SCALE,
      availW / Math.max(1, maxX - minX),
      availH / Math.max(1, maxY - minY),
    );
    return {
      scale,
      panX: (left - right) / 2 - ((minX + maxX) / 2) * scale,
      panY: (top - bottom) / 2 - ((minY + maxY) / 2) * scale,
    };
  }

  private advance(now: number, w: number, h: number): boolean {
    if (this.fitMode !== "none") {
      const target = this.fitTarget(w, h);
      this.fitScale = target.scale;
      if (this.fitMode === "snap") {
        this.view = target;
        this.viewTo = null;
      } else {
        this.glideTo(target);
      }
      this.fitMode = "none";
    }
    let animating = false;
    if (this.viewTo) {
      if (this.viewStart < 0) {
        this.viewStart = now;
      }
      const t = (now - this.viewStart) / VIEW_MS;
      if (t >= 1) {
        this.view = this.viewTo;
        this.viewTo = null;
      } else {
        const e = easeOutCubic(t);
        const from = this.viewFrom;
        const to = this.viewTo;
        this.view = {
          scale: from.scale + (to.scale - from.scale) * e,
          panX: from.panX + (to.panX - from.panX) * e,
          panY: from.panY + (to.panY - from.panY) * e,
        };
        animating = true;
      }
    }
    if (this.layoutPending) {
      if (this.layoutStart < 0) {
        this.layoutStart = now;
      }
      const t = (now - this.layoutStart) / LAYOUT_MS;
      const e = easeOutCubic(t);
      for (let i = 0; i < this.nodes.length; i++) {
        this.wx[i] = this.fromX[i] + (this.nodes[i].x - this.fromX[i]) * e;
        this.wy[i] = this.fromY[i] + (this.nodes[i].y - this.fromY[i]) * e;
      }
      if (t >= 1) {
        this.layoutPending = false;
      } else {
        animating = true;
      }
    }
    return animating;
  }

  private settle(): number {
    if (!this.layoutPending || this.layoutStart < 0) {
      return this.layoutPending ? 0 : 1;
    }
    return easeOutCubic((performance.now() - this.layoutStart) / LAYOUT_MS);
  }

  private render(now: number): void {
    const frame = this.surface.beginFrame();
    if (!frame) {
      return;
    }
    const { ctx, w, h } = frame;
    const theme = (this.theme ??= readSceneTheme(this.surface.el, this.tones));
    const scene = this.scene;
    const animating = this.advance(now, w, h);
    const settled = this.settle();
    const { scale, panX, panY } = this.view;
    const ox = w / 2 + panX;
    const oy = h / 2 + panY;
    const grow = clamp(Math.sqrt(scale), 0.55, 1.6);
    for (let i = 0; i < this.nodes.length; i++) {
      this.sx[i] = ox + this.wx[i] * scale;
      this.sy[i] = oy + this.wy[i] * scale;
      this.sr[i] = Math.max(1.5, this.nodes[i].r * grow);
    }

    const hoverKey = this.pointer.hoverId;
    const hover = hoverKey === null ? -1 : (this.index.get(hoverKey) ?? -1);
    const selected =
      this.picked === null ? -1 : (this.index.get(this.picked) ?? -1);
    const focus = selected >= 0 ? selected : hover;
    if (focus >= 0) {
      this.lit.fill(0);
      this.lit[focus] = 1;
      for (const j of this.neighbours[focus]) {
        this.lit[j] = 1;
      }
    }

    this.drawClusters(ctx, theme, scene, ox, oy, scale, settled);
    this.drawEdges(ctx, theme, scene.layered, w, h, scale, focus);
    this.drawNodes(ctx, theme, w, h, focus, hover, selected);
    const field = new LabelField(w, h);
    this.drawColumns(ctx, theme, scene, field, ox, oy, scale, settled);
    this.drawClusterLabels(ctx, theme, scene, field, ox, oy, scale, settled);
    this.drawNodeLabels(ctx, theme, scene.layered, field, w, h, ox, scale, {
      focus,
      hover,
      selected,
    });
    ctx.globalAlpha = 1;

    this.painted = true;
    this.report(w, h, hover >= 0 ? hover : selected, hover >= 0);
    if (animating) {
      this.surface.invalidate();
    }
  }

  private report(w: number, h: number, at: number, hovered: boolean): void {
    const pct = Math.round((this.view.scale / this.fitScale) * 100);
    if (pct !== this.lastZoom) {
      this.lastZoom = pct;
      this.events.zoom?.(pct);
    }
    const next: GraphSceneAnchor | null =
      at < 0
        ? null
        : {
            key: this.nodes[at].key,
            hovered,
            x: Math.round(this.sx[at]),
            y: Math.round(this.sy[at]),
            r: Math.round(this.sr[at]),
            width: Math.round(w),
            height: Math.round(h),
          };
    const stamp = next
      ? `${next.key}|${hovered}|${next.x}|${next.y}|${next.r}|${next.width}|${next.height}`
      : "";
    if (stamp !== this.lastAnchor) {
      this.lastAnchor = stamp;
      this.events.anchor?.(next);
    }
  }

  private drawClusters(
    ctx: CanvasRenderingContext2D,
    theme: SceneTheme,
    scene: GraphScene,
    ox: number,
    oy: number,
    scale: number,
    settled: number,
  ): void {
    if (settled <= 0) {
      return;
    }
    const pad = Math.max(6, HULL_PAD * scale);
    ctx.lineWidth = 1;
    for (const c of scene.clusters) {
      if (c.hull.length < 3) {
        continue;
      }
      ctx.beginPath();
      traceHull(
        ctx,
        c.hull.map(([x, y]): [number, number] => [
          ox + x * scale,
          oy + y * scale,
        ]),
        pad,
      );
      ctx.fillStyle = rgba(theme.ink, 0.03 * settled);
      ctx.fill();
      ctx.strokeStyle = rgba(theme.ink, 0.1 * settled);
      ctx.stroke();
    }
  }

  private traceLink(
    ctx: CanvasRenderingContext2D,
    link: SceneLink,
    layered: boolean,
    w: number,
    h: number,
    scale: number,
  ): void {
    const ax = this.sx[link.a];
    const ay = this.sy[link.a];
    const bx = this.sx[link.b];
    const by = this.sy[link.b];
    if (
      (ax < -40 && bx < -40) ||
      (ax > w + 40 && bx > w + 40) ||
      (ay < -40 && by < -40) ||
      (ay > h + 40 && by > h + 40)
    ) {
      return;
    }
    if (!layered) {
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      return;
    }
    const na = this.nodes[link.a];
    const nb = this.nodes[link.b];
    traceLayerEdge(
      ctx,
      ax,
      ay,
      bx,
      by,
      na.column === nb.column,
      na.side < 0 ? 1 : -1,
      120 * scale + 24,
    );
  }

  private drawEdges(
    ctx: CanvasRenderingContext2D,
    theme: SceneTheme,
    layered: boolean,
    w: number,
    h: number,
    scale: number,
    focus: number,
  ): void {
    const density =
      clamp(Math.sqrt(420 / Math.max(1, this.links.length)), 0.22, 1.5) *
      (theme.dark ? 0.78 : 1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let band = 0; band < this.bands.length; band++) {
      const members = this.bands[band];
      if (members.length === 0) {
        continue;
      }
      const dashed = band % (WEIGHT_BANDS * 2) >= WEIGHT_BANDS;
      const bridge = band >= WEIGHT_BANDS * 2;
      const level = ((band % WEIGHT_BANDS) + 0.5) / WEIGHT_BANDS;
      const alpha = (0.07 + 0.24 * level) * density * (bridge ? BRIDGE : 1);
      ctx.setLineDash(dashed ? [3, 3.5] : []);
      ctx.lineWidth = bridge ? 0.6 : 0.6 + 0.8 * level;
      ctx.strokeStyle = rgba(theme.ink, focus >= 0 ? alpha * 0.28 : alpha);
      ctx.beginPath();
      for (const li of members) {
        const link = this.links[li];
        if (focus >= 0 && (link.a === focus || link.b === focus)) {
          continue;
        }
        this.traceLink(ctx, link, layered, w, h, scale);
      }
      ctx.stroke();
    }
    if (focus >= 0) {
      ctx.strokeStyle = rgba(theme.ink, 0.82);
      for (const link of this.links) {
        if (link.a !== focus && link.b !== focus) {
          continue;
        }
        ctx.setLineDash(link.dashed ? [3, 3.5] : []);
        ctx.lineWidth = 1 + 0.8 * link.weight;
        ctx.beginPath();
        this.traceLink(ctx, link, layered, w, h, scale);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  private drawNodes(
    ctx: CanvasRenderingContext2D,
    theme: SceneTheme,
    w: number,
    h: number,
    focus: number,
    hover: number,
    selected: number,
  ): void {
    const n = this.nodes.length;
    const onScreen = (i: number): boolean =>
      this.sx[i] > -20 &&
      this.sx[i] < w + 20 &&
      this.sy[i] > -20 &&
      this.sy[i] < h + 20;

    ctx.beginPath();
    for (let i = n - 1; i >= 0; i--) {
      if (onScreen(i)) {
        traceDisc(
          ctx,
          this.sx[i],
          this.sy[i],
          this.sr[i] + 1.5,
          this.nodes[i].shape === "square",
        );
      }
    }
    ctx.fillStyle = rgba(theme.plot, 1);
    ctx.fill();

    const fallback: Rgb = theme.tones[DEFAULT_GRAPH_TONE] ?? theme.ink;
    for (let tone = 0; tone < this.toneNames.length; tone++) {
      const color = theme.tones[this.toneNames[tone]] ?? fallback;
      for (const dimmed of [true, false]) {
        if (dimmed && focus < 0) {
          continue;
        }
        ctx.beginPath();
        let any = false;
        for (let i = n - 1; i >= 0; i--) {
          const nd = this.nodes[i];
          if (
            this.toneOf[i] !== tone ||
            !onScreen(i) ||
            (focus >= 0 && (this.lit[i] === 0) !== dimmed)
          ) {
            continue;
          }
          traceDisc(
            ctx,
            this.sx[i],
            this.sy[i],
            this.sr[i],
            nd.shape === "square",
          );
          any = true;
        }
        if (any) {
          ctx.fillStyle = rgba(dimmed ? mix(color, theme.plot, DIM) : color, 1);
          ctx.fill();
        }
      }
    }

    for (const i of new Set([selected, hover])) {
      if (i < 0) {
        continue;
      }
      ctx.beginPath();
      traceDisc(
        ctx,
        this.sx[i],
        this.sy[i],
        this.sr[i] + 4,
        this.nodes[i].shape === "square",
      );
      ctx.strokeStyle = rgba(theme.ink, 0.92);
      ctx.lineWidth = i === selected ? 1.75 : 1.1;
      ctx.stroke();
    }
  }

  private drawColumns(
    ctx: CanvasRenderingContext2D,
    theme: SceneTheme,
    scene: GraphScene,
    field: LabelField,
    ox: number,
    oy: number,
    scale: number,
    settled: number,
  ): void {
    if (scene.columns.length === 0 || settled <= 0) {
      return;
    }
    let top = Infinity;
    for (const c of scene.columns) {
      top = Math.min(top, c.top);
    }
    const y = Math.max(64, oy + top * scale - 30);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.globalAlpha = settled;
    for (const c of scene.columns) {
      const title = c.label.toUpperCase();
      ctx.font = `600 10px ${theme.font}`;
      setTracking(ctx, "0.08em");
      const tw = ctx.measureText(title).width;
      const x = ox + c.x * scale;
      const box: LabelBox = { x: x - tw / 2 - 6, y: y - 9, w: tw + 12, h: 30 };
      field.claim(box);
      ctx.fillStyle = rgba(theme.plot, 0.88);
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.fillStyle = rgba(theme.muted, 1);
      ctx.fillText(title, x - tw / 2, y);
      setTracking(ctx, "0px");
      ctx.font = `500 10px ${theme.font}`;
      const count = String(c.count);
      ctx.fillStyle = rgba(theme.muted, 0.8);
      ctx.fillText(count, x - ctx.measureText(count).width / 2, y + 13);
    }
    ctx.globalAlpha = 1;
  }

  private drawClusterLabels(
    ctx: CanvasRenderingContext2D,
    theme: SceneTheme,
    scene: GraphScene,
    field: LabelField,
    ox: number,
    oy: number,
    scale: number,
    settled: number,
  ): void {
    if (settled <= 0) {
      return;
    }
    const pad = Math.max(6, HULL_PAD * scale);
    ctx.font = `600 10px ${theme.font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.globalAlpha = settled;
    setTracking(ctx, "0.06em");
    for (const c of scene.clusters) {
      if (!c.label) {
        continue;
      }
      const text = c.label.toUpperCase();
      const tw = ctx.measureText(text).width;
      const box: LabelBox = {
        x: ox + c.cx * scale - tw / 2 - 4,
        y: oy + c.top * scale - (c.hull.length >= 3 ? pad : 4) - 19,
        w: tw + 8,
        h: 16,
      };
      if (!field.fits(box)) {
        continue;
      }
      field.claim(box);
      drawPlateText(ctx, text, box, 4, theme.plot, rgba(theme.muted, 1));
    }
    setTracking(ctx, "0px");
    ctx.globalAlpha = 1;
  }

  private drawNodeLabels(
    ctx: CanvasRenderingContext2D,
    theme: SceneTheme,
    layered: boolean,
    field: LabelField,
    w: number,
    h: number,
    ox: number,
    scale: number,
    state: { focus: number; hover: number; selected: number },
  ): void {
    const n = this.nodes.length;
    if (n === 0) {
      return;
    }
    const zoomed = clamp(scale / this.fitScale, 1, 4);
    const budget = layered
      ? Math.round(COLUMN_LABEL_BUDGET * zoomed)
      : Math.round(FREE_LABEL_BUDGET * Math.pow(zoomed, 1.4));
    const spent = new Map<number, number>();
    const visible: number[] = [];
    for (let i = 0; i < n; i++) {
      if (
        this.sx[i] > -8 &&
        this.sx[i] < w + 8 &&
        this.sy[i] > -8 &&
        this.sy[i] < h + 8
      ) {
        visible.push(i);
      }
    }
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    const place = (i: number, tier: "hot" | "lit" | "plain"): boolean => {
      const nd = this.nodes[i];
      const text = clipLabel(nd.label, LABEL_CHARS);
      ctx.font = `${tier === "hot" ? 600 : 500} ${LABEL_FONT_PX}px ${theme.font}`;
      const tw = ctx.measureText(text).width;
      const bw = tw + LABEL_PAD * 2;
      const gap = this.sr[i] + 5;
      const x = this.sx[i];
      const y = this.sy[i];
      const spots: [number, number][] =
        nd.side !== 0
          ? [
              [
                nd.side > 0
                  ? Math.max(x, ox + nd.labelX * scale) + gap
                  : Math.min(x, ox + nd.labelX * scale) - gap - bw,
                y - LABEL_H / 2,
              ],
            ]
          : [
              [x + gap, y - LABEL_H / 2],
              [x - gap - bw, y - LABEL_H / 2],
              [x - bw / 2, y + gap],
              [x - bw / 2, y - gap - LABEL_H],
            ];
      for (const [bx, by] of spots) {
        const box: LabelBox = { x: bx, y: by, w: bw, h: LABEL_H };
        if (!field.fits(box)) {
          continue;
        }
        if (
          nd.side === 0 &&
          tier !== "hot" &&
          this.coversNode(box, i, visible)
        ) {
          continue;
        }
        field.claim(box);
        const dimmed = state.focus >= 0 && this.lit[i] === 0;
        drawPlateText(
          ctx,
          text,
          box,
          LABEL_PAD,
          theme.plot,
          dimmed
            ? rgba(theme.muted, 0.6)
            : tier === "plain"
              ? rgba(mix(theme.ink, theme.muted, 0.3), 1)
              : rgba(theme.ink, 1),
        );
        return true;
      }
      return false;
    };

    const done = new Uint8Array(n);
    for (const i of [state.hover, state.selected]) {
      if (i >= 0 && !done[i]) {
        done[i] = 1;
        place(i, "hot");
      }
    }
    if (state.focus >= 0) {
      for (const i of visible) {
        if (this.lit[i] && !done[i]) {
          done[i] = 1;
          place(i, "lit");
        }
      }
    }
    const tried = new Map<number, number>();
    for (const i of visible) {
      if (done[i]) {
        continue;
      }
      const column = layered ? this.nodes[i].column : 0;
      const taken = spent.get(column) ?? 0;
      const attempts = tried.get(column) ?? 0;
      if (taken >= budget || attempts >= budget * 3) {
        continue;
      }
      tried.set(column, attempts + 1);
      if (place(i, "plain")) {
        spent.set(column, taken + 1);
      }
    }
  }

  private coversNode(box: LabelBox, self: number, visible: number[]): boolean {
    for (const j of visible) {
      if (
        j !== self &&
        boxHitsDisc(box, this.sx[j], this.sy[j], this.sr[j] + 1)
      ) {
        return true;
      }
    }
    return false;
  }

  private hitTest(clientX: number, clientY: number): string | null {
    const [px, py] = canvasPoint(this.surface.el, clientX, clientY);
    let best = -1;
    let bestD2 = Infinity;
    for (let i = 0; i < this.nodes.length; i++) {
      const reach = Math.max(this.sr[i], 7) + 3;
      const dx = px - this.sx[i];
      const dy = py - this.sy[i];
      const d2 = dx * dx + dy * dy;
      if (d2 <= reach * reach && d2 < bestD2) {
        bestD2 = d2;
        best = i;
      }
    }
    return best < 0 ? null : this.nodes[best].key;
  }
}
