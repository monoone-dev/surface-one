import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  SoneBadgeDirective,
  SoneBadgeRemoveDirective,
  type BadgeVariant,
} from "./badge.directive";

/** A status-to-variant map as an app would write one (example data only). */
function meetingStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "RECORDING":
      return "live";
    case "ERROR":
      return "destructive";
    case "TRANSCRIBED":
    case "SUMMARIZED":
    case "QUEUED":
      return "accent";
    case "EXPORTED":
      return "success";
    default:
      return "outline";
  }
}

function meetingStatusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const SPARTAN: readonly BadgeVariant[] = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
];
const STATUS: readonly BadgeVariant[] = [
  "success",
  "warning",
  "accent",
  "live",
];
const ALL: readonly BadgeVariant[] = [...SPARTAN, ...STATUS];

const CHECK = `<svg data-icon="inline-start" viewBox="0 0 16 16" fill="none" stroke="currentColor"
  stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>`;
const ARROW = `<svg data-icon="inline-end" viewBox="0 0 16 16" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>`;

const ROW =
  "display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2)";
const GRID = "display: grid; gap: var(--space-3)";
const CAPTION =
  "color: var(--text-tertiary); font-size: var(--font-size-xs); min-width: 7rem";

interface BadgeArgs {
  variant: BadgeVariant;
  label: string;
  dot: boolean;
}

const meta: Meta<BadgeArgs> = {
  title: "Components/Data display/Badge",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneBadgeDirective,
        SoneBadgeRemoveDirective,
        SoneIconComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneBadge]` — status, count or tag. spartan/ui `hlmBadge` " +
          "(https://spartan.ng/components/badge): one 20px size, 12px medium text, and the six " +
          "spartan variants. SurfaceOne adds four status tints (`success`, `warning`, `accent`, " +
          '`live`). Anatomy: `<span class="badge-dot">` (leading status dot), ' +
          '`<span class="badge-label">` (ellipsizes a long label), and an edge glyph marked ' +
          '`data-icon="inline-start|inline-end"`, and `button[soneBadgeRemove]` — the remove button of a tag chip ' +
          '(glyph inside, `aria-label="Remove {tag}"`). As `<a>`/`<button>` it gets hover + focus ring; ' +
          "`aria-invalid` draws the destructive border. Meeting rows map a backend status with " +
          "`meetingStatusBadgeVariant()` from `shared/util/meeting-status.ts`.\n\n" +
          "The badge is the same in shadcn's Vega / Nova / Maia (h-5, px-2, pill); only Maia gives " +
          "`outline` a ground (`bg-input/30`), exposed as `--badge-outline-bg`. On a `<sone-icon>` the " +
          'edge marker is `inline="start|end"` (its `data-icon` names the glyph).\n\n' +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/badge](https://spartan.ng/components/badge)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/badge](https://ui.shadcn.com/docs/components/badge)",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ALL },
    label: { control: "text" },
    dot: { control: "boolean" },
  },
  args: { variant: "default", label: "Badge", dot: false },
  render: (args) => ({
    props: args,
    template: `<span soneBadge [variant]="variant">@if (dot) {<span class="badge-dot"></span>}{{ label }}</span>`,
  }),
};
export default meta;
type Story = StoryObj<BadgeArgs>;

export const Default: Story = {};
export const WithDot: Story = {
  args: { variant: "success", label: "Exported", dot: true },
};

export const SpartanVariants: Story = {
  render: () => ({
    props: { variants: SPARTAN },
    template: `
      <div style="${ROW}">
        @for (v of variants; track v) { <span soneBadge [variant]="v">{{ v }}</span> }
      </div>`,
  }),
};

export const StatusTints: Story = {
  render: () => ({
    props: { variants: STATUS },
    template: `
      <div style="${ROW}">
        @for (v of variants; track v) { <span soneBadge [variant]="v"><span class="badge-dot"></span>{{ v }}</span> }
      </div>`,
  }),
};

export const Matrix: Story = {
  render: () => ({
    props: { variants: ALL },
    template: `
      <div style="${GRID}">
        @for (v of variants; track v) {
          <div style="${ROW}">
            <span style="${CAPTION}">{{ v }}</span>
            <span soneBadge [variant]="v">Badge</span>
            <span soneBadge [variant]="v"><span class="badge-dot"></span>Status</span>
            <span soneBadge [variant]="v">${CHECK}Verified</span>
            <span soneBadge [variant]="v">Open${ARROW}</span>
            <span soneBadge [variant]="v">7</span>
            <span soneBadge [variant]="v">128</span>
          </div>
        }
      </div>`,
  }),
};

export const Counts: Story = {
  render: () => ({
    template: `
      <div style="${GRID}">
        <div style="${ROW}">
          <span soneBadge variant="secondary">3</span>
          <span soneBadge variant="secondary">42</span>
          <span soneBadge variant="destructive">128</span>
          <span soneBadge variant="default">99+</span>
          <span soneBadge variant="outline">1,204</span>
        </div>
        <div style="display: grid; justify-items: end; gap: var(--space-1); width: 4rem">
          <span soneBadge variant="secondary">111</span>
          <span soneBadge variant="secondary">888</span>
        </div>
      </div>`,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <div style="${ROW}">
        <span soneBadge variant="secondary">${CHECK}Verified</span>
        <span soneBadge variant="outline">Bookmark${ARROW}</span>
        <span soneBadge variant="success">${CHECK}Exported</span>
        <span soneBadge variant="accent">${CHECK}Transcribed</span>
      </div>`,
  }),
};

