"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
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
} from "@surface-one/react";

import {
  type StepKind,
  type StepData,
  type Field,
  STEP_MS,
  DRAG_TYPE,
  HISTORY_LIMIT,
} from "../data/workflow";

// The shared stylesheet (../styles/workflow.css + workflow.twins.css), prefixed with .tpl-workflow.
import { css } from "../styles/scoped/workflow.generated";

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

const DOCK_POSITIONS: readonly SegmentOption[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

/**
 * A state whose latest value handlers can read back at once (`ref.current`) — the
 * canvas reports a change and then the delete or drag that caused it, in one go.
 */
function useLatest<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const ref = useRef(value);
  const set = (next: T): void => {
    ref.current = next;
    setValue(next);
  };
  return [value, ref, set] as const;
}

/** A text field that commits on Enter or blur (a native `change`), not on every key. */
function TextInput({
  id,
  value,
  onCommit,
}: {
  id: string;
  value: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [shown, setShown] = useState(value);
  // The step changed from outside (undo, redo): show its new value.
  if (value !== shown) {
    setShown(value);
    setDraft(value);
  }
  const commit = (): void => {
    if (draft !== value) onCommit(draft);
  };
  return (
    <input
      id={id}
      type="text"
      autoComplete="off"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
      }}
    />
  );
}

