import type { Meta, StoryObj } from "@storybook/angular";

import { SoneDisclosureComponent } from "./disclosure.component";

const meta: Meta<SoneDisclosureComponent> = {
  title: "Components/Layout/Disclosure",
  component: SoneDisclosureComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-disclosure>` — the progressive-disclosure section (WAI-ARIA Disclosure). The trigger " +
          "is a real `<button>` with `aria-expanded` + `aria-controls`; the panel stays in the DOM and " +
          "toggles via `hidden`, so `aria-controls` never dangles. Two-way bind `[(open)]`. Project the " +
          "summary with the `soneDisclosureSummary` attribute. Anatomy = spartan accordion item " +
          "(`data-slot` accordion-item / -trigger / -trigger-icon / -content, `data-state` open|closed, " +
          'content `role="region"`). The host is `display: contents` on ' +
          "purpose — it must not add a box between a flex parent and the panel.\n\n" +
          "**Per skin** (toolbar → Skin): Minimalist = shadcn Nova Accordion item — no frame, " +
          "`text-sm font-medium` trigger that underlines on hover, the muted chevron at the end " +
          "turning down → up. Studio / Paper keep the framed disclosure (input ground + " +
          "hairline, leading chevron turning right → down) through theme tokens.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/accordion](https://spartan.ng/components/accordion)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/accordion](https://ui.shadcn.com/docs/components/accordion)",
      },
    },
  },
  argTypes: {
    open: { control: "boolean" },
    disabled: { control: "boolean" },
    panelLabel: { control: "text" },
    openChange: { action: "openChange" },
  },
  args: { open: false, disabled: false, panelLabel: "Advanced settings" },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); max-width: 480px">
        <sone-disclosure [(open)]="open" [disabled]="disabled" [panelLabel]="panelLabel" (openChange)="openChange($event)">
          <span soneDisclosureSummary>⚙ Advanced</span>
          <p style="margin: 0; color: var(--text-secondary)">
            Beam size, temperature fallback and the VAD threshold live here.
          </p>
        </sone-disclosure>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneDisclosureComponent>;

export const Collapsed: Story = {};
export const Expanded: Story = { args: { open: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOpen: Story = { args: { disabled: true, open: true } };

export const LongSummary: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 280px">
        <sone-disclosure [(open)]="open" panelLabel="Per-feature overrides">
          <span soneDisclosureSummary>⚙ Advanced — per-feature overrides &amp; all engines</span>
          <p style="margin: 0; color: var(--text-secondary)">Every feature can pick its own engine.</p>
        </sone-disclosure>
      </div>`,
  }),
};

export const Stacked: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); max-width: 480px">
        <sone-disclosure panelLabel="Transcription">
          <span soneDisclosureSummary>Transcription</span>
          <p style="margin: 0; color: var(--text-secondary)">Model size, language, VAD.</p>
        </sone-disclosure>
        <sone-disclosure [open]="true" panelLabel="Advanced AI settings">
          <span soneDisclosureSummary>Advanced AI settings</span>
          <p style="margin: 0; color: var(--text-secondary)">Temperature, context window, redaction.</p>
        </sone-disclosure>
        <sone-disclosure panelLabel="Storage">
          <span soneDisclosureSummary>Storage</span>
          <p style="margin: 0; color: var(--text-secondary)">Retention and the audio budget.</p>
        </sone-disclosure>
      </div>`,
  }),
};
