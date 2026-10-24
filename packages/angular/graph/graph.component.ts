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
  booleanAttribute,
} from "@angular/core";
import { plural, soneId } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  GRAPH_ZOOM_STEP,
  type GraphLayout,
  type GraphLayoutRequest,
  type GraphScene,
  type GraphSceneAnchor,
} from "@surface-one/angular/graph-layout";
import { SoneGraphCanvasDirective } from "./graph-canvas.directive";
import { SoneGraphCardComponent } from "./graph-card/graph-card.component";
import { SoneGraphControlsComponent } from "./graph-controls/graph-controls.component";
import {
  SONE_GRAPH_SIZING,
  graphCards,
  graphClusterLabel,
  graphLayoutRequest,
  graphPickAnnouncement,
  graphScene,
  graphToneOf,
  prepareGraph,
  runGraphLayoutWith,
  type SoneGraphCardModel,
  type SoneGraphLaidOut,
  type SoneGraphPrepared,
} from "./graph-model";
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

const linkCount = (n: number): string =>
  plural(n, $localize`{count, plural, =1 {1 link} other {# links}}`);
const nodeCount = (n: number): string =>
  plural(n, $localize`{count, plural, =1 {1 node} other {# nodes}}`);

/** Unlinked block → "Unlinked · n"; a community of five or more → "<largest node> · n". */
export function soneGraphClusterLabel(cluster: SoneGraphCluster): string {
  return graphClusterLabel(
    cluster,
    (count) => $localize`Unlinked · ${count}:count:`,
  );
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

interface CardModel extends SoneGraphCardModel {
  context: SoneGraphCardContext;
}

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
  readonly sizing = input<SoneGraphSizing>(SONE_GRAPH_SIZING);
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
  readonly listToggle = input(true, { transform: booleanAttribute });

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

  protected readonly hintId = `${soneId("sone-graph")}-hint`;
  protected readonly zoomStep = GRAPH_ZOOM_STEP;
  protected readonly zoomPct = signal(100);
  protected readonly anchor = signal<GraphSceneAnchor | null>(null);
  protected readonly announcement = signal("");

  private readonly browser = signal(false);
  private readonly laidOut = signal<SoneGraphLaidOut | null>(null);
  private layoutSeq = 0;

  protected readonly text = computed<SoneGraphLabels>(() => ({
    ...DEFAULT_LABELS,
    ...this.labels(),
  }));

  protected readonly allTones = computed<SoneGraphTones>(() => ({
    ...SONE_GRAPH_TONES,
    ...this.tones(),
  }));

  protected readonly prepared = computed<SoneGraphPrepared>(() =>
    prepareGraph(this.data()),
  );

  private readonly request = computed<GraphLayoutRequest | null>(() =>
    this.browser()
      ? graphLayoutRequest(this.prepared(), this.layout(), this.sizing())
      : null,
  );

  protected readonly scene = computed<GraphScene>(() =>
    graphScene(this.laidOut(), this.layerLabels(), this.clusterLabel()),
  );

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

  private readonly cards = computed(() =>
    graphCards(
      this.prepared(),
      this.selectedKey(),
      this.anchor(),
      this.describe(),
      this.allTones(),
    ),
  );

  protected readonly hoverCard = computed(() =>
    withContext(this.cards().hover),
  );

  protected readonly pinnedCard = computed(() =>
    withContext(this.cards().pinned),
  );

  constructor() {
    afterNextRender(() => this.browser.set(true));

    effect(() => {
      const request = this.request();
      const prepared = this.prepared();
      const strategy = this.layoutStrategy();
      if (!request) return;
      const seq = ++this.layoutSeq;
      untracked(() =>
        runGraphLayoutWith(request, strategy, (layout: GraphLayout) => {
          if (seq === this.layoutSeq) {
            this.laidOut.set({ prepared, request, layout });
          }
        }),
      );
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
    this.announcement.set(
      graphPickAnnouncement(
        this.prepared(),
        id,
        this.describe(),
        this.text().selectionCleared,
      ),
    );
  }

  protected onZoom(pct: number): void {
    this.zoomPct.set(pct);
    this.zoomChange.emit(pct);
  }

  private toneOf(node: SoneGraphNode): string {
    return graphToneOf(this.allTones(), node);
  }
}

function withContext(card: SoneGraphCardModel | null): CardModel | null {
  return card
    ? {
        ...card,
        context: {
          $implicit: card.node,
          pinned: card.pinned,
          description: card.meta,
          tone: card.tone,
        },
      }
    : null;
}
