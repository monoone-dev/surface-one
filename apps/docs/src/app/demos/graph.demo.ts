import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import {
  SONE_GRAPH_PARTS,
  type SoneGraphData,
  type SoneGraphEdge,
  type SoneGraphLayout,
  type SoneGraphNode,
  type SoneGraphNodeInfo,
} from "@surface-one/angular/graph";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";

const TEMPLATE = `<div class="demo-stack" style="width: 100%">
  <sone-segmented [options]="layouts" [(value)]="mode" ariaLabel="Graph layout" />
  <sone-graph
    style="--sone-graph-height: 460px"
    [data]="data"
    [layout]="layout()"
    [layerLabels]="kinds"
    [describe]="describe"
    [(selected)]="selected"
    (nodeOpen)="opened.set($event)"
  >
    <span soneGraphLegend class="graph-demo-key">
      @for (k of kinds; track k; let i = $index) {
        <span><i [style.background]="'var(--graph-' + tones[i] + ')'"></i>{{ k }}</span>
      }
    </span>
  </sone-graph>
  <span style="color: var(--text-secondary); font-size: var(--font-size-sm)">
    Selected: {{ selected() ?? "none" }} · Opened: {{ opened() ?? "none" }}
  </span>
</div>`;

export const code = TEMPLATE;

const KINDS = ["People", "Meetings", "Notes", "Documents"];
const TONES = ["entity", "meeting", "note", "document"];
const NAMES = [
  ["Ada Park", "Leo Ruiz", "Mia Chen", "Noor Haddad", "Ivo Petrov", "Sana Ito"],
  ["Kickoff", "Pricing review", "Retro", "Design crit", "Roadmap sync"],
  ["Launch plan", "Risks", "Interview notes", "Spec draft", "Decisions"],
  ["Contract", "Brand guide", "Budget", "Survey results"],
];

/** A small deterministic generator (an LCG), so every build draws the same graph. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sampleGraph(
  perKind: number,
  links: number,
  seed: number,
): SoneGraphData {
  const rnd = seeded(seed);
  const nodes: SoneGraphNode[] = [];
  for (let layer = 0; layer < 4; layer++) {
    for (let i = 0; i < perKind; i++) {
      const names = NAMES[layer];
      const round = Math.floor(i / names.length);
      nodes.push({
        id: `${TONES[layer]}-${i}`,
        label: names[i % names.length] + (round ? ` ${round + 1}` : ""),
        tone: TONES[layer],
        shape: layer === 0 ? "circle" : layer === 3 ? "square" : "circle",
        size: 0,
        layer,
      });
    }
  }
  const edges: SoneGraphEdge[] = [];
  const topics = 4;
  for (let k = 0; k < links; k++) {
    const la = Math.floor(rnd() * 3);
    const lb = la + 1;
    const topic = Math.floor(rnd() * topics);
    const pick = (): number =>
      (topic + topics * Math.floor(rnd() * (perKind / topics))) % perKind;
    const a = nodes[la * perKind + pick()];
    const b = nodes[lb * perKind + pick()];
    a.size = (a.size ?? 0) + 1;
    b.size = (b.size ?? 0) + 1;
    edges.push({
      source: a.id,
      target: b.id,
      weight: 0.2 + rnd() * 0.8,
      dashed: rnd() < 0.08,
    });
  }
  return { nodes, edges };
}

@Component({
  selector: "docs-graph-demo",
  imports: [...SONE_GRAPH_PARTS, SoneSegmentedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
  styles: `
    .graph-demo-key {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--space-1) var(--space-3);
    }
    .graph-demo-key > span {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
    }
    .graph-demo-key i {
      width: var(--space-2);
      height: var(--space-2);
      border-radius: var(--radius-pill);
    }
  `,
})
export default class GraphDemo {
  readonly layouts: readonly SegmentOption[] = [
    { value: "force", label: "Force" },
    { value: "clusters", label: "Clusters" },
    { value: "layers", label: "Layers" },
  ];
  readonly mode = signal("force");
  readonly layout = computed(() => this.mode() as SoneGraphLayout);
  readonly kinds = KINDS;
  readonly tones = TONES;
  readonly data = sampleGraph(12, 70, 7);
  readonly selected = signal<string | null>(null);
  readonly opened = signal<string | null>(null);

  readonly describe = (node: SoneGraphNode, info: SoneGraphNodeInfo): string =>
    `${KINDS[node.layer ?? 0]} · ${info.degree} links`;
}
