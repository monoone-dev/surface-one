import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { SONE_DOCK_PARTS } from "@surface-one/angular/dock";
import { SoneIconComponent } from "@surface-one/angular/icon";

import { SoneFlowComponent } from "./flow.component";
import { SoneFlowControlsComponent } from "./flow-controls.component";
import { SoneFlowMinimapComponent } from "./flow-minimap.component";
import {
  SoneFlowNodeTemplateDirective,
  SoneFlowPanelDirective,
} from "./flow-slots.directive";
import type { SoneFlowEdge, SoneFlowNode } from "./flow.types";

const NODES: SoneFlowNode[] = [
  {
    id: "start",
    x: 0,
    y: 92,
    label: "Start",
    shape: "pill",
    tone: "success",
    inputs: [],
  },
  {
    id: "form",
    x: 220,
    y: 74,
    label: "Sign-up form",
    description: "Email and password",
    icon: "edit",
    tone: "accent",
  },
  {
    id: "valid",
    x: 500,
    y: 54,
    label: "Valid?",
    shape: "diamond",
    outputs: ["yes", "no"],
  },
  {
    id: "save",
    x: 700,
    y: 0,
    label: "Create account",
    description: "users table",
    icon: "database",
    tone: "chart-5",
  },
  {
    id: "error",
    x: 700,
    y: 150,
    label: "Show errors",
    description: "Inline messages",
    icon: "alert-circle",
    tone: "danger",
  },
  {
    id: "end",
    x: 980,
    y: 18,
    label: "Done",
    shape: "pill",
    tone: "success",
    outputs: [],
  },
  {
    id: "note",
    x: 220,
    y: 220,
    label: "Note",
    description: "Errors loop back to the form.",
    shape: "note",
  },
];
const EDGES: SoneFlowEdge[] = [
  { id: "a", source: "start", target: "form" },
  { id: "b", source: "form", target: "valid" },
  {
    id: "c",
    source: "valid",
    sourcePort: "yes",
    target: "save",
    label: "Yes",
    tone: "success",
  },
  {
    id: "d",
    source: "valid",
    sourcePort: "no",
    target: "error",
    label: "No",
    tone: "danger",
  },
  { id: "e", source: "save", target: "end", animated: true },
  { id: "f", source: "error", target: "form", type: "step", dashed: true },
];

