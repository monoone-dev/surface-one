<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from "vue";
import {
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardAction,
  SoneCardContent,
  SoneCardDescription,
  SoneCardHeader,
  SoneCardTitle,
  SoneDock,
  SoneDockItem,
  SoneDockSeparator,
  SoneField,
  SoneFieldLabel,
  SoneFlow,
  SoneFlowMinimap,
  SoneIcon,
  SoneInputNumber,
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemDescription,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemTitle,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSegmented,
  SoneSelect,
  SoneSwitch,
  type BadgeVariant,
  type DockPosition,
  type SegmentOption,
  type ShellIcon,
  type SoneFlowApi,
  type SoneFlowConnection,
  type SoneFlowEdge,
  type SoneFlowNode,
  type SoneFlowNodeStatus,
  type SoneFlowPoint,
  type SoneFlowPort,
  type SoneFlowShape,
  type SoneFlowTone,
  type SoneFlowTool,
} from "@surface-one/vue";

import {
  type StepKind,
  type StepData,
  type Field,
  STEP_MS,
  DRAG_TYPE,
  HISTORY_LIMIT,
} from "../data/workflow";

type Step = SoneFlowNode<StepData>;

interface Kind {
  readonly label: string;
  readonly hint: string;
  readonly icon: ShellIcon;
  readonly tone: SoneFlowTone;
  readonly group: "Triggers" | "Logic" | "Actions";
  readonly shape?: SoneFlowShape;
  readonly inputs?: readonly (string | SoneFlowPort)[];
  readonly outputs?: readonly (string | SoneFlowPort)[];
  readonly fields: readonly Field[];
}

interface Snapshot {
  readonly nodes: readonly Step[];
  readonly edges: readonly SoneFlowEdge[];
}

interface LogLine {
  readonly id: string;
  readonly label: string;
  readonly icon: ShellIcon;
  readonly status: SoneFlowNodeStatus;
  readonly detail: string;
}

type DockTool = "select" | "pan";

const KINDS: Readonly<Record<StepKind, Kind>> = {
  webhook: {
    label: "Webhook",
    hint: "Starts on an HTTP call",
    icon: "webhook",
    tone: "accent",
    group: "Triggers",
    inputs: [],
    fields: [
      {
        key: "method",
        label: "Method",
        type: "select",
        options: ["POST", "PUT", "GET"],
      },
      { key: "path", label: "Path", type: "text" },
    ],
  },
  schedule: {
    label: "Schedule",
    hint: "Starts at set times",
    icon: "clock",
    tone: "accent",
    group: "Triggers",
    inputs: [],
    fields: [
      {
        key: "every",
        label: "Runs",
        type: "select",
        options: ["Every hour", "Every day at 09:00", "Every Monday"],
      },
    ],
  },
  condition: {
    label: "Condition",
    hint: "Branch on a rule",
    icon: "git-branch",
    tone: "warning",
    group: "Logic",
    shape: "diamond",
    outputs: ["yes", "no"],
    fields: [
      { key: "field", label: "Field", type: "text" },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        options: ["is", "is not", "greater than", "less than"],
      },
      { key: "value", label: "Value", type: "text" },
    ],
  },
  delay: {
    label: "Delay",
    hint: "Wait before the next step",
    icon: "clock",
    tone: "chart-4",
    group: "Logic",
    fields: [{ key: "minutes", label: "Minutes", type: "number" }],
  },
  http: {
    label: "HTTP request",
    hint: "Call any API",
    icon: "globe",
    tone: "chart-1",
    group: "Actions",
    fields: [
      {
        key: "method",
        label: "Method",
        type: "select",
        options: ["GET", "POST", "PUT", "DELETE"],
      },
      { key: "url", label: "URL", type: "text" },
    ],
  },
  database: {
    label: "Database",
    hint: "Read or write a record",
    icon: "database",
    tone: "chart-5",
    group: "Actions",
    fields: [
      { key: "table", label: "Table", type: "text" },
      {
        key: "action",
        label: "Action",
        type: "select",
        options: ["Find", "Insert", "Update"],
      },
    ],
  },
  email: {
    label: "Send email",
    hint: "Email a person or a list",
    icon: "mail",
    tone: "chart-2",
    group: "Actions",
    fields: [
      { key: "to", label: "To", type: "text" },
      { key: "subject", label: "Subject", type: "text" },
    ],
  },
  slack: {
    label: "Slack message",
    hint: "Post to a channel",
    icon: "message-square",
    tone: "chart-3",
    group: "Actions",
    fields: [
      { key: "channel", label: "Channel", type: "text" },
      { key: "message", label: "Message", type: "text" },
    ],
  },
  done: {
    label: "Done",
    hint: "End the run",
    icon: "circle-check",
    tone: "success",
    group: "Logic",
    shape: "pill",
    outputs: [],
    fields: [],
  },
  note: {
    label: "Note",
    hint: "A sticky note",
    icon: "sticky-note",
    tone: "neutral",
    group: "Logic",
    shape: "note",
    fields: [{ key: "text", label: "Text", type: "text" }],
  },
};

