import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  contentChild,
  effect,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { plural } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  EMPTY_GRAPH_SCENE,
  GRAPH_ZOOM_STEP,
  clipLabel,
  keyIndex,
  linkEnds,
  runGraphLayout,
  toneCss,
  type GraphLayout,
  type GraphLayoutRequest,
  type GraphScene,
  type GraphSceneAnchor,
  type GraphSceneEdge,
} from "@surface-one/angular/graph-layout";
import { SoneGraphCanvasDirective } from "./graph-canvas.directive";
import { SoneGraphCardComponent } from "./graph-card/graph-card.component";
import { SoneGraphControlsComponent } from "./graph-controls/graph-controls.component";
import {
  SoneGraphCardTemplateDirective,
  type SoneGraphCardContext,
} from "./graph-slots.directive";
import {
  SONE_GRAPH_TONES,
  type SoneGraphCluster,
  type SoneGraphData,
  type SoneGraphLabels,
  type SoneGraphLayout,
  type SoneGraphLayoutStrategy,
  type SoneGraphNode,
  type SoneGraphNodeInfo,
  type SoneGraphSizing,
  type SoneGraphTones,
} from "./graph.types";

const DEFAULT_SIZING: SoneGraphSizing = { minR: 3.5, maxR: 10 };
const CLUSTER_LABEL_MIN = 5;

const linkCount = (n: number): string =>
  plural(n, $localize`{count, plural, =1 {1 link} other {# links}}`);
const nodeCount = (n: number): string =>
  plural(n, $localize`{count, plural, =1 {1 node} other {# nodes}}`);

/** Unlinked block → "Unlinked · n"; a community of five or more → "<largest node> · n". */
export function soneGraphClusterLabel(cluster: SoneGraphCluster): string {
  if (!cluster.anchor) {
    return $localize`Unlinked · ${cluster.count}:count:`;
  }
  return cluster.count >= CLUSTER_LABEL_MIN
    ? `${clipLabel(cluster.anchor.label, 24)} · ${cluster.count}`
    : "";
}

/** "3 links". */
export function soneGraphDescribe(
  _node: SoneGraphNode,
  info: SoneGraphNodeInfo,
): string {
  return linkCount(info.degree);
}

const DEFAULT_LABELS: SoneGraphLabels = {
  roleDescription: $localize`network diagram`,
  controls: $localize`Graph controls`,
  fit: $localize`:verb|Button that fits the graph to the view:Fit`,
  fitLabel: $localize`Fit graph to view`,
  zoomIn: $localize`Zoom in`,
  zoomOut: $localize`Zoom out`,
  list: $localize`:Button that shows the graph nodes as a list:List`,
  listLabel: $localize`Show nodes as a list`,
  open: $localize`:verb|Button that opens the selected graph node:Open`,
  selectionCleared: $localize`Selection cleared.`,
  instructions: $localize`Arrow keys move to the nearest node, Page Up and Page Down step through all of them, Enter opens the selected one, Escape clears the selection. Plus and minus zoom, 0 fits the view.`,
  empty: $localize`Graph — empty.`,
};

interface Prepared {
  nodes: SoneGraphNode[];
  index: Map<string, number>;
  edges: GraphSceneEdge[];
  degree: Int32Array;
}

interface LaidOut {
  prepared: Prepared;
  request: GraphLayoutRequest;
  layout: GraphLayout;
}

interface CardModel {
  id: string;
  anchor: GraphSceneAnchor | null;
  heading: string;
  meta: string;
  tone: string;
  square: boolean;
  context: SoneGraphCardContext;
}

let nextGraphId = 0;

/**
 * An interactive network diagram on a Canvas 2D: `force`, `clusters` (communities
 * with hulls) or `layers` (one column per `layer`) layouts; drag to pan, wheel to zoom
 * at the cursor, click to select and highlight the neighbourhood, double-click or
 * Enter to open; full keyboard support with spoken selections, an optional node
 * list, and colours read from the theme tokens.
 */
