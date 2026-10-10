import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import {
  SoneBadgeDirective,
  type BadgeVariant,
} from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { SONE_DOCK_PARTS, type DockPosition } from "@surface-one/angular/dock";
import {
  SONE_FLOW_PARTS,
  SoneFlowComponent,
  type SoneFlowConnection,
  type SoneFlowEdge,
  type SoneFlowNode,
  type SoneFlowNodeStatus,
  type SoneFlowPoint,
  type SoneFlowPort,
  type SoneFlowShape,
  type SoneFlowTone,
  type SoneFlowTool,
} from "@surface-one/angular/flow";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneInputNumberComponent } from "@surface-one/angular/input-number";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

type StepKind =
  | "webhook"
  | "schedule"
  | "http"
  | "database"
  | "email"
  | "slack"
  | "condition"
  | "delay"
  | "done"
  | "note";

interface StepData {
  readonly kind: StepKind;
  /** The step's settings, by field key. */
  readonly config: Readonly<Record<string, string>>;
}

type Step = SoneFlowNode<StepData>;

interface Field {
  readonly key: string;
  readonly label: string;
  readonly type: "text" | "select" | "number";
  readonly options?: readonly string[];
}

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

const STEP_MS = 650;
const DRAG_TYPE = "application/x-sone-step";
const HISTORY_LIMIT = 50;

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

