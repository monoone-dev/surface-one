import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { SoneIconComponent } from "@surface-one/angular/icon";

import { SoneDockComponent } from "./dock.component";
import {
  SoneDockGroupDirective,
  SoneDockItemDirective,
  SoneDockSeparatorDirective,
} from "./dock-item.directive";

const TOOLS = `
  <div soneDockGroup="Tools">
    <button soneDockItem label="Select" shortcut="V" [active]="tool() === 'select'" (click)="tool.set('select')"><sone-icon icon="mouse-pointer" /></button>
    <button soneDockItem label="Hand" shortcut="H" [active]="tool() === 'hand'" (click)="tool.set('hand')"><sone-icon icon="hand" /></button>
    <button soneDockItem label="Rectangle" shortcut="R" [active]="tool() === 'rect'" (click)="tool.set('rect')"><sone-icon icon="square" /></button>
    <button soneDockItem label="Decision" shortcut="D" [active]="tool() === 'diamond'" (click)="tool.set('diamond')"><sone-icon icon="diamond" /></button>
    <button soneDockItem label="Connector" shortcut="C" [active]="tool() === 'line'" (click)="tool.set('line')"><sone-icon icon="spline" /></button>
    <button soneDockItem label="Text" shortcut="T" [active]="tool() === 'text'" (click)="tool.set('text')"><sone-icon icon="type" /></button>
  </div>
  <div soneDockSeparator></div>
  <button soneDockItem label="Undo" shortcut="Ctrl+Z"><sone-icon icon="undo" /></button>
  <button soneDockItem label="Redo" shortcut="Ctrl+Shift+Z" disabled><sone-icon icon="redo" /></button>`;

const meta: Meta<SoneDockComponent> = {
  title: "Components/Flow/Dock",
  component: SoneDockComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneDockItemDirective,
        SoneDockGroupDirective,
        SoneDockSeparatorDirective,
        SoneIconComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-dock>` — a toolbar of drawing tools docked to one edge of a canvas. `position` " +
          "(`top` | `bottom` | `left` | `right`) picks the edge and the direction, `align` where along it, " +
          "`floating` (default) pins it inside the nearest positioned ancestor. Tools are `button[soneDockItem]` " +
          "named by `label` (also the tooltip, with the `shortcut`, opening away from the edge); `[active]` makes one " +
          "a toggle (`aria-pressed`). `[soneDockGroup]` and `[soneDockSeparator]` structure it. A WAI-ARIA toolbar: one " +
          "Tab stop, arrow keys along its direction, Home / End." +
          "\n\n**Reference**\n" +
          "- WAI-ARIA — [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)\n" +
          "- shadcn/ui — [Toggle Group](https://ui.shadcn.com/docs/components/toggle-group) (the look of the items)",
      },
    },
  },
  argTypes: {
    position: {
      control: "inline-radio",
      options: ["top", "bottom", "left", "right"],
    },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
  },
  args: { position: "bottom", align: "center", size: "default" },
  render: (args) => ({
    props: { ...args, tool: signal("select") },
    template: `<div style="position: relative; height: 26rem; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface-base)">
      <sone-dock [position]="position" [align]="align" [size]="size" ariaLabel="Drawing tools">${TOOLS}</sone-dock>
    </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneDockComponent>;

export const Bottom: Story = {};
export const Top: Story = { args: { position: "top" } };
export const Left: Story = { args: { position: "left" } };
export const Right: Story = { args: { position: "right", size: "sm" } };

export const Inline: Story = {
  render: () => ({
    props: { tool: signal("select") },
    template: `<sone-dock [floating]="false" ariaLabel="Drawing tools">${TOOLS}</sone-dock>`,
  }),
};