@Component({
  selector: "sone-graph",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneButtonDirective,
    SoneGraphCanvasDirective,
    SoneGraphCardComponent,
    SoneGraphControlsComponent,
  ],
  templateUrl: "./graph.component.html",
  styleUrl: "./graph.component.scss",
  host: {
    "data-slot": "graph",
    "[attr.data-state]": "state()",
    "[attr.data-layout]": "layout()",
  },
})
export class SoneGraphComponent {
  readonly data = input<SoneGraphData | null>(null);
  readonly layout = input<SoneGraphLayout>("force");
  /** Extra or overriding tones: tone name → custom property, or a `"--a, --b"` fallback chain. */
  readonly tones = input<SoneGraphTones>({});
  /** The radius range node sizes are mapped onto. */
  readonly sizing = input<SoneGraphSizing>(DEFAULT_SIZING);
  /** Column titles of the `layers` layout, by `layer`. */
  readonly layerLabels = input<Readonly<Record<number, string>>>({});
  /** The title of a `clusters` community; return `""` for none. */
  readonly clusterLabel = input<(cluster: SoneGraphCluster) => string>(
    soneGraphClusterLabel,
  );
  /** The meta line of a node's card, its list entry and its announcement. */
  readonly describe =
    input<(node: SoneGraphNode, info: SoneGraphNodeInfo) => string>(
      soneGraphDescribe,
    );
  /** The canvas's accessible name; defaults to the node and link counts. */
  readonly label = input<string | null>(null);
  /** The counts in the controls panel; `""` hides them. */
  readonly summary = input<string | null>(null);
  readonly labels = input<Partial<SoneGraphLabels>>({});
  /** Computes the layout elsewhere (a Web Worker); `null` lays out on the main thread. */
  readonly layoutStrategy = input<SoneGraphLayoutStrategy | null>(null);
  /** Shows the List button in the controls. */
  readonly listToggle = input(true);

  /** The selected node id. */
  readonly selected = model<string | null>(null);
  /** Renders the nodes as a list of buttons under the canvas. */
  readonly showList = model(false);

  readonly nodeOpen = output<string>();
  readonly nodeHover = output<string | null>();
  /** Zoom in percent of the fitted view. */
  readonly zoomChange = output<number>();

  private readonly canvas = viewChild(SoneGraphCanvasDirective);
  protected readonly cardTemplate = contentChild(
    SoneGraphCardTemplateDirective,
  );

  protected readonly hintId = `sone-graph-${nextGraphId++}-hint`;
  protected readonly zoomStep = GRAPH_ZOOM_STEP;
  protected readonly zoomPct = signal(100);
  protected readonly anchor = signal<GraphSceneAnchor | null>(null);
  protected readonly announcement = signal("");

  private readonly browser = signal(false);
  private readonly laidOut = signal<LaidOut | null>(null);
  private layoutSeq = 0;

  protected readonly text = computed<SoneGraphLabels>(() => ({
    ...DEFAULT_LABELS,
    ...this.labels(),
  }));

  protected readonly allTones = computed<SoneGraphTones>(() => ({
    ...SONE_GRAPH_TONES,
    ...this.tones(),
  }));

