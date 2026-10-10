import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_TOGGLE_PARTS } from "./toggle-group.directive";

const RANGES = ["7 days", "30 days", "90 days", "All time"];
const SIZES = ["sm", "default", "lg"];
const VARIANTS = ["default", "outline"];
const LEVELS = [
  { key: "all", label: "All", count: 1284 },
  { key: "error", label: "Errors", count: 3 },
  { key: "warn", label: "Warnings", count: 41 },
  { key: "info", label: "Info", count: 902 },
  { key: "debug", label: "Debug", count: 338 },
];
const TAGS = [
  "All",
  "1:1",
  "standup",
  "hiring",
  "roadmap",
  "customer",
  "retro",
];

const grid = "display: grid; gap: var(--space-4); justify-items: start";
const row =
  "display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3)";
const caption =
  "font-size: var(--font-size-xs); color: var(--text-secondary); min-width: 7rem";

const meta: Meta = {
  title: "Components/Forms/Toggle group",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [...SONE_TOGGLE_PARTS, SoneIconComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Toggle, Toggle Group and Tabs. `soneToggleGroup` (`variant` default | outline, " +
          "`size` sm | default | lg, `spacing` in 4px steps — 0 joins the items, >0 separates them " +
          "into a wrapping filter row, `orientation` horizontal | vertical) + `soneToggleGroupItem " +
          "[pressed]`; a lone `soneToggle`; `soneTabsList` (`variant` default | line, `orientation`) + " +
          "`soneTabsTrigger [active]` (`icon` for a glyph-only tab). Arrow keys / Home / End move " +
          "focus between enabled items. Selection logic stays with the owner. ON = shadcn's neutral " +
          "`bg-muted` (Studio / Paper: accent tint, neutral label + accent glyph); active tab = " +
          "`bg-background` + `shadow-sm` (Studio / Paper: the shell's neutral pill).\n\n" +
          "Metrics are per shadcn STYLE (flip the Skin toolbar): toggles share the button scale " +
          "(Vega 32/36/40, Nova 28/32/36 with 0.8rem sm text, Maia pill px 12/12/16); a joined group " +
          "tightens its items to px-2 (Maia px-3). Tabs list is h-9 (Nova h-8) with 3px inset; " +
          "trigger px-2 (Nova px-1.5), its corner a step inside the list's (Maia rounded-xl in a " +
          'pill list, rounded-2xl when vertical). `<sone-icon inline="start">` tightens that edge.' +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/toggle-group](https://spartan.ng/components/toggle-group), " +
          "[https://spartan.ng/components/toggle](https://spartan.ng/components/toggle), " +
          "[https://spartan.ng/components/tabs](https://spartan.ng/components/tabs)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/toggle-group](https://ui.shadcn.com/docs/components/toggle-group), " +
          "[https://ui.shadcn.com/docs/components/toggle](https://ui.shadcn.com/docs/components/toggle), " +
          "[https://ui.shadcn.com/docs/components/tabs](https://ui.shadcn.com/docs/components/tabs)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Matrix: Story = {
  render: () => ({
    props: {
      value: signal(RANGES[1]),
      ranges: RANGES,
      sizes: SIZES,
      variants: VARIANTS,
    },
    template: `
      <div style="${grid}">
        @for (variant of variants; track variant) {
          @for (size of sizes; track size) {
            <div style="${row}">
              <span style="${caption}">{{ variant }} · {{ size }}</span>
              <div soneToggleGroup [variant]="$any(variant)" [size]="$any(size)" role="group" aria-label="Range">
                @for (r of ranges; track r) {
                  <button soneToggleGroupItem type="button" [pressed]="value() === r" (click)="value.set(r)">{{ r }}</button>
                }
              </div>
            </div>
          }
        }
      </div>`,
  }),
};

export const Spacing: Story = {
  render: () => ({
    props: {
      level: signal("all"),
      levels: LEVELS,
      tag: signal("All"),
      tags: TAGS,
    },
    template: `
      <div style="${grid}; max-width: 28rem">
        <div soneToggleGroup variant="outline" size="sm" spacing="2" role="group" aria-label="Filter by level">
          @for (l of levels; track l.key) {
            <button soneToggleGroupItem type="button" [pressed]="level() === l.key" (click)="level.set(l.key)">
              {{ l.label }} <span style="color: var(--text-secondary); font-size: var(--font-size-xs)">{{ l.count }}</span>
            </button>
          }
        </div>
        <div soneToggleGroup variant="outline" size="sm" spacing="2" role="group" aria-label="Filter meetings by tag">
          @for (t of tags; track t) {
            <button soneToggleGroupItem type="button" [pressed]="tag() === t" (click)="tag.set(t)">{{ t }}</button>
          }
        </div>
        <div soneToggleGroup spacing="1" role="group" aria-label="Range">
          @for (t of tags.slice(0, 4); track t) {
            <button soneToggleGroupItem type="button" [pressed]="tag() === t" (click)="tag.set(t)">{{ t }}</button>
          }
        </div>
      </div>`,
  }),
};

export const IconsAndVertical: Story = {
  render: () => {
    const on = signal<Record<string, boolean>>({
      lock: true,
      link: false,
      eye: true,
    });
    return {
      props: {
        on,
        flip: (k: string) => on.update((m) => ({ ...m, [k]: !m[k] })),
        view: signal("notes"),
      },
      template: `
      <div style="${row}; align-items: flex-start; gap: var(--space-6)">
        <div soneToggleGroup variant="outline" role="group" aria-label="Note options">
          @for (k of ['lock', 'link', 'eye']; track k) {
            <button soneToggleGroupItem type="button" [attr.aria-label]="k" [pressed]="on()[k]"
              (click)="flip(k)"><sone-icon [icon]="$any(k)" /></button>
          }
        </div>
        <div soneToggleGroup variant="outline" orientation="vertical" role="group" aria-label="View">
          @for (k of ['notes', 'meetings', 'tasks']; track k) {
            <button soneToggleGroupItem type="button" [pressed]="view() === k" (click)="view.set(k)">
              <sone-icon [icon]="$any(k)" /> {{ k }}
            </button>
          }
        </div>
        <div soneToggleGroup orientation="vertical" spacing="1" role="group" aria-label="View">
          @for (k of ['notes', 'meetings', 'tasks']; track k) {
            <button soneToggleGroupItem type="button" [pressed]="view() === k" (click)="view.set(k)">{{ k }}</button>
          }
        </div>
      </div>`,
    };
  },
};

export const States: Story = {
  render: () => ({
    props: { variants: VARIANTS },
    template: `
      <div style="${grid}">
        @for (variant of variants; track variant) {
          <div style="${row}">
            <span style="${caption}">{{ variant }}</span>
            <div soneToggleGroup [variant]="$any(variant)" role="group" aria-label="States">
              <button soneToggleGroupItem type="button">Off</button>
              <button soneToggleGroupItem type="button" pressed>On</button>
              <button soneToggleGroupItem type="button" disabled>Disabled</button>
              <button soneToggleGroupItem type="button" pressed disabled>On · disabled</button>
            </div>
            <button soneToggle [variant]="$any(variant)" type="button" aria-invalid="true">Invalid</button>
          </div>
        }
      </div>`,
  }),
};

export const Toggle: Story = {
  render: () => ({
    props: { on: signal(true), sizes: SIZES, variants: VARIANTS },
    template: `
      <div style="${grid}">
        @for (variant of variants; track variant) {
          <div style="${row}">
            <span style="${caption}">{{ variant }}</span>
            @for (size of sizes; track size) {
              <button soneToggle [variant]="$any(variant)" [size]="$any(size)" type="button"
                [pressed]="on()" (click)="on.set(!on())">Errors only</button>
              <button soneToggle [variant]="$any(variant)" [size]="$any(size)" type="button"
                [pressed]="on()" (click)="on.set(!on())"><sone-icon icon="lock" inline="start" /> Locked</button>
              <button soneToggle [variant]="$any(variant)" [size]="$any(size)" type="button" aria-label="Lock"
                [pressed]="!on()" (click)="on.set(!on())"><sone-icon icon="lock" /></button>
            }
          </div>
        }
      </div>`,
  }),
};

export const Tabs: Story = {
  render: () => ({
    props: {
      tab: signal("note"),
      tabs: ["note", "transcript", "audio"],
      side: signal("settings"),
    },
    template: `
      <div style="${grid}">
        @for (variant of ['default', 'line']; track variant) {
          <div soneTabsList [variant]="$any(variant)" role="tablist" aria-label="Meeting">
            @for (t of tabs; track t) {
              <button soneTabsTrigger role="tab" type="button" [active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
            }
            <button soneTabsTrigger role="tab" type="button" disabled>Locked</button>
          </div>
          <div soneTabsList [variant]="$any(variant)" role="tablist" aria-label="Meeting">
            <button soneTabsTrigger role="tab" type="button" [active]="tab() === 'note'" (click)="tab.set('note')"><sone-icon icon="notes" inline="start" /> Note</button>
            <button soneTabsTrigger role="tab" type="button" [active]="tab() === 'transcript'" (click)="tab.set('transcript')"><sone-icon icon="document" inline="start" /> Transcript</button>
            <button soneTabsTrigger role="tab" type="button" [active]="tab() === 'audio'" (click)="tab.set('audio')"><sone-icon icon="pulse" inline="start" /> Audio</button>
          </div>
          <div soneTabsList [variant]="$any(variant)" role="tablist" aria-label="Panel">
            <button soneTabsTrigger icon role="tab" type="button" aria-label="Note" [active]="tab() === 'note'" (click)="tab.set('note')"><sone-icon icon="notes" /></button>
            <button soneTabsTrigger icon role="tab" type="button" aria-label="Transcript" [active]="tab() === 'transcript'" (click)="tab.set('transcript')"><sone-icon icon="document" /></button>
            <button soneTabsTrigger icon role="tab" type="button" aria-label="Audio" [active]="tab() === 'audio'" (click)="tab.set('audio')"><sone-icon icon="pulse" /></button>
          </div>
        }
        <div style="${row}; align-items: flex-start">
          @for (variant of ['default', 'line']; track variant) {
            <div soneTabsList [variant]="$any(variant)" orientation="vertical" role="tablist" aria-label="Settings">
              @for (s of ['settings', 'people', 'lock']; track s) {
                <button soneTabsTrigger role="tab" type="button" [active]="side() === s" (click)="side.set(s)">
                  <sone-icon [icon]="$any(s)" inline="start" /> {{ s }}
                </button>
              }
            </div>
          }
        </div>
        <nav soneTabsList variant="line" aria-label="Task status">
          <button soneTabsTrigger type="button" active>Open</button>
          <button soneTabsTrigger type="button">Done</button>
          <button soneTabsTrigger type="button">All</button>
        </nav>
      </div>`,
  }),
};

export const Dashed: Story = {
  render: () => {
    const pick = signal("existing");
    return {
      props: { pick },
      template: `
        <div soneToggleGroup variant="dashed" size="sm" spacing="2" role="group" aria-label="Destination">
          <button soneToggleGroupItem type="button" [pressed]="pick() === 'existing'" (click)="pick.set('existing')">Existing folder</button>
          <button soneToggleGroupItem type="button" [pressed]="pick() === 'new'" (click)="pick.set('new')">New folder</button>
        </div>`,
    };
  },
};

export const StretchedTabs: Story = {
  render: () => {
    const kind = signal("folder");
    return {
      props: { kind },
      template: `
        <div style="max-width: 24rem">
          <div soneTabsList stretch aria-label="Kind">
            <button soneTabsTrigger type="button" [active]="kind() === 'folder'" (click)="kind.set('folder')">Folder</button>
            <button soneTabsTrigger type="button" [active]="kind() === 'workspace'" (click)="kind.set('workspace')">Workspace</button>
          </div>
        </div>`,
    };
  },
};
