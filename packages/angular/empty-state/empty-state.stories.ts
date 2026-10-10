import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";
import { SONE_EMPTY_PARTS } from "./empty-parts.directive";
import { SoneEmptyStateComponent } from "./empty-state.component";

const meta: Meta<SoneEmptyStateComponent> = {
  title: "Components/Feedback/Empty",
  component: SoneEmptyStateComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneButtonDirective,
        SoneIconComponent,
        SoneSpinnerComponent,
        ...SONE_EMPTY_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-empty-state>` (or `[soneEmpty]`) — spartan/ui Empty. Anatomy: " +
          "`[soneEmptyHeader]` › `[soneEmptyMedia]` (`variant` = `default` | `icon`) / `[soneEmptyTitle]` / " +
          "`[soneEmptyDescription]`, then `[soneEmptyContent]` for actions. Import `SONE_EMPTY_PARTS`.\n\n" +
          "The legacy flat classes (`.empty-mark`, `.empty-title`, `.empty`) render identically and keep working.\n\n" +
          "**Composed mode.** Set `icon`, `title`, `description` and `tone` instead of projecting the header; " +
          "anything projected (`[soneEmptyContent]` actions, a `.text-hint` line) follows it. " +
          '`tone` = `default` | `locked` (icon defaults to `lock`) | `error` (`alert-circle`, `role="alert"`) | ' +
          '`loading` (a spinner replaces the media, `role="status"`); `busy` forces the loading state. ' +
          "The effective tone is exposed as `data-tone` on the host.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://www.spartan.ng/components/empty](https://www.spartan.ng/components/empty)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/empty](https://ui.shadcn.com/docs/components/empty)",
      },
    },
  },
  render: () => ({
    template: `
      <sone-empty-state>
        <div soneEmptyHeader>
          <div soneEmptyMedia variant="icon"><sone-icon icon="meetings" /></div>
          <h3 soneEmptyTitle>No meetings yet</h3>
          <p soneEmptyDescription>Hit record and the transcript appears here as you speak.</p>
        </div>
        <div soneEmptyContent>
          <!-- shadcn: content is a column; side-by-side actions get their own row. -->
          <div style="display: flex; gap: var(--space-2)">
            <button soneBtn type="button">Start recording</button>
            <button soneBtn variant="outline" type="button">Import audio</button>
          </div>
          <a href="#" class="text-muted" style="font-size: var(--font-size-sm)">Learn more</a>
        </div>
      </sone-empty-state>`,
  }),
};
export default meta;
type Story = StoryObj<SoneEmptyStateComponent>;

export const Default: Story = {};

export const MediaDefault: Story = {
  render: () => ({
    template: `
      <sone-empty-state>
        <div soneEmptyHeader>
          <div soneEmptyMedia><sone-icon icon="ivy" /></div>
          <h3 soneEmptyTitle>Your ivy is empty</h3>
          <p soneEmptyDescription>
            Record a meeting or write a note, then ask anything. <a href="#">How it works</a>
          </p>
        </div>
      </sone-empty-state>`,
  }),
};

export const InCard: Story = {
  render: () => ({
    template: `
      <div class="card state-card" style="max-width: 520px">
        <section soneEmpty>
          <div soneEmptyHeader>
            <div soneEmptyMedia variant="icon"><sone-icon icon="trash" /></div>
            <h3 soneEmptyTitle>Trash is empty</h3>
            <p soneEmptyDescription>Deleted meetings and notes stay here for 30 days.</p>
          </div>
        </section>
      </div>`,
  }),
};

export const Loading: Story = {
  render: () => ({
    template: `
      <sone-empty-state>
        <div soneEmptyHeader>
          <div soneEmptyMedia variant="icon"><sone-spinner label="Loading meetings" /></div>
          <h3 soneEmptyTitle>Loading meetings…</h3>
          <p soneEmptyDescription>Decrypting the library on this Mac.</p>
        </div>
        <div soneEmptyContent>
          <button soneBtn variant="outline" size="sm" type="button">Cancel</button>
        </div>
      </sone-empty-state>`,
  }),
};

export const LegacyClasses: Story = {
  render: () => ({
    template: `
      <sone-empty-state>
        <div class="empty-mark" aria-hidden="true"><sone-icon icon="notes" /></div>
        <p class="empty-title">No notes yet</p>
        <p class="empty">Notes you write, or that are drafted from a meeting, land here.</p>
        <button soneBtn type="button">New note</button>
      </sone-empty-state>`,
  }),
};

export const Composed: Story = {
  render: () => ({
    template: `
      <sone-empty-state
        icon="notes"
        title="No notes yet"
        description="Notes you write, or that are drafted from a meeting, land here."
      >
        <div soneEmptyContent>
          <button soneBtn type="button">New note</button>
        </div>
      </sone-empty-state>`,
  }),
};

export const ToneLocked: Story = {
  name: "Tone: locked",
  render: () => ({
    template: `
      <sone-empty-state
        tone="locked"
        title="This folder is locked"
        description="Its notes, transcripts and audio stay encrypted until you unlock it."
      >
        <div soneEmptyContent>
          <button soneBtn type="button">Unlock</button>
          <p class="text-hint">Touch ID or your Mac password unlocks it for this session.</p>
        </div>
      </sone-empty-state>`,
  }),
};

export const ToneError: Story = {
  name: "Tone: error",
  render: () => ({
    template: `
      <sone-empty-state
        tone="error"
        title="Couldn’t load meetings"
        description="The library didn’t open. Your recordings are safe on this Mac."
      >
        <div soneEmptyContent>
          <button soneBtn variant="outline" type="button">Try again</button>
        </div>
      </sone-empty-state>`,
  }),
};

export const ToneLoading: Story = {
  name: "Tone: loading",
  render: () => ({
    template: `
      <sone-empty-state
        tone="loading"
        title="Loading meetings…"
        description="Decrypting the library on this Mac."
      />`,
  }),
};

export const Busy: Story = {
  name: "Busy (any tone)",
  render: () => ({
    props: { busy: true },
    template: `
      <div style="display: grid; gap: var(--space-3); justify-items: start">
        <button soneBtn variant="outline" size="sm" type="button" (click)="busy = !busy">
          {{ busy ? "Finish loading" : "Load again" }}
        </button>
        <sone-empty-state
          icon="search"
          title="{{ busy ? 'Searching…' : 'No results' }}"
          description="Try a different word, or search every folder."
          [busy]="busy"
        />
      </div>`,
  }),
};

/** Regression: an unsized `sone-icon` in the default (unboxed) media of a centred column. */
export const MediaIconUnsized: Story = {
  name: "Media: unsized sone-icon",
  render: () => ({
    template: `
      <sone-empty-state>
        <div soneEmptyHeader>
          <div soneEmptyMedia><sone-icon icon="lock" /></div>
          <h3 soneEmptyTitle>Locked</h3>
          <p soneEmptyDescription>The icon keeps its size in a centred flex column.</p>
        </div>
      </sone-empty-state>`,
  }),
};
