import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneStatusOrbComponent } from "./status-orb.component";

const meta: Meta = {
  title: "Components/Recording/Status orb",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneStatusOrbComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-status-orb>` — the recording-status light: `ready` (a breathing ring), `live` (a warm pulse), " +
          "`processing` (the `<sone-spinner>` at the orb's size), `paused` (two warning bars), `queued` (a hollow " +
          "muted ring), `error` (a danger diamond) — every state differs in shape, not only colour. `size`: " +
          "`default` 14 px, `sm` 12 px. Decorative — always paired with text.",
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, auto 1fr); gap: var(--space-4); align-items: center; max-width: 520px; font-size: var(--font-size-sm)">
        <sone-status-orb state="ready" /><span>Ready</span>
        <sone-status-orb state="live" /><span>Recording · 12:04</span>
        <sone-status-orb state="processing" /><span>Transcribing…</span>
        <sone-status-orb state="paused" /><span>Paused</span>
        <sone-status-orb state="queued" /><span>Queued</span>
        <sone-status-orb state="error" /><span>Failed</span>
        <sone-status-orb state="ready" size="sm" /><span>sm</span>
        <sone-status-orb state="live" size="sm" /><span>sm</span>
        <sone-status-orb state="processing" size="sm" /><span>sm</span>
        <sone-status-orb state="paused" size="sm" /><span>sm</span>
        <sone-status-orb state="queued" size="sm" /><span>sm</span>
        <sone-status-orb state="error" size="sm" /><span>sm</span>
      </div>`,
  }),
};
export default meta;
export const States: StoryObj = {};