const PALETTE: readonly {
  group: Kind["group"];
  kinds: readonly StepKind[];
}[] = [
  { group: "Triggers", kinds: ["webhook", "schedule"] },
  { group: "Logic", kinds: ["condition", "delay", "done"] },
  { group: "Actions", kinds: ["http", "database", "email", "slack"] },
];

/** A step from its kind: label, icon, tone, shape and ports follow the kind. */
function step(
  id: string,
  kind: StepKind,
  x: number,
  y: number,
  label: string,
  description: string,
  config: Record<string, string> = {},
): Step {
  const k = KINDS[kind];
  return {
    id,
    x,
    y,
    label,
    description,
    icon: kind === "note" ? undefined : k.icon,
    tone: k.tone,
    shape: k.shape,
    inputs: k.inputs,
    outputs: k.outputs,
    data: { kind, config },
  };
}

const SEED_NODES: readonly Step[] = [
  step("order", "webhook", 0, 132, "New order", "POST /orders", {
    method: "POST",
    path: "/orders",
  }),
  step("stock", "database", 264, 132, "Check stock", "Find in inventory", {
    table: "inventory",
    action: "Find",
  }),
  step("in-stock", "condition", 524, 104, "In stock?", "", {
    field: "inventory.available",
    operator: "greater than",
    value: "0",
  }),
  step("ship", "http", 724, 24, "Create shipment", "POST carrier API", {
    method: "POST",
    url: "https://api.carrier.example/shipments",
  }),
  step("confirm", "email", 988, 24, "Email confirmation", "To the buyer", {
    to: "{{order.email}}",
    subject: "Your order is on its way",
  }),
  step("warehouse", "slack", 724, 240, "Alert warehouse", "#fulfilment", {
    channel: "#fulfilment",
    message: "Out of stock: {{order.sku}}",
  }),
  step("backorder", "email", 988, 240, "Back-order email", "To the buyer", {
    to: "{{order.email}}",
    subject: "Your order is delayed",
  }),
  step("done", "done", 1252, 138, "Done", ""),
  step(
    "note",
    "note",
    0,
    300,
    "Review",
    "Orders over €500 are checked by hand before they ship.",
  ),
];

const SEED_EDGES: readonly SoneFlowEdge[] = [
  { id: "e-order-stock", source: "order", target: "stock" },
  { id: "e-stock-check", source: "stock", target: "in-stock" },
  {
    id: "e-yes",
    source: "in-stock",
    sourcePort: "yes",
    target: "ship",
    label: "Yes",
    tone: "success",
  },
  {
    id: "e-no",
    source: "in-stock",
    sourcePort: "no",
    target: "warehouse",
    label: "No",
    tone: "danger",
  },
  { id: "e-ship-confirm", source: "ship", target: "confirm" },
  { id: "e-warehouse-backorder", source: "warehouse", target: "backorder" },
  { id: "e-confirm-done", source: "confirm", target: "done" },
  { id: "e-backorder-done", source: "backorder", target: "done" },
];

const STATUS_BADGE: Readonly<Record<SoneFlowNodeStatus, BadgeVariant>> = {
  running: "secondary",
  success: "success",
  error: "destructive",
  warning: "warning",
};
const STATUS_TEXT: Readonly<Record<SoneFlowNodeStatus, string>> = {
  running: "Running",
  success: "Succeeded",
  error: "Failed",
  warning: "Skipped",
};