const meta: Meta<SoneFlowComponent> = {
  title: "Components/Flow/Flow",
  component: SoneFlowComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneFlowControlsComponent,
        SoneFlowMinimapComponent,
        SoneFlowNodeTemplateDirective,
        SoneFlowPanelDirective,
        SoneIconComponent,
        ...SONE_DOCK_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-flow>` — a node canvas for diagrams and workflows. Nodes (`card`, `pill`, `circle`, `diamond`, " +
          "`note`) sit at `x` / `y`; edges join their ports with a `bezier`, `step` or `straight` path, with a label, " +
          "a tone, dashes, an animation and an arrow. Drag the background to pan, Ctrl / ⌘ + wheel or a pinch to zoom, " +
          "drag a node to move it (`snapToGrid`), drag from a port dot — or click it, then a target — to connect. " +
          "`nodes`, `edges`, `viewport`, `selectedNodes` and `selectedEdges` are two-way. Keyboard: Tab between nodes, " +
          "arrows move, C starts a connection and Enter on another node ends it, Delete removes, + / − zoom; changes are " +
          "announced. `ng-template[soneFlowNode]` draws a custom node body; `<sone-flow-controls>`, " +
          "`<sone-flow-minimap>`, `[soneFlowPanel]` and a `<sone-dock>` sit on top." +
          "\n\n**Reference**\n" +
          "- React Flow / Vue Flow — the node, edge, handle, controls and minimap model\n" +
          "- shadcn/ui — the card look of the nodes",
      },
    },
  },
  argTypes: {
    edgeType: {
      control: "inline-radio",
      options: ["bezier", "step", "straight"],
    },
    background: {
      control: "inline-radio",
      options: ["dots", "lines", "cross", "none"],
    },
    direction: { control: "inline-radio", options: ["horizontal", "vertical"] },
    tool: { control: "inline-radio", options: ["select", "pan"] },
    snapToGrid: { control: "boolean" },
  },
  args: {
    edgeType: "bezier",
    background: "dots",
    direction: "horizontal",
    tool: "select",
    snapToGrid: false,
  },
  render: (args) => ({
    props: { ...args, nodes: signal(NODES), edges: signal(EDGES) },
    template: `<sone-flow style="--sone-flow-h: 32rem" ariaLabel="Sign-up flow" [edgeType]="edgeType"
      [background]="background" [direction]="direction" [tool]="tool" [snapToGrid]="snapToGrid"
      [(nodes)]="nodes" [(edges)]="edges">
      <sone-flow-controls showZoom />
      <sone-flow-minimap />
    </sone-flow>`,
  }),
};
export default meta;
type Story = StoryObj<SoneFlowComponent>;

export const Default: Story = {};

export const StepEdges: Story = {
  args: { edgeType: "step", background: "lines" },
};

export const Vertical: Story = {
  args: { direction: "vertical", edgeType: "step" },
  render: (args) => ({
    props: {
      ...args,
      nodes: signal<SoneFlowNode[]>([
        {
          id: "a",
          x: 0,
          y: 0,
          label: "Request",
          icon: "globe",
          tone: "chart-1",
        },
        {
          id: "b",
          x: 0,
          y: 140,
          label: "Authorise",
          icon: "lock",
          tone: "accent",
        },
        {
          id: "c",
          x: -120,
          y: 280,
          label: "Cache hit",
          icon: "zap",
          tone: "success",
        },
        {
          id: "d",
          x: 120,
          y: 280,
          label: "Database",
          icon: "database",
          tone: "chart-5",
        },
      ]),
      edges: signal<SoneFlowEdge[]>([
        { id: "1", source: "a", target: "b" },
        { id: "2", source: "b", target: "c" },
        { id: "3", source: "b", target: "d" },
      ]),
    },
    template: `<sone-flow style="--sone-flow-h: 30rem" ariaLabel="Request path" [direction]="direction"
      [edgeType]="edgeType" [(nodes)]="nodes" [(edges)]="edges"><sone-flow-controls /></sone-flow>`,
  }),
};

export const CustomNodes: Story = {
  render: () => ({
    props: {
      nodes: signal<SoneFlowNode<{ owner: string }>[]>([
        {
          id: "a",
          x: 0,
          y: 0,
          label: "Design",
          width: 180,
          data: { owner: "Ada" },
        },
        {
          id: "b",
          x: 260,
          y: 0,
          label: "Build",
          width: 180,
          data: { owner: "Leo" },
        },
        {
          id: "c",
          x: 520,
          y: 0,
          label: "Ship",
          width: 180,
          data: { owner: "Mina" },
        },
      ]),
      edges: signal<SoneFlowEdge[]>([
        { id: "1", source: "a", target: "b" },
        { id: "2", source: "b", target: "c" },
      ]),
    },
    template: `<sone-flow style="--sone-flow-h: 18rem" ariaLabel="Release" [(nodes)]="nodes" [(edges)]="edges">
      <ng-template soneFlowNode let-node let-selected="selected">
        <div style="display: grid; gap: var(--space-1)">
          <strong>{{ node.label }}</strong>
          <span style="color: var(--text-secondary); font-size: var(--font-size-xs)">Owner: {{ $any(node.data).owner }}{{ selected ? ' · selected' : '' }}</span>
        </div>
      </ng-template>
      <p soneFlowPanel="top-left" style="color: var(--text-secondary); font-size: var(--font-size-xs)">A custom node template</p>
    </sone-flow>`,
  }),
};

export const WithDock: Story = {
  render: () => ({
    props: {
      nodes: signal(NODES),
      edges: signal(EDGES),
      tool: signal<"select" | "pan">("select"),
    },
    template: `<sone-flow #flow style="--sone-flow-h: 32rem" ariaLabel="Sign-up flow" [tool]="tool()" [(nodes)]="nodes" [(edges)]="edges">
      <sone-dock position="left" size="sm" ariaLabel="Canvas tools">
        <button soneDockItem label="Select" shortcut="V" [active]="tool() === 'select'" (click)="tool.set('select')"><sone-icon icon="mouse-pointer" /></button>
        <button soneDockItem label="Pan" shortcut="H" [active]="tool() === 'pan'" (click)="tool.set('pan')"><sone-icon icon="hand" /></button>
        <div soneDockSeparator></div>
        <button soneDockItem label="Zoom in" (click)="flow.zoomIn()"><sone-icon icon="zoom-in" /></button>
        <button soneDockItem label="Zoom out" (click)="flow.zoomOut()"><sone-icon icon="zoom-out" /></button>
        <button soneDockItem label="Fit view" (click)="flow.fit()"><sone-icon icon="fit" /></button>
      </sone-dock>
      <sone-flow-minimap />
    </sone-flow>`,
  }),
};