  protected readonly prepared = computed<Prepared>(() => {
    const data = this.data();
    const nodes: SoneGraphNode[] = [];
    const seen = new Set<string>();
    for (const n of data?.nodes ?? []) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        nodes.push(n);
      }
    }
    const index = keyIndex(nodes.map((n) => ({ key: n.id })));
    const kept = (data?.edges ?? []).filter(
      (e) => linkEnds(index, e.source, e.target) !== null,
    );
    const heaviest = kept.reduce(
      (m, e) => Math.max(m, finiteWeight(e.weight)),
      1,
    );
    const degree = new Int32Array(nodes.length);
    const edges = kept.map((e): GraphSceneEdge => {
      degree[index.get(e.source) as number]++;
      degree[index.get(e.target) as number]++;
      return {
        a: e.source,
        b: e.target,
        weight: finiteWeight(e.weight) / heaviest,
        dashed: e.dashed ?? false,
      };
    });
    return { nodes, index, edges, degree };
  });

  private readonly request = computed<GraphLayoutRequest | null>(() => {
    if (!this.browser()) return null;
    const p = this.prepared();
    return {
      kind: this.layout(),
      nodes: p.nodes.map((n) => ({
        key: n.id,
        size: n.size ?? 0,
        layer: n.layer ?? 0,
      })),
      edges: p.edges.map((e) => ({ a: e.a, b: e.b, weight: e.weight })),
      sizing: this.sizing(),
    };
  });

  protected readonly scene = computed<GraphScene>(() => {
    const done = this.laidOut();
    if (!done) return EMPTY_GRAPH_SCENE;
    const { prepared, request, layout } = done;
    const nodes = prepared.nodes;
    const layerLabels = this.layerLabels();
    const clusterLabel = this.clusterLabel();
    return {
      layered: request.kind === "layers",
      nodes: nodes.map((n, i) => ({
        key: n.id,
        label: n.label,
        tone: n.tone ?? "default",
        shape: n.shape ?? "circle",
        x: layout.x[i],
        y: layout.y[i],
        r: layout.r[i],
        side: layout.side[i],
        labelX: layout.labelX[i],
        column: request.nodes[i].layer,
        group: layout.group[i],
      })),
      edges: prepared.edges,
      columns: layout.columns.map((c) => ({
        label: layerLabels[c.layer] ?? "",
        count: c.count,
        x: c.x,
        top: c.top,
      })),
      clusters: layout.clusters.map((c) => ({
        label: clusterLabel({
          anchor: c.anchor < 0 ? null : nodes[c.anchor],
          count: c.count,
        }),
        cx: c.cx,
        top: c.top,
        hull: c.hull,
      })),
    };
  });

  protected readonly state = computed(() =>
    this.prepared().nodes.length === 0
      ? "empty"
      : this.laidOut()?.request === this.request() && this.request()
        ? "ready"
        : "pending",
  );

  protected readonly selectedKey = computed(() => {
    const id = this.selected();
    return id !== null && this.prepared().index.has(id) ? id : null;
  });

  protected readonly summaryText = computed(() => {
    const own = this.summary();
    if (own !== null) return own;
    const p = this.prepared();
    return `${nodeCount(p.nodes.length)} · ${linkCount(p.edges.length)}`;
  });

  protected readonly ariaLabel = computed(() => {
    const own = this.label();
    if (own !== null) return own;
    if (this.prepared().nodes.length === 0) return this.text().empty;
    return $localize`Graph of ${this.summaryText()}:summary:`;
  });

  protected readonly listItems = computed(() => {
    const p = this.prepared();
    return p.nodes.map((node, i) => ({
      node,
      tone: this.toneOf(node),
      description: this.describe()(node, { degree: p.degree[i] }),
    }));
  });

  protected readonly hoverCard = computed<CardModel | null>(() => {
    const anchor = this.anchor();
    if (!anchor?.hovered || anchor.key === this.selectedKey()) return null;
    return this.cardOf(anchor.key, anchor, false);
  });

  protected readonly pinnedCard = computed<CardModel | null>(() => {
    const id = this.selectedKey();
    if (id === null) return null;
    const anchor = this.anchor();
    return this.cardOf(id, anchor?.key === id ? anchor : null, true);
  });

  constructor() {
    afterNextRender(() => this.browser.set(true));

    effect(() => {
      const request = this.request();
      const prepared = this.prepared();
      const strategy = this.layoutStrategy();
      if (!request) return;
      const seq = ++this.layoutSeq;
      const settle = (layout: GraphLayout): void => {
        if (seq === this.layoutSeq) {
          this.laidOut.set({ prepared, request, layout });
        }
      };
      const result = untracked(() =>
        strategy ? strategy(request) : runGraphLayout(request),
      );
      if (isThenable(result)) {
        result.then(settle, () => settle(runGraphLayout(request)));
      } else {
        settle(result);
      }
    });
  }

  /** Zooms about the centre by `factor` (1.25 is one step in). */
  zoomBy(factor: number): void {
    this.canvas()?.zoomBy(factor);
  }

  /** Glides back to the view that fits every node. */
  fit(): void {
    this.canvas()?.fit();
  }

  protected onPick(id: string | null): void {
    this.selected.set(id);
    const p = this.prepared();
    const at = id === null ? undefined : p.index.get(id);
    if (at === undefined) {
      this.announcement.set(this.text().selectionCleared);
      return;
    }
    const node = p.nodes[at];
    this.announcement.set(
      `${node.label} — ${this.describe()(node, { degree: p.degree[at] })}.`,
    );
  }

  protected onZoom(pct: number): void {
    this.zoomPct.set(pct);
    this.zoomChange.emit(pct);
  }

  private toneOf(node: SoneGraphNode): string {
    const tones = this.allTones();
    return toneCss(tones[node.tone ?? "default"] ?? tones["default"] ?? "");
  }

  private cardOf(
    id: string,
    anchor: GraphSceneAnchor | null,
    pinned: boolean,
  ): CardModel | null {
    const p = this.prepared();
    const at = p.index.get(id);
    if (at === undefined) return null;
    const node = p.nodes[at];
    const meta = this.describe()(node, { degree: p.degree[at] });
    const tone = this.toneOf(node);
    return {
      id,
      anchor,
      heading: node.label,
      meta,
      tone,
      square: node.shape === "square",
      context: { $implicit: node, pinned, description: meta, tone },
    };
  }
}

function finiteWeight(w: number | undefined): number {
  return w !== undefined && Number.isFinite(w) && w > 0 ? w : 0;
}

function isThenable(
  value: GraphLayout | Promise<GraphLayout>,
): value is Promise<GraphLayout> {
  return typeof (value as Partial<Promise<GraphLayout>>).then === "function";
}