const kinds = KINDS;
const palette = PALETTE;
const statusBadge = STATUS_BADGE;
const statusText = STATUS_TEXT;
const dockPositions: readonly SegmentOption[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

const flow = useTemplateRef<SoneFlowApi>("flow");

const nodes = ref<readonly Step[]>(SEED_NODES);
const edges = ref<readonly SoneFlowEdge[]>(SEED_EDGES);
const selectedNodes = ref<readonly string[]>([]);
const selectedEdges = ref<readonly string[]>([]);
const tool = ref<SoneFlowTool>("select");
const dock = ref<DockPosition>("bottom");
const minimap = ref(true);
const active = ref(false);
const running = ref(false);
const log = ref<readonly LogLine[]>([]);
const announcement = ref("");

const past = ref<readonly Snapshot[]>([]);
const future = ref<readonly Snapshot[]>([]);
/** The state the next change is undone to. */
let present: Snapshot = { nodes: SEED_NODES, edges: SEED_EDGES };
let nextId = 1;
let timers: ReturnType<typeof setTimeout>[] = [];

const canUndo = computed(() => past.value.length > 0);
const canRedo = computed(() => future.value.length > 0);

const selectedStep = computed(() => {
  const ids = selectedNodes.value;
  return ids.length === 1
    ? (nodes.value.find((n) => n.id === ids[0]) ?? null)
    : null;
});

const triggerLabel = computed(
  () =>
    nodes.value
      .filter((n) => KINDS[n.data!.kind].group === "Triggers")
      .map((n) => n.label)
      .join(", ") || "None",
);

onBeforeUnmount(() => timers.forEach(clearTimeout));

function linksOf(
  id: string,
): { edge: SoneFlowEdge; other: string; out: boolean }[] {
  const label = (nid: string) =>
    nodes.value.find((n) => n.id === nid)?.label ?? nid;
  return edges.value
    .filter((e) => e.source === id || e.target === id)
    .map((e) => ({
      edge: e,
      out: e.source === id,
      other: label(e.source === id ? e.target : e.source),
    }));
}

const valueOf = (e: Event): string => (e.target as HTMLInputElement).value;

// ── Editing ──────────────────────────────────────────────────────────────────

function setTool(next: DockTool): void {
  tool.value = next;
}

function deleteSelection(): void {
  flow.value?.deleteSelection();
}

/** Adds a step at a point (the middle of the view by default) and selects it. */
function add(kind: StepKind, at?: SoneFlowPoint): void {
  const api = flow.value;
  if (!api) return;
  const center = at ?? api.visibleCenter();
  const id = `${kind}-${nextId++}`;
  const k = KINDS[kind];
  const node = step(
    id,
    kind,
    Math.round((center.x - 104) / 20) * 20,
    Math.round((center.y - 28) / 20) * 20,
    kind === "note" ? "Note" : k.label,
    kind === "note" ? "Write something…" : k.hint,
  );
  nodes.value = [...nodes.value, node];
  selectedNodes.value = [id];
  selectedEdges.value = [];
  record();
  announcement.value = `${k.label} added.`;
  // Focus after the node renders.
  void nextTick(() => api.focusNode(id));
}

function onConnect(c: SoneFlowConnection): void {
  const source = nodes.value.find((n) => n.id === c.source);
  const branch =
    source?.data?.kind === "condition"
      ? c.sourcePort === "yes"
        ? { label: "Yes", tone: "success" as const }
        : { label: "No", tone: "danger" as const }
      : {};
  edges.value = [...edges.value, { id: `e-${nextId++}`, ...c, ...branch }];
  record();
}

function unlink(edgeId: string): void {
  edges.value = edges.value.filter((e) => e.id !== edgeId);
  record();
}

function rename(id: string, label: string): void {
  patch(id, (n) => ({ ...n, label: label.trim() || n.label }));
}

function describe(id: string, description: string): void {
  patch(id, (n) => ({ ...n, description }));
}

function configure(id: string, key: string, value: string): void {
  patch(id, (n) => ({
    ...n,
    // A note shows its text on the canvas.
    description: n.data!.kind === "note" ? value : n.description,
    data: { ...n.data!, config: { ...n.data!.config, [key]: value } },
  }));
}

function patch(id: string, fn: (n: Step) => Step): void {
  nodes.value = nodes.value.map((n) => (n.id === id ? fn(n) : n));
  record();
}

// ── History ──────────────────────────────────────────────────────────────────

/** Remembers the state before this change, for undo. */
function record(): void {
  const next = { nodes: nodes.value, edges: edges.value };
  if (next.nodes === present.nodes && next.edges === present.edges) return;
  past.value = [...past.value, present].slice(-HISTORY_LIMIT);
  future.value = [];
  present = next;
}

function undo(): void {
  const list = past.value;
  const prev = list[list.length - 1];
  if (!prev) return;
  past.value = list.slice(0, -1);
  future.value = [present, ...future.value];
  restore(prev);
  announcement.value = "Undone.";
}

function redo(): void {
  const [next, ...rest] = future.value;
  if (!next) return;
  future.value = rest;
  past.value = [...past.value, present];
  restore(next);
  announcement.value = "Redone.";
}

function restore(s: Snapshot): void {
  present = s;
  nodes.value = s.nodes;
  edges.value = s.edges;
  selectedNodes.value = [];
  selectedEdges.value = [];
}

// ── Drag from the palette ────────────────────────────────────────────────────

function onDragStart(e: DragEvent, kind: StepKind): void {
  e.dataTransfer?.setData(DRAG_TYPE, kind);
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
}

function onDragOver(e: DragEvent): void {
  if (e.dataTransfer?.types.includes(DRAG_TYPE)) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
}

function onDrop(e: DragEvent): void {
  const kind = e.dataTransfer?.getData(DRAG_TYPE) as StepKind | undefined;
  const api = flow.value;
  if (!kind || !(kind in KINDS) || !api) return;
  e.preventDefault();
  add(kind, api.screenToFlow(e.clientX, e.clientY));
}

// ── Keyboard shortcuts ───────────────────────────────────────────────────────

function onShortcut(e: KeyboardEvent): void {
  const el = e.target as Element;
  if (el.closest("input, select, textarea, [contenteditable]")) return;
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
    return;
  }
  if (mod || e.altKey) return;
  // C belongs to the canvas (start a connection) when a step has focus.
  const keys: Record<string, () => void> = {
    v: () => setTool("select"),
    h: () => setTool("pan"),
    a: () => add("http"),
    d: () => add("condition"),
    n: () => add("note"),
  };
  const run = keys[e.key.toLowerCase()];
  if (run) {
    e.preventDefault();
    run();
  }
}