@Component({
  selector: "docs-workflow-template",
  imports: [
    ...SONE_PAGE_HEADER_PARTS,
    ...SONE_CARD_PARTS,
    ...SONE_FLOW_PARTS,
    ...SONE_DOCK_PARTS,
    ...SONE_FIELD_PARTS,
    ...SONE_ITEM_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneInputNumberComponent,
    SoneSegmentedComponent,
    SoneSelectComponent,
    SoneSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(keydown)": "onShortcut($event)" },
  template: `
    <div sonePageHeader>
      <div sonePageHeaderContent>
        <p sonePageHeaderEyebrow>Automations · Orders</p>
        <h2 sonePageHeaderTitle>
          Order fulfilment
          <span
            soneBadge
            [variant]="active() ? 'success' : 'secondary'"
            class="title-badge"
            >{{ active() ? "Active" : "Draft" }}</span
          >
        </h2>
        <p sonePageHeaderDescription>
          Ships in-stock orders and tells the warehouse about the rest.
          {{ nodes().length }} steps, {{ edges().length }} connections.
        </p>
      </div>
      <div sonePageHeaderActions>
        <div class="publish">
          <sone-switch
            inputId="wf-active"
            size="sm"
            [checked]="active()"
            (checkedChange)="active.set($event)"
          />
          <label for="wf-active">Active</label>
        </div>
        <button
          soneBtn
          variant="outline"
          size="sm"
          type="button"
          [disabled]="running()"
          (click)="run()"
        >
          <sone-icon icon="play" /><span>{{
            running() ? "Running…" : "Test run"
          }}</span>
        </button>
        <button soneBtn size="sm" type="button" (click)="active.set(true)">
          <sone-icon icon="check" /><span>Publish</span>
        </button>
      </div>
    </div>

    <div class="layout">
      <aside soneCard class="palette" aria-labelledby="wf-palette-title">
        <div soneCardHeader>
          <h3 soneCardTitle id="wf-palette-title">Steps</h3>
          <p soneCardDescription>Click to add, or drag onto the canvas.</p>
        </div>
        <div soneCardContent class="palette-body">
          @for (g of palette; track g.group) {
            <section class="palette-group" [attr.aria-label]="g.group">
              <h4 class="palette-title">{{ g.group }}</h4>
              <ul class="palette-list">
                @for (k of g.kinds; track k) {
                  <li>
                    <button
                      type="button"
                      class="palette-item"
                      draggable="true"
                      [attr.data-tone]="kinds[k].tone"
                      [attr.aria-label]="'Add ' + kinds[k].label"
                      (click)="add(k)"
                      (dragstart)="onDragStart($event, k)"
                    >
                      <span class="palette-icon" aria-hidden="true"
                        ><sone-icon [icon]="kinds[k].icon"
                      /></span>
                      <span class="palette-text">
                        <span class="palette-label">{{ kinds[k].label }}</span>
                        <span class="palette-hint">{{ kinds[k].hint }}</span>
                      </span>
                      <sone-icon icon="plus" class="palette-plus" />
                    </button>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      </aside>

      <section class="canvas" aria-labelledby="wf-canvas-title">
        <div class="canvas-bar">
          <h3 id="wf-canvas-title" class="canvas-title">Canvas</h3>
          <sone-segmented
            size="sm"
            ariaLabel="Dock position"
            [options]="dockPositions"
            [value]="dock()"
            (valueChange)="dock.set($any($event))"
          />
        </div>
        <div
          class="canvas-frame"
          (dragover)="onDragOver($event)"
          (drop)="onDrop($event)"
        >
          <sone-flow
            #flow
            class="flow"
            ariaLabel="Order fulfilment workflow"
            edgeType="bezier"
            snapToGrid
            [autoConnect]="false"
            [tool]="tool()"
            [(nodes)]="nodes"
            [(edges)]="edges"
            [(selectedNodes)]="selectedNodes"
            [(selectedEdges)]="selectedEdges"
            (connect)="onConnect($event)"
            (nodeDragEnd)="record()"
            (nodesDelete)="record()"
            (edgesDelete)="record()"
          >
            <sone-dock
              size="sm"
              ariaLabel="Workflow tools"
              [position]="dock()"
              [align]="
                dock() === 'top' || dock() === 'bottom' ? 'start' : 'center'
              "
            >
              <button
                soneDockItem
                label="Select"
                shortcut="V"
                [active]="tool() === 'select'"
                (click)="setTool('select')"
              >
                <sone-icon icon="mouse-pointer" />
              </button>
              <button
                soneDockItem
                label="Pan"
                shortcut="H"
                [active]="tool() === 'pan'"
                (click)="setTool('pan')"
              >
                <sone-icon icon="hand" />
              </button>
              <div soneDockSeparator></div>
              <button
                soneDockItem
                label="Add action"
                shortcut="A"
                (click)="add('http')"
              >
                <sone-icon icon="square" />
              </button>
              <button
                soneDockItem
                label="Add condition"
                shortcut="D"
                (click)="add('condition')"
              >
                <sone-icon icon="diamond" />
              </button>
              <button
                soneDockItem
                label="Add note"
                shortcut="N"
                (click)="add('note')"
              >
                <sone-icon icon="sticky-note" />
              </button>
              <button
                soneDockItem
                label="Delete selection"
                shortcut="Delete"
                [disabled]="!selectedNodes().length && !selectedEdges().length"
                (click)="flow.deleteSelection()"
              >
                <sone-icon icon="trash" />
              </button>
              <div soneDockSeparator></div>
              <button
                soneDockItem
                label="Undo"
                shortcut="Ctrl+Z"
                [disabled]="!canUndo()"
                (click)="undo()"
              >
                <sone-icon icon="undo" />
              </button>
              <button
                soneDockItem
                label="Redo"
                shortcut="Ctrl+Shift+Z"
                [disabled]="!canRedo()"
                (click)="redo()"
              >
                <sone-icon icon="redo" />
              </button>
              <div soneDockSeparator></div>
              <button soneDockItem label="Zoom out" (click)="flow.zoomOut()">
                <sone-icon icon="zoom-out" />
              </button>
              <button soneDockItem label="Zoom in" (click)="flow.zoomIn()">
                <sone-icon icon="zoom-in" />
              </button>
              <button soneDockItem label="Fit view" (click)="flow.fit()">
                <sone-icon icon="fit" />
              </button>
              <button
                soneDockItem
                label="Minimap"
                [active]="minimap()"
                (click)="minimap.set(!minimap())"
              >
                <sone-icon icon="map" />
              </button>
            </sone-dock>
            @if (minimap()) {
              <sone-flow-minimap
                [width]="160"
                [height]="104"
                [position]="dock() === 'right' ? 'bottom-left' : 'bottom-right'"
              />
            }
          </sone-flow>
        </div>
      </section>

      <aside soneCard class="inspector" aria-labelledby="wf-inspector-title">
        @if (selectedStep(); as s) {
          <div soneCardHeader>
            <h3 soneCardTitle id="wf-inspector-title">{{ s.label }}</h3>
            <p soneCardDescription>{{ kinds[s.data!.kind].label }} step</p>
            <div soneCardAction>
              <button
                soneBtn
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Delete step"
                (click)="flow.deleteSelection()"
              >
                <sone-icon icon="trash" />
              </button>
            </div>
          </div>
          <div soneCardContent class="inspector-body">
            <div soneField>
              <label soneFieldLabel for="wf-name">Name</label>
              <input
                id="wf-name"
                type="text"
                autocomplete="off"
                [value]="s.label"
                (change)="rename(s.id, $any($event.target).value)"
              />
            </div>
            @if (s.data!.kind !== "note") {
              <div soneField>
                <label soneFieldLabel for="wf-desc">Summary</label>
                <input
                  id="wf-desc"
                  type="text"
                  autocomplete="off"
                  [value]="s.description ?? ''"
                  (change)="describe(s.id, $any($event.target).value)"
                />
              </div>
            }
            @for (f of kinds[s.data!.kind].fields; track f.key) {
              <div soneField>
                <label soneFieldLabel [for]="'wf-f-' + f.key">{{
                  f.label
                }}</label>
                @switch (f.type) {
                  @case ("select") {
                    <sone-select
                      [selectId]="'wf-f-' + f.key"
                      [value]="s.data!.config[f.key] ?? f.options![0]"
                      (valueChange)="configure(s.id, f.key, $event)"
                    >
                      @for (o of f.options; track o) {
                        <option [value]="o">{{ o }}</option>
                      }
                    </sone-select>
                  }
                  @case ("number") {
                    <sone-input-number
                      [inputId]="'wf-f-' + f.key"
                      [min]="0"
                      [max]="10080"
                      [value]="+(s.data!.config[f.key] ?? 0)"
                      (valueChange)="configure(s.id, f.key, '' + ($event ?? 0))"
                    />
                  }
                  @default {
                    <input
                      [id]="'wf-f-' + f.key"
                      type="text"
                      autocomplete="off"
                      [value]="s.data!.config[f.key] ?? ''"
                      (change)="
                        configure(s.id, f.key, $any($event.target).value)
                      "
                    />
                  }
                }
              </div>
            }
            <div class="links">
              <h4 class="links-title">Connections</h4>
              @if (linksOf(s.id); as links) {
                @if (links.length) {
                  <ul soneItemGroup size="sm">
                    @for (l of links; track l.edge.id) {
                      <li soneItem size="sm" variant="outline">
                        <span soneItemMedia variant="icon"
                          ><sone-icon
                            [icon]="l.out ? 'arrow-right' : 'arrow-down'"
                        /></span>
                        <div soneItemContent>
                          <p soneItemTitle>{{ l.other }}</p>
                          <p soneItemDescription>
                            {{ l.out ? "Next" : "From" }}
                            {{ l.edge.label ? "· " + l.edge.label : "" }}
                          </p>
                        </div>
                        <div soneItemActions>
                          <button
                            soneBtn
                            variant="ghost"
                            size="icon-xs"
                            type="button"
                            [attr.aria-label]="
                              'Remove connection to ' + l.other
                            "
                            (click)="unlink(l.edge.id)"
                          >
                            <sone-icon icon="close" />
                          </button>
                        </div>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="muted">
                    Not connected. Drag from a dot, or focus the step and press
                    C.
                  </p>
                }
              }
            </div>
          </div>
        } @else {
          <div soneCardHeader>
            <h3 soneCardTitle id="wf-inspector-title">Workflow</h3>
            <p soneCardDescription>Select a step to edit it.</p>
          </div>
          <div soneCardContent class="inspector-body">
            <dl class="facts">
              <div>
                <dt>Trigger</dt>
                <dd>{{ triggerLabel() }}</dd>
              </div>
              <div>
                <dt>Steps</dt>
                <dd>{{ nodes().length }}</dd>
              </div>
              <div>
                <dt>Connections</dt>
                <dd>{{ edges().length }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{{ active() ? "Active" : "Draft" }}</dd>
              </div>
            </dl>
            <div class="links">
              <h4 class="links-title">Last run</h4>
              @if (log().length) {
                <ol class="log" aria-label="Run log">
                  @for (l of log(); track l.id) {
                    <li class="log-line">
                      <sone-icon [icon]="l.icon" class="log-icon" />
                      <span class="log-label">{{ l.label }}</span>
                      <span class="log-detail num">{{ l.detail }}</span>
                      <span soneBadge [variant]="statusBadge[l.status]">{{
                        statusText[l.status]
                      }}</span>
                    </li>
                  }
                </ol>
              } @else {
                <p class="muted">No test run yet. Press Test run.</p>
              }
            </div>
          </div>
        }
      </aside>
    </div>
    <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-6);
    }
    .title-badge {
      margin-inline-start: var(--space-2);
      vertical-align: middle;
    }
    .publish {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
    }
    .layout {
      display: grid;
      grid-template-columns: 15rem minmax(0, 1fr) 18rem;
      gap: var(--space-4);
      align-items: start;
      margin-top: var(--space-5);
    }
    .palette-body {
      display: grid;
      gap: var(--space-4);
    }
    .palette-title,
    .links-title {
      margin: 0 0 var(--space-2);
      color: var(--text-secondary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      letter-spacing: var(--tracking-caps);
      text-transform: uppercase;
    }
    .palette-list {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .palette-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-2);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--surface-raised);
      color: var(--text-primary);
      font: inherit;
      text-align: start;
      cursor: grab;
    }
    .palette-item:hover {
      border-color: var(--border-strong);
      background: var(--surface-hover);
    }
    .palette-item:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .palette-icon {
      display: grid;
      flex: none;
      place-items: center;
      width: var(--control-h-sm);
      height: var(--control-h-sm);
      border-radius: var(--radius-sm);
      background: color-mix(in oklab, var(--tone) 14%, transparent);
      color: var(--tone);
    }
    .palette-item[data-tone="accent"] {
      --tone: var(--accent);
    }
    .palette-item[data-tone="warning"] {
      --tone: var(--warning-text);
    }
    .palette-item[data-tone="success"] {
      --tone: var(--success-text);
    }
    .palette-item[data-tone="chart-1"] {
      --tone: var(--chart-1);
    }
    .palette-item[data-tone="chart-2"] {
      --tone: var(--chart-2);
    }
    .palette-item[data-tone="chart-3"] {
      --tone: var(--chart-3);
    }
    .palette-item[data-tone="chart-4"] {
      --tone: var(--chart-4);
    }
    .palette-item[data-tone="chart-5"] {
      --tone: var(--chart-5);
    }
    .palette-text {
      display: grid;
      flex: 1;
      min-width: 0;
    }
    .palette-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .palette-hint {
      overflow: hidden;
      color: var(--text-secondary);
      font-size: var(--font-size-xs);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .palette-plus {
      color: var(--text-tertiary);
    }
    .canvas {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }
    .canvas-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }
    .canvas-title {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .flow {
      --sone-flow-h: 36rem;
    }
    .inspector-body {
      display: grid;
      gap: var(--space-4);
    }
    .muted {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .facts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
      margin: 0;
    }
    .facts dt {
      color: var(--text-secondary);
      font-size: var(--font-size-xs);
    }
    .facts dd {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .log {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .log-line {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
    }
    .log-icon {
      color: var(--text-secondary);
    }
    .log-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: var(--text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .log-detail {
      color: var(--text-secondary);
      font-size: var(--font-size-xs);
    }
    .num {
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 1180px) {
      .layout {
        grid-template-columns: 14rem minmax(0, 1fr);
      }
      .inspector {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 760px) {
      :host {
        padding: var(--space-4);
      }
      .layout {
        grid-template-columns: minmax(0, 1fr);
      }
      .palette-body {
        grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      }
      .flow {
        --sone-flow-h: 28rem;
      }
    }
  `,
})
export default class WorkflowTemplate {
  protected readonly flow = viewChild.required<SoneFlowComponent>("flow");

  protected readonly kinds = KINDS;
  protected readonly palette = PALETTE;
  protected readonly statusBadge = STATUS_BADGE;
  protected readonly statusText = STATUS_TEXT;
  protected readonly dockPositions: SegmentOption[] = [
    { value: "top", label: "Top" },
    { value: "bottom", label: "Bottom" },
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
  ];

  protected readonly nodes = signal<readonly Step[]>(SEED_NODES);
  protected readonly edges = signal<readonly SoneFlowEdge[]>(SEED_EDGES);
  protected readonly selectedNodes = signal<readonly string[]>([]);
  protected readonly selectedEdges = signal<readonly string[]>([]);
  protected readonly tool = signal<SoneFlowTool>("select");
  protected readonly dock = signal<DockPosition>("bottom");
  protected readonly minimap = signal(true);
  protected readonly active = signal(false);
  protected readonly running = signal(false);
  protected readonly log = signal<readonly LogLine[]>([]);
  protected readonly announcement = signal("");

  private readonly past = signal<readonly Snapshot[]>([]);
  private readonly future = signal<readonly Snapshot[]>([]);
  /** The state the next change is undone to. */
  private present: Snapshot = { nodes: SEED_NODES, edges: SEED_EDGES };
  private nextId = 1;
  private timers: ReturnType<typeof setTimeout>[] = [];

  protected readonly canUndo = computed(() => this.past().length > 0);
  protected readonly canRedo = computed(() => this.future().length > 0);

  protected readonly selectedStep = computed(() => {
    const ids = this.selectedNodes();
    return ids.length === 1
      ? (this.nodes().find((n) => n.id === ids[0]) ?? null)
      : null;
  });

  protected readonly triggerLabel = computed(
    () =>
      this.nodes()
        .filter((n) => KINDS[n.data!.kind].group === "Triggers")
        .map((n) => n.label)
        .join(", ") || "None",
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  protected linksOf(
    id: string,
  ): { edge: SoneFlowEdge; other: string; out: boolean }[] {
    const label = (nid: string) =>
      this.nodes().find((n) => n.id === nid)?.label ?? nid;
    return this.edges()
      .filter((e) => e.source === id || e.target === id)
      .map((e) => ({
        edge: e,
        out: e.source === id,
        other: label(e.source === id ? e.target : e.source),
      }));
  }

  // ── Editing ────────────────────────────────────────────────────────────────

  protected setTool(tool: DockTool): void {
    this.tool.set(tool);
  }

  /** Adds a step at a point (the middle of the view by default) and selects it. */
  protected add(kind: StepKind, at?: SoneFlowPoint): void {
    const flow = this.flow();
    const center = at ?? flow.visibleCenter();
    const id = `${kind}-${this.nextId++}`;
    const k = KINDS[kind];
    const node = step(
      id,
      kind,
      Math.round((center.x - 104) / 20) * 20,
      Math.round((center.y - 28) / 20) * 20,
      kind === "note" ? "Note" : k.label,
      kind === "note" ? "Write something…" : k.hint,
    );
    this.nodes.update((list) => [...list, node]);
    this.selectedNodes.set([id]);
    this.selectedEdges.set([]);
    this.record();
    this.announcement.set(`${k.label} added.`);
    // Focus after the node renders.
    setTimeout(() => flow.focusNode(id));
  }

  protected onConnect(c: SoneFlowConnection): void {
    const source = this.nodes().find((n) => n.id === c.source);
    const branch =
      source?.data?.kind === "condition"
        ? c.sourcePort === "yes"
          ? { label: "Yes", tone: "success" as const }
          : { label: "No", tone: "danger" as const }
        : {};
    this.edges.update((list) => [
      ...list,
      { id: `e-${this.nextId++}`, ...c, ...branch },
    ]);
    this.record();
  }

  protected unlink(edgeId: string): void {
    this.edges.update((list) => list.filter((e) => e.id !== edgeId));
    this.record();
  }

  protected rename(id: string, label: string): void {
    this.patch(id, (n) => ({ ...n, label: label.trim() || n.label }));
  }

  protected describe(id: string, description: string): void {
    this.patch(id, (n) => ({ ...n, description }));
  }

  protected configure(id: string, key: string, value: string): void {
    this.patch(id, (n) => ({
      ...n,
      // A note shows its text on the canvas.
      description: n.data!.kind === "note" ? value : n.description,
      data: { ...n.data!, config: { ...n.data!.config, [key]: value } },
    }));
  }

  private patch(id: string, fn: (n: Step) => Step): void {
    this.nodes.update((list) => list.map((n) => (n.id === id ? fn(n) : n)));
    this.record();
  }

  // ── History ────────────────────────────────────────────────────────────────

  /** Remembers the state before this change, for undo. */
  protected record(): void {
    const next = { nodes: this.nodes(), edges: this.edges() };
    if (next.nodes === this.present.nodes && next.edges === this.present.edges)
      return;
    this.past.update((p) => [...p, this.present].slice(-HISTORY_LIMIT));
    this.future.set([]);
    this.present = next;
  }

  protected undo(): void {
    const past = this.past();
    const prev = past[past.length - 1];
    if (!prev) return;
    this.past.set(past.slice(0, -1));
    this.future.update((f) => [this.present, ...f]);
    this.restore(prev);
    this.announcement.set("Undone.");
  }

  protected redo(): void {
    const [next, ...rest] = this.future();
    if (!next) return;
    this.future.set(rest);
    this.past.update((p) => [...p, this.present]);
    this.restore(next);
    this.announcement.set("Redone.");
  }

  private restore(s: Snapshot): void {
    this.present = s;
    this.nodes.set(s.nodes);
    this.edges.set(s.edges);
    this.selectedNodes.set([]);
    this.selectedEdges.set([]);
  }

  // ── Drag from the palette ─────────────────────────────────────────────────

  protected onDragStart(e: DragEvent, kind: StepKind): void {
    e.dataTransfer?.setData(DRAG_TYPE, kind);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
  }

  protected onDragOver(e: DragEvent): void {
    if (e.dataTransfer?.types.includes(DRAG_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }

  protected onDrop(e: DragEvent): void {
    const kind = e.dataTransfer?.getData(DRAG_TYPE) as StepKind | undefined;
    if (!kind || !(kind in KINDS)) return;
    e.preventDefault();
    this.add(kind, this.flow().screenToFlow(e.clientX, e.clientY));
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  protected onShortcut(e: KeyboardEvent): void {
    const el = e.target as Element;
    if (el.closest("input, select, textarea, [contenteditable]")) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if (mod || e.altKey) return;
    // C belongs to the canvas (start a connection) when a step has focus.
    const keys: Record<string, () => void> = {
      v: () => this.setTool("select"),
      h: () => this.setTool("pan"),
      a: () => this.add("http"),
      d: () => this.add("condition"),
      n: () => this.add("note"),
    };
    const run = keys[e.key.toLowerCase()];
    if (run) {
      e.preventDefault();
      run();
    }
  }

  // ── Test run ───────────────────────────────────────────────────────────────

  /** Walks the steps from the trigger, one at a time, taking the "Yes" branch of a condition. */
  protected run(): void {
    if (this.running()) return;
    const nodes = this.nodes();
    const edges = this.edges();
    const trigger = nodes.find((n) => KINDS[n.data!.kind].group === "Triggers");
    this.clearStatus();
    this.log.set([]);
    this.selectedNodes.set([]);
    if (!trigger) {
      this.announcement.set("Add a trigger to run the workflow.");
      return;
    }
    const order: Step[] = [];
    const seen = new Set<string>();
    let current: Step | undefined = trigger;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      order.push(current);
      const from: string = current.id;
      const out = edges.filter((e) => e.source === from);
      const next: SoneFlowEdge | undefined =
        current.data!.kind === "condition"
          ? (out.find((e) => e.sourcePort === "yes") ?? out[0])
          : out[0];
      current = next && nodes.find((n) => n.id === next.target);
    }
    this.running.set(true);
    this.announcement.set("Test run started.");
    order.forEach((s, i) => {
      this.timers.push(
        setTimeout(() => {
          this.setStatus(s.id, "running");
          this.edges.update((list) =>
            list.map((e) => ({ ...e, animated: e.target === s.id })),
          );
        }, i * STEP_MS),
        setTimeout(
          () => {
            this.setStatus(s.id, "success");
            this.log.update((l) => [
              ...l,
              {
                id: s.id,
                label: s.label,
                icon: s.icon ?? "check",
                status: "success",
                detail: `${(0.12 + ((i * 37) % 50) / 100).toFixed(2)} s`,
              },
            ]);
            if (i === order.length - 1) this.finish(order.length);
          },
          i * STEP_MS + STEP_MS - 80,
        ),
      );
    });
  }

  private finish(count: number): void {
    this.running.set(false);
    this.edges.update((list) => list.map((e) => ({ ...e, animated: false })));
    this.announcement.set(`Test run finished: ${count} steps succeeded.`);
  }

  private setStatus(id: string, status: SoneFlowNodeStatus): void {
    this.nodes.update((list) =>
      list.map((n) => (n.id === id ? { ...n, status } : n)),
    );
  }

  private clearStatus(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.nodes.update((list) =>
      list.map((n) => (n.status ? { ...n, status: undefined } : n)),
    );
  }
}
