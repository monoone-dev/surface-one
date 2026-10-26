import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SoneTabStripComponent,
  SoneTabStripTrailingDirective,
} from "./tab-strip.component";
import type { TabStripTab } from "./tab-strip-items";

const TABS: TabStripTab[] = [
  { id: "plan", label: "Release plan" },
  { id: "agent", label: "Agent run", status: "busy", note: "4 min" },
  { id: "review", label: "Review notes", status: "waiting", note: "waits" },
  { id: "deploy", label: "Deploy", status: "done" },
];

const meta: Meta = {
  title: "Components/Navigation/Tab strip",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneTabStripComponent, SoneTabStripTrailingDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-tab-strip>` — document tabs for a desktop window (the WAI-ARIA Tabs pattern): `tabs` " +
          "(`{ id, label, status?, note? }`), the selected one two-way as `[(active)]`. A status dot " +
          "(`busy` pulses, `waiting`, `done`, `error`) and a short note follow the label. `closable` " +
          "gives every tab a close button — a sibling of the tab, so the tab stays one control — and " +
          "`addable` a New tab button; `(close)` and `(add)` report them. ←/→, Home and End move " +
          "between tabs; Delete or ⌘W closes the focused one. `[soneTabStripTrailing]` sits at the end.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [tabs](https://spartan.ng/components/tabs)\n" +
          "- WAI-ARIA APG — [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: {
      tabs: TABS,
      active: "agent",
      remove(this: { tabs: TabStripTab[] }, id: string) {
        this.tabs = this.tabs.filter((t) => t.id !== id);
      },
    },
    template: `<sone-tab-strip ariaLabel="Documents" [tabs]="tabs" [(active)]="active"
      closable addable (close)="remove($event)" />
      <p style="color: var(--text-secondary)">active: {{ active }}</p>`,
  }),
};

export const Plain: Story = {
  render: () => ({
    props: {
      tabs: TABS.map(({ id, label }) => ({ id, label })),
      active: "plan",
    },
    template: `<sone-tab-strip ariaLabel="Documents" [tabs]="tabs" [(active)]="active">
      <span soneTabStripTrailing style="color: var(--text-secondary)">4 open</span>
    </sone-tab-strip>`,
  }),
};