export const AsLinkOrButton: Story = {
  render: () => ({
    props: { variants: ALL },
    template: `
      <div style="${GRID}">
        <div style="${ROW}">
          @for (v of variants; track v) {
            <a soneBadge [variant]="v" href="#" (click)="$event.preventDefault()">{{ v }}</a>
          }
        </div>
        <div style="${ROW}">
          @for (v of variants; track v) {
            <button soneBadge type="button" [variant]="v">{{ v }}</button>
          }
        </div>
        <div style="${ROW}">
          <span style="${CAPTION}">disabled</span>
          <button soneBadge type="button" variant="outline" disabled>Disabled</button>
          <button soneBadge type="button" variant="default" disabled>Disabled</button>
          <span style="${CAPTION}">aria-invalid</span>
          <span soneBadge variant="outline" aria-invalid="true">Unknown tag</span>
          <span soneBadge variant="secondary" aria-invalid="true">Duplicate</span>
        </div>
      </div>`,
  }),
};

export const Truncation: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-2); width: 12rem; padding: var(--space-2);
                  border: 1px dashed var(--border-strong); border-radius: var(--radius-sm)">
        <span soneBadge variant="secondary">
          <span class="badge-label">Quarterly planning with the platform team</span>
        </span>
        <span soneBadge variant="accent">
          <span class="badge-dot"></span><span class="badge-label">Transcribed · Weekly design review and retro</span>
        </span>
        <span soneBadge variant="outline">
          ${CHECK}<span class="badge-label">anna.kowalska@example.com</span>
        </span>
      </div>`,
  }),
};

const STATUSES = [
  "RECORDING",
  "QUEUED",
  "TRANSCRIBED",
  "SUMMARIZED",
  "EXPORTED",
  "ERROR",
  "UNKNOWN",
];

export const MeetingStatuses: Story = {
  render: () => ({
    props: {
      rows: STATUSES.map((s) => ({
        status: s,
        variant: meetingStatusBadgeVariant(s),
        label: meetingStatusLabel(s),
      })),
    },
    template: `
      <div style="${ROW}">
        @for (r of rows; track r.status) {
          <span soneBadge [variant]="r.variant"><span class="badge-dot"></span>{{ r.label }}</span>
        }
      </div>`,
  }),
};

export const OnSurfaces: Story = {
  render: () => ({
    props: { variants: ALL },
    template: `
      <div style="${GRID}">
        <div style="${ROW}; padding: var(--space-3); background: var(--surface-base)">
          @for (v of variants; track v) { <span soneBadge [variant]="v">{{ v }}</span> }
        </div>
        <div class="card" style="${ROW}; padding: var(--space-3)">
          @for (v of variants; track v) { <span soneBadge [variant]="v">{{ v }}</span> }
        </div>
        <div style="${ROW}; padding: var(--space-3); background: var(--surface-overlay);
                    border: 1px solid var(--border-strong); border-radius: var(--radius-md)">
          @for (v of variants; track v) { <span soneBadge [variant]="v">{{ v }}</span> }
        </div>
      </div>`,
  }),
};

export const Removable: Story = {
  render: () => ({
    props: { variants: ["secondary", "outline", "accent", "default"] },
    template: `
      <div style="${ROW}">
        @for (v of variants; track v) {
          <span soneBadge [variant]="v">
            {{ v }}
            <button soneBadgeRemove [attr.aria-label]="'Remove ' + v"><sone-icon icon="close" /></button>
          </span>
        }
        <span soneBadge variant="secondary">
          disabled
          <button soneBadgeRemove disabled aria-label="Remove disabled"><sone-icon icon="close" /></button>
        </span>
      </div>`,
  }),
};
