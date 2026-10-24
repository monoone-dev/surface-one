<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SoneGraph,
  SoneGraphLegend,
  SoneSegmented,
  type SoneGraphData,
  type SoneGraphEdge,
  type SoneGraphLayout,
  type SoneGraphNode,
  type SoneGraphNodeInfo,
} from "@surface-one/vue";

const layouts = [
  { value: "force", label: "Force" },
  { value: "clusters", label: "Clusters" },
  { value: "layers", label: "Layers" },
];
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

function sampleGraph(perKind: number, links: number, seed: number): SoneGraphData {
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
        shape: layer === 3 ? "square" : "circle",
        size: 0,
        layer,
      });
    }
  }
  const edges: SoneGraphEdge[] = [];
  const topics = 4;
  for (let k = 0; k < links; k++) {
    const la = Math.floor(rnd() * 3);
    const topic = Math.floor(rnd() * topics);
    const pick = (): number => (topic + topics * Math.floor(rnd() * (perKind / topics))) % perKind;
    const a = nodes[la * perKind + pick()];
    const b = nodes[(la + 1) * perKind + pick()];
    a.size = (a.size ?? 0) + 1;
    b.size = (b.size ?? 0) + 1;
    edges.push({ source: a.id, target: b.id, weight: 0.2 + rnd() * 0.8, dashed: rnd() < 0.08 });
  }
  return { nodes, edges };
}

const data = sampleGraph(12, 70, 7);
const mode = ref("force");
const layout = computed(() => mode.value as SoneGraphLayout);
const selected = ref<string | null>(null);
const opened = ref<string | null>(null);

const describe = (node: SoneGraphNode, info: SoneGraphNodeInfo): string =>
  `${KINDS[node.layer ?? 0]} · ${info.degree} links`;
</script>

<template>
  <div class="demo-stack" style="width: 100%">
    <SoneSegmented v-model="mode" :options="layouts" aria-label="Graph layout" />
    <SoneGraph
      v-model:selected="selected"
      style="--sone-graph-height: 460px"
      :data="data"
      :layout="layout"
      :layer-labels="KINDS"
      :describe="describe"
      @node-open="opened = $event"
    >
      <SoneGraphLegend style="display: inline-flex; flex-wrap: wrap; gap: var(--space-1) var(--space-3)">
        <span v-for="(k, i) in KINDS" :key="k" style="display: inline-flex; align-items: center; gap: var(--space-1)">
          <i
            :style="{
              width: 'var(--space-2)',
              height: 'var(--space-2)',
              borderRadius: 'var(--radius-pill)',
              background: `var(--graph-${TONES[i]})`,
            }"
          ></i>
          {{ k }}
        </span>
      </SoneGraphLegend>
    </SoneGraph>
    <span style="color: var(--text-secondary); font-size: var(--font-size-sm)">
      Selected: {{ selected ?? "none" }} · Opened: {{ opened ?? "none" }}
    </span>
  </div>
</template>