// ── Test run ─────────────────────────────────────────────────────────────────

/** Walks the steps from the trigger, one at a time, taking the "Yes" branch of a condition. */
function run(): void {
  if (running.value) return;
  const list = nodes.value;
  const links = edges.value;
  const trigger = list.find((n) => KINDS[n.data!.kind].group === "Triggers");
  clearStatus();
  log.value = [];
  selectedNodes.value = [];
  if (!trigger) {
    announcement.value = "Add a trigger to run the workflow.";
    return;
  }
  const order: Step[] = [];
  const seen = new Set<string>();
  let current: Step | undefined = trigger;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    order.push(current);
    const from: string = current.id;
    const out = links.filter((e) => e.source === from);
    const next: SoneFlowEdge | undefined =
      current.data!.kind === "condition"
        ? (out.find((e) => e.sourcePort === "yes") ?? out[0])
        : out[0];
    current = next && list.find((n) => n.id === next.target);
  }
  running.value = true;
  announcement.value = "Test run started.";
  order.forEach((s, i) => {
    timers.push(
      setTimeout(() => {
        setStatus(s.id, "running");
        edges.value = edges.value.map((e) => ({
          ...e,
          animated: e.target === s.id,
        }));
      }, i * STEP_MS),
      setTimeout(
        () => {
          setStatus(s.id, "success");
          log.value = [
            ...log.value,
            {
              id: s.id,
              label: s.label,
              icon: s.icon ?? "check",
              status: "success",
              detail: `${(0.12 + ((i * 37) % 50) / 100).toFixed(2)} s`,
            },
          ];
          if (i === order.length - 1) finish(order.length);
        },
        i * STEP_MS + STEP_MS - 80,
      ),
    );
  });
}

