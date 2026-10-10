import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SONE_FLOW_PARTS,
  type SoneFlowEdge,
  type SoneFlowEdgeType,
  type SoneFlowNode,
} from "@surface-one/angular/flow";
import {
  type SegmentOption,
  SoneSegmentedComponent,
} from "@surface-one/angular/segmented";

const TEMPLATE = `<div class="demo-stack" style="width: 100%">
  <sone-segmented size="sm" ariaLabel="Edge style" [options]="types" [(value)]="edgeType" />
  <sone-flow
    style="--sone-flow-h: 26rem; width: 100%"
    ariaLabel="Order fulfilment"
    [edgeType]="$any(edgeType())"
    [(nodes)]="nodes"
    [(edges)]="edges"
    [(selectedNodes)]="selected"
  >
    <sone-flow-controls showZoom />
    <sone-flow-minimap />
  </sone-flow>
  <p class="text-hint">
    Drag nodes and the canvas, drag from a dot to connect, Ctrl / ⌘ + scroll to zoom.
    Selected: {{ selected().join(', ') || 'none' }}
  </p>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import { SoneFlow, SoneFlowControls, SoneFlowMinimap, SoneSegmented, type SoneFlowEdge, type SoneFlowNode } from "@surface-one/vue";

const types = [
  { value: "bezier", label: "Bezier" },
  { value: "step", label: "Step" },
  { value: "straight", label: "Straight" },
];
const edgeType = ref("bezier");
const selected = ref<string[]>([]);
const nodes = ref<SoneFlowNode[]>([
  { id: "order", x: 0, y: 80, label: "Order placed", description: "Webhook", icon: "webhook", tone: "accent" },
  { id: "stock", x: 280, y: 64, label: "In stock?", shape: "diamond", outputs: ["yes", "no"] },
  { id: "ship", x: 480, y: 0, label: "Ship order", description: "Create label", icon: "truck", tone: "success" },
  { id: "notify", x: 480, y: 168, label: "Notify buyer", description: "Back-order email", icon: "mail", tone: "warning" },
  { id: "note", x: 0, y: 220, label: "Note", description: "Orders over €500 skip the stock check.", shape: "note" },
]);
const edges = ref<SoneFlowEdge[]>([
  { id: "e1", source: "order", target: "stock", animated: true },
  { id: "e2", source: "stock", sourcePort: "yes", target: "ship", label: "Yes", tone: "success" },
  { id: "e3", source: "stock", sourcePort: "no", target: "notify", label: "No", tone: "warning" },
]);
</script>

<template>
  <div class="demo-stack" style="width: 100%">
    <SoneSegmented v-model="edgeType" size="sm" aria-label="Edge style" :options="types" />
    <SoneFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      v-model:selected-nodes="selected"
      style="--sone-flow-h: 26rem; width: 100%"
      aria-label="Order fulfilment"
      :edge-type="edgeType"
    >
      <SoneFlowControls show-zoom />
      <SoneFlowMinimap />
    </SoneFlow>
  </div>
</template>
`;

@Component({
  selector: "docs-flow-demo",
  imports: [...SONE_FLOW_PARTS, SoneSegmentedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class FlowDemo {
  readonly types: SegmentOption[] = (
    ["bezier", "step", "straight"] as SoneFlowEdgeType[]
  ).map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }));
  readonly edgeType = signal<string>("bezier");
  readonly selected = signal<readonly string[]>([]);
  readonly nodes = signal<readonly SoneFlowNode[]>([
    {
      id: "order",
      x: 0,
      y: 80,
      label: "Order placed",
      description: "Webhook",
      icon: "webhook",
      tone: "accent",
    },
    {
      id: "stock",
      x: 280,
      y: 64,
      label: "In stock?",
      shape: "diamond",
      outputs: ["yes", "no"],
    },
    {
      id: "ship",
      x: 480,
      y: 0,
      label: "Ship order",
      description: "Create label",
      icon: "truck",
      tone: "success",
    },
    {
      id: "notify",
      x: 480,
      y: 168,
      label: "Notify buyer",
      description: "Back-order email",
      icon: "mail",
      tone: "warning",
    },
    {
      id: "note",
      x: 0,
      y: 220,
      label: "Note",
      description: "Orders over €500 skip the stock check.",
      shape: "note",
    },
  ]);
  readonly edges = signal<readonly SoneFlowEdge[]>([
    { id: "e1", source: "order", target: "stock", animated: true },
    {
      id: "e2",
      source: "stock",
      sourcePort: "yes",
      target: "ship",
      label: "Yes",
      tone: "success",
    },
    {
      id: "e3",
      source: "stock",
      sourcePort: "no",
      target: "notify",
      label: "No",
      tone: "warning",
    },
  ]);
}
