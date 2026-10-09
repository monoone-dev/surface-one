import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_GRAPH_PARTS } from "./graph.parts";
import type { SoneGraphData, SoneGraphNode } from "./graph.types";

/** Deterministic sample: four kinds in columns, linked mostly to the next kind. */
function sample(perKind: number, links: number, seed: number): SoneGraphData {
  let state = seed >>> 0;
  const rnd = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const tones = ["person", "meeting", "note", "document"];
  const nodes: SoneGraphNode[] = [];
  for (let layer = 0; layer < 4; layer++) {
    for (let i = 0; i < perKind; i++) {
      nodes.push({
        id: `${tones[layer]}-${i}`,
        label: `${["Person", "Meeting", "Note", "Document"][layer]} ${i + 1}`,
        tone: tones[layer],
        shape: layer === 3 ? "square" : "circle",
        size: 0,
        layer,
      });
    }
  }
  const edges = [];
  for (let k = 0; k < links; k++) {
    const la = Math.floor(rnd() * 3);
    const topic = Math.floor(rnd() * 4);
    const pick = (): number =>
      (topic + 4 * Math.floor(rnd() * (perKind / 4))) % perKind;
    const a = nodes[la * perKind + pick()];
    const b = nodes[(la + 1) * perKind + pick()];
    a.size = (a.size ?? 0) + 1;
    b.size = (b.size ?? 0) + 1;
    edges.push({ source: a.id, target: b.id, weight: 0.2 + rnd() * 0.8 });
  }
  return { nodes, edges };
}

const DATA = sample(12, 70, 7);
const LAYERS = ["People", "Meetings", "Notes", "Documents"];

const meta: Meta = {
  title: "Components/Data display/Graph",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_GRAPH_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-graph>` — an interactive network diagram drawn on a Canvas 2D (no dependency). Layouts: " +
          "`force`, `clusters` (communities with hulls and titles) and `layers` (one column per `layer`). Drag to " +
          "pan, wheel to zoom at the cursor, click to select and highlight the neighbourhood, double-click or Enter " +
          "to open; arrows move to the nearest node, Page Up / Page Down step through all of them, `+` / `-` / `0` " +
          "zoom and fit. Selections are announced; the List button renders the nodes as buttons.\n\n" +
          "Inputs: `data` ({ nodes, edges }), `layout`, `tones` (tone → custom property or `--a, --b` chain), " +
          "`sizing`, `layerLabels`, `clusterLabel`, `describe`, `label`, `summary`, `labels`, `layoutStrategy` " +
          "(e.g. a Web Worker calling `runGraphLayout`), `listToggle`; models `[(selected)]`, `[(showList)]`; " +
          "outputs `nodeOpen`, `nodeHover`, `zoomChange`; methods `zoomBy()`, `fit()`. Slots: `[soneGraphLegend]`, " +
          '`ng-template[soneGraphCard] let-node let-pinned="pinned"`. Parts: `canvas[soneGraphCanvas]`, ' +
          "`<sone-graph-controls>`, `<sone-graph-card>`. The layouts are pure functions in " +
          "`@surface-one/angular/graph-layout`.\n\n" +
          "No spartan/ui or shadcn/ui counterpart exists; the controls and card follow shadcn's " +
          "[Button](https://ui.shadcn.com/docs/components/button) and [Card](https://ui.shadcn.com/docs/components/card) " +
          "anatomy and spartan's [toolbar-like button group](https://spartan.ng/components/button-group).",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Force: Story = {
  render: () => ({
    props: { data: DATA },
    template: `<sone-graph [data]="data" layout="force" />`,
  }),
};

export const Clusters: Story = {
  render: () => ({
    props: { data: DATA },
    template: `<sone-graph [data]="data" layout="clusters" />`,
  }),
};

export const Layers: Story = {
  render: () => ({
    props: { data: DATA, layers: LAYERS },
    template: `<sone-graph [data]="data" layout="layers" [layerLabels]="layers" />`,
  }),
};

export const Selected: Story = {
  render: () => ({
    props: { data: DATA },
    template: `<sone-graph [data]="data" selected="meeting-0" />`,
  }),
};

export const WithLegendAndList: Story = {
  render: () => ({
    props: { data: DATA, layers: LAYERS },
    template: `<sone-graph [data]="data" layout="layers" [layerLabels]="layers" [showList]="true">
  <span soneGraphLegend>People · Meetings · Notes · Documents</span>
</sone-graph>`,
  }),
};

export const CustomCard: Story = {
  render: () => ({
    props: { data: DATA },
    template: `<sone-graph [data]="data" layout="clusters">
  <ng-template soneGraphCard let-node let-pinned="pinned">
    <strong>{{ node.label }}</strong>
    <span>{{ pinned ? "Pinned" : "Hovered" }} · size {{ node.size }}</span>
  </ng-template>
</sone-graph>`,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { data: { nodes: [], edges: [] } },
    template: `<sone-graph [data]="data" />`,
  }),
};