export default function WorkflowTemplate() {
  const flow = useRef<SoneFlowApi>(null);

  const [nodes, nodesRef, setNodes] = useLatest<readonly Step[]>(SEED_NODES);
  const [edges, edgesRef, setEdges] =
    useLatest<readonly SoneFlowEdge[]>(SEED_EDGES);
  const [selectedNodes, setSelectedNodes] = useState<readonly string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<readonly string[]>([]);
  const [tool, setTool] = useState<SoneFlowTool>("select");
  const [dock, setDock] = useState<DockPosition>("bottom");
  const [minimap, setMinimap] = useState(true);
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<readonly LogLine[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const [past, pastRef, setPast] = useLatest<readonly Snapshot[]>([]);
  const [future, futureRef, setFuture] = useLatest<readonly Snapshot[]>([]);
  /** The state the next change is undone to. */
  const present = useRef<Snapshot>({ nodes: SEED_NODES, edges: SEED_EDGES });
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** A step just added, to focus once it renders. */
  const focusNext = useRef<string | null>(null);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const selectedStep =
    selectedNodes.length === 1
      ? (nodes.find((n) => n.id === selectedNodes[0]) ?? null)
      : null;

  const triggerLabel =
    nodes
      .filter((n) => KINDS[n.data!.kind].group === "Triggers")
      .map((n) => n.label)
      .join(", ") || "None";

  useEffect(() => {
    const id = focusNext.current;
    if (id === null) return;
    focusNext.current = null;
    flow.current?.focusNode(id);
  }, [nodes]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function linksOf(
    id: string,
  ): { edge: SoneFlowEdge; other: string; out: boolean }[] {
    const label = (nid: string) =>
      nodes.find((n) => n.id === nid)?.label ?? nid;
    return edges
      .filter((e) => e.source === id || e.target === id)
      .map((e) => ({
        edge: e,
        out: e.source === id,
        other: label(e.source === id ? e.target : e.source),
      }));
  }

  // ── Editing ──────────────────────────────────────────────────────────────────

  function deleteSelection(): void {
    flow.current?.deleteSelection();
  }

  /** Adds a step at a point (the middle of the view by default) and selects it. */
  function add(kind: StepKind, at?: SoneFlowPoint): void {
    const api = flow.current;
    if (!api) return;
    const center = at ?? api.visibleCenter();
    const id = `${kind}-${nextId.current++}`;
    const k = KINDS[kind];
    const node = step(
      id,
      kind,
      Math.round((center.x - 104) / 20) * 20,
      Math.round((center.y - 28) / 20) * 20,
      kind === "note" ? "Note" : k.label,
      kind === "note" ? "Write something…" : k.hint,
    );
    setNodes([...nodesRef.current, node]);
    setSelectedNodes([id]);
    setSelectedEdges([]);
    record();
    setAnnouncement(`${k.label} added.`);
    // Focus after the node renders.
    focusNext.current = id;
  }

  function onConnect(c: SoneFlowConnection): void {
    const source = nodesRef.current.find((n) => n.id === c.source);
    const branch =
      source?.data?.kind === "condition"
        ? c.sourcePort === "yes"
          ? { label: "Yes", tone: "success" as const }
          : { label: "No", tone: "danger" as const }
        : {};
    setEdges([
      ...edgesRef.current,
      { id: `e-${nextId.current++}`, ...c, ...branch },
    ]);
    record();
  }

  function unlink(edgeId: string): void {
    setEdges(edgesRef.current.filter((e) => e.id !== edgeId));
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
    setNodes(nodesRef.current.map((n) => (n.id === id ? fn(n) : n)));
    record();
  }

  // ── History ──────────────────────────────────────────────────────────────────

  /** Remembers the state before this change, for undo. */
  function record(): void {
    const next = { nodes: nodesRef.current, edges: edgesRef.current };
    const prev = present.current;
    if (next.nodes === prev.nodes && next.edges === prev.edges) return;
    setPast([...pastRef.current, prev].slice(-HISTORY_LIMIT));
    setFuture([]);
    present.current = next;
  }

  function undo(): void {
    const list = pastRef.current;
    const prev = list[list.length - 1];
    if (!prev) return;
    setPast(list.slice(0, -1));
    setFuture([present.current, ...futureRef.current]);
    restore(prev);
    setAnnouncement("Undone.");
  }

  function redo(): void {
    const [next, ...rest] = futureRef.current;
    if (!next) return;
    setFuture(rest);
    setPast([...pastRef.current, present.current]);
    restore(next);
    setAnnouncement("Redone.");
  }

  function restore(s: Snapshot): void {
    present.current = s;
    setNodes(s.nodes);
    setEdges(s.edges);
    setSelectedNodes([]);
    setSelectedEdges([]);
  }

  // ── Drag from the palette ────────────────────────────────────────────────────

  function onDragStart(e: DragEvent, kind: StepKind): void {
    e.dataTransfer.setData(DRAG_TYPE, kind);
    e.dataTransfer.effectAllowed = "copy";
  }

  function onDragOver(e: DragEvent): void {
    if (e.dataTransfer.types.includes(DRAG_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }

  function onDrop(e: DragEvent): void {
    const kind = e.dataTransfer.getData(DRAG_TYPE) as StepKind | "";
    const api = flow.current;
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
    if (running) return;
    const list = nodesRef.current;
    const links = edgesRef.current;
    const trigger = list.find((n) => KINDS[n.data!.kind].group === "Triggers");
    clearStatus();
    setLog([]);
    setSelectedNodes([]);
    if (!trigger) {
      setAnnouncement("Add a trigger to run the workflow.");
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
    setRunning(true);
    setAnnouncement("Test run started.");
    order.forEach((s, i) => {
      timers.current.push(
        setTimeout(() => {
          setStatus(s.id, "running");
          setEdges(
            edgesRef.current.map((e) => ({
              ...e,
              animated: e.target === s.id,
            })),
          );
        }, i * STEP_MS),
        setTimeout(
          () => {
            setStatus(s.id, "success");
            setLog((l) => [
              ...l,
              {
                id: s.id,
                label: s.label,
                icon: s.icon ?? "check",
                status: "success",
                detail: `${(0.12 + ((i * 37) % 50) / 100).toFixed(2)} s`,
              },
            ]);
            if (i === order.length - 1) finish(order.length);
          },
          i * STEP_MS + STEP_MS - 80,
        ),
      );
    });
  }

  function finish(count: number): void {
    setRunning(false);
    setEdges(edgesRef.current.map((e) => ({ ...e, animated: false })));
    setAnnouncement(`Test run finished: ${count} steps succeeded.`);
  }

  function setStatus(id: string, status: SoneFlowNodeStatus): void {
    setNodes(nodesRef.current.map((n) => (n.id === id ? { ...n, status } : n)));
  }

  function clearStatus(): void {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setNodes(
      nodesRef.current.map((n) => (n.status ? { ...n, status: undefined } : n)),
    );
  }

  return (
    <div className="workflow tpl-workflow" onKeyDown={onShortcut}>
      <style>{css}</style>
      <SonePageHeader as="div">
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Automations · Orders</SonePageHeaderEyebrow>
          <SonePageHeaderTitle as="h2">
            Order fulfilment
            <SoneBadge
              variant={active ? "success" : "secondary"}
              className="title-badge"
            >
              {active ? "Active" : "Draft"}
            </SoneBadge>
          </SonePageHeaderTitle>
          <SonePageHeaderDescription>
            Ships in-stock orders and tells the warehouse about the rest.{" "}
            {nodes.length} steps, {edges.length} connections.
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          <div className="publish">
            <SoneSwitch
              checked={active}
              onCheckedChange={setActive}
              inputId="wf-active"
              size="sm"
            />
            <label htmlFor="wf-active">Active</label>
          </div>
          <SoneButton
            variant="outline"
            size="sm"
            type="button"
            disabled={running}
            onClick={() => run()}
          >
            <SoneIcon icon="play" />
            <span>{running ? "Running…" : "Test run"}</span>
          </SoneButton>
          <SoneButton size="sm" type="button" onClick={() => setActive(true)}>
            <SoneIcon icon="check" />
            <span>Publish</span>
          </SoneButton>
        </SonePageHeaderActions>
      </SonePageHeader>

      <div className="layout">
        <SoneCard
          as="aside"
          className="palette"
          aria-labelledby="wf-palette-title"
        >
          <SoneCardHeader>
            <SoneCardTitle id="wf-palette-title">Steps</SoneCardTitle>
            <SoneCardDescription>
              Click to add, or drag onto the canvas.
            </SoneCardDescription>
          </SoneCardHeader>
          <SoneCardContent className="palette-body">
            {PALETTE.map((g) => (
              <section
                key={g.group}
                className="palette-group"
                aria-label={g.group}
              >
                <h4 className="palette-title">{g.group}</h4>
                <ul className="palette-list">
                  {g.kinds.map((k) => (
                    <li key={k}>
                      <button
                        type="button"
                        className="palette-item"
                        draggable
                        data-tone={KINDS[k].tone}
                        aria-label={`Add ${KINDS[k].label}`}
                        onClick={() => add(k)}
                        onDragStart={(e) => onDragStart(e, k)}
                      >
                        <span className="palette-icon" aria-hidden="true">
                          <SoneIcon icon={KINDS[k].icon} />
                        </span>
                        <span className="palette-text">
                          <span className="palette-label">
                            {KINDS[k].label}
                          </span>
                          <span className="palette-hint">{KINDS[k].hint}</span>
                        </span>
                        <SoneIcon icon="plus" className="palette-plus" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </SoneCardContent>
        </SoneCard>

        <section className="canvas" aria-labelledby="wf-canvas-title">
          <div className="canvas-bar">
            <h3 id="wf-canvas-title" className="canvas-title">
              Canvas
            </h3>
            <SoneSegmented
              size="sm"
              ariaLabel="Dock position"
              options={DOCK_POSITIONS}
              value={dock}
              onValueChange={(value) => setDock(value as DockPosition)}
            />
          </div>
          <div className="canvas-frame" onDragOver={onDragOver} onDrop={onDrop}>
            <SoneFlow
              ref={flow}
              nodes={nodes}
              onNodesChange={(next) => setNodes(next as readonly Step[])}
              edges={edges}
              onEdgesChange={setEdges}
              selectedNodes={selectedNodes}
              onSelectedNodesChange={setSelectedNodes}
              selectedEdges={selectedEdges}
              onSelectedEdgesChange={setSelectedEdges}
              className="flow"
              aria-label="Order fulfilment workflow"
              edgeType="bezier"
              snapToGrid
              autoConnect={false}
              tool={tool}
              onConnect={onConnect}
              onNodeDragEnd={() => record()}
              onNodesDelete={() => record()}
              onEdgesDelete={() => record()}
            >
              <SoneDock
                size="sm"
                aria-label="Workflow tools"
                position={dock}
                align={dock === "top" || dock === "bottom" ? "start" : "center"}
              >
                <SoneDockItem
                  label="Select"
                  shortcut="V"
                  active={tool === "select"}
                  onClick={() => setTool("select")}
                >
                  <SoneIcon icon="mouse-pointer" />
                </SoneDockItem>
                <SoneDockItem
                  label="Pan"
                  shortcut="H"
                  active={tool === "pan"}
                  onClick={() => setTool("pan")}
                >
                  <SoneIcon icon="hand" />
                </SoneDockItem>
                <SoneDockSeparator />
                <SoneDockItem
                  label="Add action"
                  shortcut="A"
                  onClick={() => add("http")}
                >
                  <SoneIcon icon="square" />
                </SoneDockItem>
                <SoneDockItem
                  label="Add condition"
                  shortcut="D"
                  onClick={() => add("condition")}
                >
                  <SoneIcon icon="diamond" />
                </SoneDockItem>
                <SoneDockItem
                  label="Add note"
                  shortcut="N"
                  onClick={() => add("note")}
                >
                  <SoneIcon icon="sticky-note" />
                </SoneDockItem>
                <SoneDockItem
                  label="Delete selection"
                  shortcut="Delete"
                  disabled={!selectedNodes.length && !selectedEdges.length}
                  onClick={deleteSelection}
                >
                  <SoneIcon icon="trash" />
                </SoneDockItem>
                <SoneDockSeparator />
                <SoneDockItem
                  label="Undo"
                  shortcut="Ctrl+Z"
                  disabled={!canUndo}
                  onClick={undo}
                >
                  <SoneIcon icon="undo" />
                </SoneDockItem>
                <SoneDockItem
                  label="Redo"
                  shortcut="Ctrl+Shift+Z"
                  disabled={!canRedo}
                  onClick={redo}
                >
                  <SoneIcon icon="redo" />
                </SoneDockItem>
                <SoneDockSeparator />
                <SoneDockItem
                  label="Zoom out"
                  onClick={() => flow.current?.zoomOut()}
                >
                  <SoneIcon icon="zoom-out" />
                </SoneDockItem>
                <SoneDockItem
                  label="Zoom in"
                  onClick={() => flow.current?.zoomIn()}
                >
                  <SoneIcon icon="zoom-in" />
                </SoneDockItem>
                <SoneDockItem
                  label="Fit view"
                  onClick={() => flow.current?.fit()}
                >
                  <SoneIcon icon="fit" />
                </SoneDockItem>
                <SoneDockItem
                  label="Minimap"
                  active={minimap}
                  onClick={() => setMinimap((m) => !m)}
                >
                  <SoneIcon icon="map" />
                </SoneDockItem>
              </SoneDock>
              {minimap && (
                <SoneFlowMinimap
                  width={160}
                  height={104}
                  position={dock === "right" ? "bottom-left" : "bottom-right"}
                />
              )}
            </SoneFlow>
          </div>
        </section>

        <SoneCard
          as="aside"
          className="inspector"
          aria-labelledby="wf-inspector-title"
        >
          {selectedStep ? (
            <>
              <SoneCardHeader>
                <SoneCardTitle id="wf-inspector-title">
                  {selectedStep.label}
                </SoneCardTitle>
                <SoneCardDescription>
                  {KINDS[selectedStep.data!.kind].label} step
                </SoneCardDescription>
                <SoneCardAction>
                  <SoneButton
                    variant="ghost"
                    size="icon-sm"
                    type="button"
                    aria-label="Delete step"
                    onClick={deleteSelection}
                  >
                    <SoneIcon icon="trash" />
                  </SoneButton>
                </SoneCardAction>
              </SoneCardHeader>
              <SoneCardContent key={selectedStep.id} className="inspector-body">
                <SoneField>
                  <SoneFieldLabel htmlFor="wf-name">Name</SoneFieldLabel>
                  <TextInput
                    id="wf-name"
                    value={selectedStep.label}
                    onCommit={(v) => rename(selectedStep.id, v)}
                  />
                </SoneField>
                {selectedStep.data!.kind !== "note" && (
                  <SoneField>
                    <SoneFieldLabel htmlFor="wf-desc">Summary</SoneFieldLabel>
                    <TextInput
                      id="wf-desc"
                      value={selectedStep.description ?? ""}
                      onCommit={(v) => describe(selectedStep.id, v)}
                    />
                  </SoneField>
                )}
                {KINDS[selectedStep.data!.kind].fields.map((f) => (
                  <SoneField key={f.key}>
                    <SoneFieldLabel htmlFor={`wf-f-${f.key}`}>
                      {f.label}
                    </SoneFieldLabel>
                    {f.type === "select" ? (
                      <SoneSelect
                        selectId={`wf-f-${f.key}`}
                        value={
                          selectedStep.data!.config[f.key] ?? f.options![0]
                        }
                        onValueChange={(v) =>
                          configure(selectedStep.id, f.key, v)
                        }
                      >
                        {f.options!.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </SoneSelect>
                    ) : f.type === "number" ? (
                      <SoneInputNumber
                        inputId={`wf-f-${f.key}`}
                        min={0}
                        max={10080}
                        value={+(selectedStep.data!.config[f.key] ?? 0)}
                        onValueChange={(v) =>
                          configure(selectedStep.id, f.key, `${v ?? 0}`)
                        }
                      />
                    ) : (
                      <TextInput
                        id={`wf-f-${f.key}`}
                        value={selectedStep.data!.config[f.key] ?? ""}
                        onCommit={(v) => configure(selectedStep.id, f.key, v)}
                      />
                    )}
                  </SoneField>
                ))}
                <div className="links">
                  <h4 className="links-title">Connections</h4>
                  {linksOf(selectedStep.id).length ? (
                    <SoneItemGroup as="ul" size="sm">
                      {linksOf(selectedStep.id).map((l) => (
                        <SoneItem
                          key={l.edge.id}
                          as="li"
                          size="sm"
                          variant="outline"
                        >
                          <SoneItemMedia as="span" variant="icon">
                            <SoneIcon
                              icon={l.out ? "arrow-right" : "arrow-down"}
                            />
                          </SoneItemMedia>
                          <SoneItemContent>
                            <SoneItemTitle>{l.other}</SoneItemTitle>
                            <SoneItemDescription>
                              {l.out ? "Next" : "From"}{" "}
                              {l.edge.label ? `· ${l.edge.label}` : ""}
                            </SoneItemDescription>
                          </SoneItemContent>
                          <SoneItemActions>
                            <SoneButton
                              variant="ghost"
                              size="icon-xs"
                              type="button"
                              aria-label={`Remove connection to ${l.other}`}
                              onClick={() => unlink(l.edge.id)}
                            >
                              <SoneIcon icon="close" />
                            </SoneButton>
                          </SoneItemActions>
                        </SoneItem>
                      ))}
                    </SoneItemGroup>
                  ) : (
                    <p className="muted">
                      Not connected. Drag from a dot, or focus the step and
                      press C.
                    </p>
                  )}
                </div>
              </SoneCardContent>
            </>
          ) : (
            <>
              <SoneCardHeader>
                <SoneCardTitle id="wf-inspector-title">Workflow</SoneCardTitle>
                <SoneCardDescription>
                  Select a step to edit it.
                </SoneCardDescription>
              </SoneCardHeader>
              <SoneCardContent className="inspector-body">
                <dl className="facts">
                  <div>
                    <dt>Trigger</dt>
                    <dd>{triggerLabel}</dd>
                  </div>
                  <div>
                    <dt>Steps</dt>
                    <dd>{nodes.length}</dd>
                  </div>
                  <div>
                    <dt>Connections</dt>
                    <dd>{edges.length}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{active ? "Active" : "Draft"}</dd>
                  </div>
                </dl>
                <div className="links">
                  <h4 className="links-title">Last run</h4>
                  {log.length ? (
                    <ol className="log" aria-label="Run log">
                      {log.map((l) => (
                        <li key={l.id} className="log-line">
                          <SoneIcon icon={l.icon} className="log-icon" />
                          <span className="log-label">{l.label}</span>
                          <span className="log-detail num">{l.detail}</span>
                          <SoneBadge variant={STATUS_BADGE[l.status]}>
                            {STATUS_TEXT[l.status]}
                          </SoneBadge>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="muted">No test run yet. Press Test run.</p>
                  )}
                </div>
              </SoneCardContent>
            </>
          )}
        </SoneCard>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
