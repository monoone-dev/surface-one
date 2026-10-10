import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent, type ShellIcon } from "./icon.component";

const GLYPHS: Record<ShellIcon, true> = {
  "index-one": true,
  record: true,
  meetings: true,
  notes: true,
  reminders: true,
  tasks: true,
  dashboards: true,
  analytics: true,
  graph: true,
  people: true,
  ivy: true,
  ask: true,
  settings: true,
  search: true,
  spaces: true,
  "shared-ivys": true,
  browse: true,
  "layout-grid": true,
  sparkles: true,
  history: true,
  plus: true,
  "note-add": true,
  folder: true,
  "folder-add": true,
  move: true,
  rename: true,
  edit: true,
  eye: true,
  trash: true,
  unlock: true,
  check: true,
  "chevron-right": true,
  sidebar: true,
  topbar: true,
  sun: true,
  moon: true,
  display: true,
  document: true,
  drift: true,
  numbers: true,
  pulse: true,
  promises: true,
  lock: true,
  developer: true,
  logs: true,
  link: true,
  close: true,
  copy: true,
  refresh: true,
  "bell-plus": true,
  "bell-ring": true,
  "list-checks": true,
  radio: true,
  "layout-template": true,
  download: true,
  printer: true,
  "audio-lines": true,
  share: true,
  "move-horizontal": true,
  star: true,
  "alert-circle": true,
  "shopping-cart": true,
  "shopping-bag": true,
  heart: true,
  truck: true,
  minus: true,
  sliders: true,
  tag: true,
  package: true,
  "credit-card": true,
  bug: true,
  bookmark: true,
  "square-check": true,
  zap: true,
  "arrow-up": true,
  "arrow-down": true,
  "arrow-right": true,
  "chevrons-up": true,
  "chevrons-down": true,
  equal: true,
  "message-square": true,
  ellipsis: true,
  user: true,
  "mouse-pointer": true,
  hand: true,
  square: true,
  circle: true,
  diamond: true,
  type: true,
  "zoom-in": true,
  "zoom-out": true,
  fit: true,
  "git-branch": true,
  play: true,
  pause: true,
  webhook: true,
  mail: true,
  clock: true,
  undo: true,
  redo: true,
  "sticky-note": true,
  workflow: true,
  map: true,
  code: true,
  database: true,
  globe: true,
  spline: true,
  "circle-check": true,
  "circle-x": true,
};
const ICONS = Object.keys(GLYPHS) as ShellIcon[];

const meta: Meta<SoneIconComponent> = {
  title: "Components/Data display/Icon",
  component: SoneIconComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-icon>` — one inline-SVG glyph from the shell icon set (no icon font, no package). " +
          "Glyphs draw in `currentColor`, so they take the colour of their context. The set lives in " +
          "exactly one place: add a glyph to the `ShellIcon` union and its `@case`, never inline an " +
          "SVG in a feature.\n\n" +
          "`size` follows spartan's `hlmIcon` names — `xs` 12 · `sm` 16 · `base` 24 · `lg` 32 · `xl` 48; " +
          "omit it and the context decides (20px in nav chrome, 16px inside `soneBtn` / `soneMenuItem`, " +
          "12px at xs). Give `label` only when the icon is the sole carrier of its meaning — it then " +
          'becomes `role="img"` with that name; otherwise it stays `aria-hidden`.',
      },
    },
  },
  argTypes: {
    icon: { control: "select", options: ICONS },
    size: {
      control: "inline-radio",
      options: [null, "xs", "sm", "base", "lg", "xl"],
    },
    label: { control: "text" },
    inline: { control: "inline-radio", options: [null, "start", "end"] },
  },
  args: { icon: "index-one", size: null, label: null, inline: null },
};
export default meta;
type Story = StoryObj<SoneIconComponent>;

export const Default: Story = {};

export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { icons: ICONS },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: var(--space-2)">
        @for (name of icons; track name) {
          <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
                      padding: var(--space-3); border: 1px solid var(--border-subtle);
                      border-radius: var(--radius-md); color: var(--text-primary)">
            <sone-icon [icon]="name" />
            <code style="font-size: var(--font-size-2xs); color: var(--text-tertiary)">{{ name }}</code>
          </div>
        }
      </div>`,
  }),
};

export const Tinted: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-4)">
        <span style="color: var(--accent)"><sone-icon icon="record" /></span>
        <span style="color: var(--live)"><sone-icon icon="record" /></span>
        <span style="color: var(--danger)"><sone-icon icon="trash" /></span>
        <span style="color: var(--text-tertiary)"><sone-icon icon="lock" /></span>
      </div>`,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [SoneButtonDirective] })],
  render: () => ({
    props: { sizes: ["xs", "sm", "base", "lg", "xl"] },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-5); color: var(--text-primary)">
        <div style="display: flex; align-items: flex-end; gap: var(--space-5)">
          @for (s of sizes; track s) {
            <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2)">
              <sone-icon icon="ivy" [size]="$any(s)" />
              <code style="font-size: var(--font-size-2xs); color: var(--text-tertiary)">{{ s }}</code>
            </div>
          }
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-3)">
          <button soneBtn size="xs" type="button"><sone-icon icon="plus" /> xs</button>
          <button soneBtn size="sm" variant="outline" type="button"><sone-icon icon="refresh" /> sm</button>
          <button soneBtn variant="secondary" type="button"><sone-icon icon="copy" /> default</button>
          <button soneBtn variant="ghost" size="icon-xs" type="button" aria-label="Close"><sone-icon icon="close" /></button>
          <button soneBtn variant="ghost" size="icon" type="button" aria-label="Search"><sone-icon icon="search" /></button>
        </div>
      </div>`,
  }),
};

export const Inline: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [SoneButtonDirective] })],
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-3)">
        <button soneBtn variant="outline" type="button"><sone-icon icon="plus" inline="start" /> New note</button>
        <button soneBtn variant="outline" type="button">Next <sone-icon icon="chevron-right" inline="end" /></button>
        <button soneBtn variant="outline" type="button"><sone-icon icon="plus" /> No inline</button>
      </div>`,
  }),
};

export const Labelled: Story = { args: { icon: "lock", label: "Locked" } };

/**
 * Regression: `sone-icon` is `display: contents`, so an unsized icon used to collapse
 * to 0 × 0 in a shrink-to-fit parent. Each box below must show a 20px glyph
 * (`--icon-size`) — a centred flex column, `place-items: center` grid and inline-flex.
 */
export const CenteringContexts: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-4); color: var(--text-primary)">
        <div data-testid="flex-column" style="display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: var(--space-3); border: 1px dashed var(--border)">
          <sone-icon icon="lock" />
        </div>
        <div data-testid="grid-center" style="display: grid; place-items: center;
                    padding: var(--space-3); border: 1px dashed var(--border)">
          <sone-icon icon="alert-circle" />
        </div>
        <span data-testid="inline-flex" style="display: inline-flex; align-items: center;
                     padding: var(--space-3); border: 1px dashed var(--border)">
          <sone-icon icon="notes" />
        </span>
      </div>`,
  }),
};