function finish(count: number): void {
  running.value = false;
  edges.value = edges.value.map((e) => ({ ...e, animated: false }));
  announcement.value = `Test run finished: ${count} steps succeeded.`;
}

function setStatus(id: string, status: SoneFlowNodeStatus): void {
  nodes.value = nodes.value.map((n) => (n.id === id ? { ...n, status } : n));
}

function clearStatus(): void {
  timers.forEach(clearTimeout);
  timers = [];
  nodes.value = nodes.value.map((n) =>
    n.status ? { ...n, status: undefined } : n,
  );
}
</script>

<template>
  <div class="workflow" @keydown="onShortcut">
    <SonePageHeader as="div">
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Automations · Orders</SonePageHeaderEyebrow>
        <SonePageHeaderTitle as="h2">
          Order fulfilment
          <SoneBadge
            :variant="active ? 'success' : 'secondary'"
            class="title-badge"
            >{{ active ? "Active" : "Draft" }}</SoneBadge
          >
        </SonePageHeaderTitle>
        <SonePageHeaderDescription>
          Ships in-stock orders and tells the warehouse about the rest.
          {{ nodes.length }} steps, {{ edges.length }} connections.
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
      <SonePageHeaderActions>
        <div class="publish">
          <SoneSwitch v-model="active" input-id="wf-active" size="sm" />
          <label for="wf-active">Active</label>
        </div>
        <SoneButton
          variant="outline"
          size="sm"
          type="button"
          :disabled="running"
          @click="run()"
        >
          <SoneIcon icon="play" /><span>{{
            running ? "Running…" : "Test run"
          }}</span>
        </SoneButton>
        <SoneButton size="sm" type="button" @click="active = true">
          <SoneIcon icon="check" /><span>Publish</span>
        </SoneButton>
      </SonePageHeaderActions>
    </SonePageHeader>

    <div class="layout">
      <SoneCard as="aside" class="palette" aria-labelledby="wf-palette-title">
        <SoneCardHeader>
          <SoneCardTitle id="wf-palette-title">Steps</SoneCardTitle>
          <SoneCardDescription
            >Click to add, or drag onto the canvas.</SoneCardDescription
          >
        </SoneCardHeader>
        <SoneCardContent class="palette-body">
          <section
            v-for="g in palette"
            :key="g.group"
            class="palette-group"
            :aria-label="g.group"
          >
            <h4 class="palette-title">{{ g.group }}</h4>
            <ul class="palette-list">
              <li v-for="k in g.kinds" :key="k">
                <button
                  type="button"
                  class="palette-item"
                  draggable="true"
                  :data-tone="kinds[k].tone"
                  :aria-label="'Add ' + kinds[k].label"
                  @click="add(k)"
                  @dragstart="onDragStart($event, k)"
                >
                  <span class="palette-icon" aria-hidden="true"
                    ><SoneIcon :icon="kinds[k].icon"
                  /></span>
                  <span class="palette-text">
                    <span class="palette-label">{{ kinds[k].label }}</span>
                    <span class="palette-hint">{{ kinds[k].hint }}</span>
                  </span>
                  <SoneIcon icon="plus" class="palette-plus" />
                </button>
              </li>
            </ul>
          </section>
        </SoneCardContent>
      </SoneCard>

      <section class="canvas" aria-labelledby="wf-canvas-title">
        <div class="canvas-bar">
          <h3 id="wf-canvas-title" class="canvas-title">Canvas</h3>
          <SoneSegmented
            size="sm"
            aria-label="Dock position"
            :options="dockPositions"
            :model-value="dock"
            @update:model-value="dock = $event as DockPosition"
          />
        </div>
        <div class="canvas-frame" @dragover="onDragOver" @drop="onDrop">
          <SoneFlow
            ref="flow"
            v-model:nodes="nodes"
            v-model:edges="edges"
            v-model:selected-nodes="selectedNodes"
            v-model:selected-edges="selectedEdges"
            class="flow"
            aria-label="Order fulfilment workflow"
            edge-type="bezier"
            snap-to-grid
            :auto-connect="false"
            :tool="tool"
            @connect="onConnect"
            @node-drag-end="record()"
            @nodes-delete="record()"
            @edges-delete="record()"
          >
            <SoneDock
              size="sm"
              aria-label="Workflow tools"
              :position="dock"
              :align="dock === 'top' || dock === 'bottom' ? 'start' : 'center'"
            >
              <SoneDockItem
                label="Select"
                shortcut="V"
                :active="tool === 'select'"
                @click="setTool('select')"
              >
                <SoneIcon icon="mouse-pointer" />
              </SoneDockItem>
              <SoneDockItem
                label="Pan"
                shortcut="H"
                :active="tool === 'pan'"
                @click="setTool('pan')"
              >
                <SoneIcon icon="hand" />
              </SoneDockItem>
              <SoneDockSeparator />
              <SoneDockItem
                label="Add action"
                shortcut="A"
                @click="add('http')"
              >
                <SoneIcon icon="square" />
              </SoneDockItem>
              <SoneDockItem
                label="Add condition"
                shortcut="D"
                @click="add('condition')"
              >
                <SoneIcon icon="diamond" />
              </SoneDockItem>
              <SoneDockItem label="Add note" shortcut="N" @click="add('note')">
                <SoneIcon icon="sticky-note" />
              </SoneDockItem>
              <SoneDockItem
                label="Delete selection"
                shortcut="Delete"
                :disabled="!selectedNodes.length && !selectedEdges.length"
                @click="deleteSelection()"
              >
                <SoneIcon icon="trash" />
              </SoneDockItem>
              <SoneDockSeparator />
              <SoneDockItem
                label="Undo"
                shortcut="Ctrl+Z"
                :disabled="!canUndo"
                @click="undo()"
              >
                <SoneIcon icon="undo" />
              </SoneDockItem>
              <SoneDockItem
                label="Redo"
                shortcut="Ctrl+Shift+Z"
                :disabled="!canRedo"
                @click="redo()"
              >
                <SoneIcon icon="redo" />
              </SoneDockItem>
              <SoneDockSeparator />
              <SoneDockItem label="Zoom out" @click="flow?.zoomOut()">
                <SoneIcon icon="zoom-out" />
              </SoneDockItem>
              <SoneDockItem label="Zoom in" @click="flow?.zoomIn()">
                <SoneIcon icon="zoom-in" />
              </SoneDockItem>
              <SoneDockItem label="Fit view" @click="flow?.fit()">
                <SoneIcon icon="fit" />
              </SoneDockItem>
              <SoneDockItem
                label="Minimap"
                :active="minimap"
                @click="minimap = !minimap"
              >
                <SoneIcon icon="map" />
              </SoneDockItem>
            </SoneDock>
            <SoneFlowMinimap
              v-if="minimap"
              :width="160"
              :height="104"
              :position="dock === 'right' ? 'bottom-left' : 'bottom-right'"
            />
          </SoneFlow>
        </div>
      </section>

      <SoneCard
        as="aside"
        class="inspector"
        aria-labelledby="wf-inspector-title"
      >
        <template v-if="selectedStep">
          <SoneCardHeader>
            <SoneCardTitle id="wf-inspector-title">{{
              selectedStep.label
            }}</SoneCardTitle>
            <SoneCardDescription
              >{{
                kinds[selectedStep.data!.kind].label
              }}
              step</SoneCardDescription
            >
            <SoneCardAction>
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Delete step"
                @click="deleteSelection()"
              >
                <SoneIcon icon="trash" />
              </SoneButton>
            </SoneCardAction>
          </SoneCardHeader>
          <SoneCardContent class="inspector-body">
            <SoneField>
              <SoneFieldLabel for="wf-name">Name</SoneFieldLabel>
              <input
                id="wf-name"
                type="text"
                autocomplete="off"
                :value="selectedStep.label"
                @change="rename(selectedStep.id, valueOf($event))"
              />
            </SoneField>
            <SoneField v-if="selectedStep.data!.kind !== 'note'">
              <SoneFieldLabel for="wf-desc">Summary</SoneFieldLabel>
              <input
                id="wf-desc"
                type="text"
                autocomplete="off"
                :value="selectedStep.description ?? ''"
                @change="describe(selectedStep.id, valueOf($event))"
              />
            </SoneField>
            <SoneField
              v-for="f in kinds[selectedStep.data!.kind].fields"
              :key="f.key"
            >
              <SoneFieldLabel :for="'wf-f-' + f.key">{{
                f.label
              }}</SoneFieldLabel>
              <SoneSelect
                v-if="f.type === 'select'"
                :select-id="'wf-f-' + f.key"
                :model-value="selectedStep.data!.config[f.key] ?? f.options![0]"
                @update:model-value="configure(selectedStep.id, f.key, $event)"
              >
                <option v-for="o in f.options" :key="o" :value="o">
                  {{ o }}
                </option>
              </SoneSelect>
              <SoneInputNumber
                v-else-if="f.type === 'number'"
                :input-id="'wf-f-' + f.key"
                :min="0"
                :max="10080"
                :model-value="+(selectedStep.data!.config[f.key] ?? 0)"
                @update:model-value="
                  configure(selectedStep.id, f.key, '' + ($event ?? 0))
                "
              />
              <input
                v-else
                :id="'wf-f-' + f.key"
                type="text"
                autocomplete="off"
                :value="selectedStep.data!.config[f.key] ?? ''"
                @change="configure(selectedStep.id, f.key, valueOf($event))"
              />
            </SoneField>
            <div class="links">
              <h4 class="links-title">Connections</h4>
              <SoneItemGroup
                v-if="linksOf(selectedStep.id).length"
                as="ul"
                size="sm"
              >
                <SoneItem
                  v-for="l in linksOf(selectedStep.id)"
                  :key="l.edge.id"
                  as="li"
                  size="sm"
                  variant="outline"
                >
                  <SoneItemMedia as="span" variant="icon"
                    ><SoneIcon :icon="l.out ? 'arrow-right' : 'arrow-down'"
                  /></SoneItemMedia>
                  <SoneItemContent>
                    <SoneItemTitle>{{ l.other }}</SoneItemTitle>
                    <SoneItemDescription>
                      {{ l.out ? "Next" : "From" }}
                      {{ l.edge.label ? "· " + l.edge.label : "" }}
                    </SoneItemDescription>
                  </SoneItemContent>
                  <SoneItemActions>
                    <SoneButton
                      variant="ghost"
                      size="icon-xs"
                      type="button"
                      :aria-label="'Remove connection to ' + l.other"
                      @click="unlink(l.edge.id)"
                    >
                      <SoneIcon icon="close" />
                    </SoneButton>
                  </SoneItemActions>
                </SoneItem>
              </SoneItemGroup>
              <p v-else class="muted">
                Not connected. Drag from a dot, or focus the step and press C.
              </p>
            </div>
          </SoneCardContent>
        </template>
        <template v-else>
          <SoneCardHeader>
            <SoneCardTitle id="wf-inspector-title">Workflow</SoneCardTitle>
            <SoneCardDescription>Select a step to edit it.</SoneCardDescription>
          </SoneCardHeader>
          <SoneCardContent class="inspector-body">
            <dl class="facts">
              <div>
                <dt>Trigger</dt>
                <dd>{{ triggerLabel }}</dd>
              </div>
              <div>
                <dt>Steps</dt>
                <dd>{{ nodes.length }}</dd>
              </div>
              <div>
                <dt>Connections</dt>
                <dd>{{ edges.length }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{{ active ? "Active" : "Draft" }}</dd>
              </div>
            </dl>
            <div class="links">
              <h4 class="links-title">Last run</h4>
              <ol v-if="log.length" class="log" aria-label="Run log">
                <li v-for="l in log" :key="l.id" class="log-line">
                  <SoneIcon :icon="l.icon" class="log-icon" />
                  <span class="log-label">{{ l.label }}</span>
                  <span class="log-detail num">{{ l.detail }}</span>
                  <SoneBadge :variant="statusBadge[l.status]">{{
                    statusText[l.status]
                  }}</SoneBadge>
                </li>
              </ol>
              <p v-else class="muted">No test run yet. Press Test run.</p>
            </div>
          </SoneCardContent>
        </template>
      </SoneCard>
    </div>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped src="../styles/workflow.css"></style>
