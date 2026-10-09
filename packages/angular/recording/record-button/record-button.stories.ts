import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneRecordButtonDirective } from "./record-button.directive";

const meta: Meta = {
  title: "Components/Recording/Record button",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneRecordButtonDirective] })],
  parameters: {
    docs: {
      description: {
        component:
          "`button[soneRecordButton]` — the round start / stop control. `state`: `idle` (accent + dot), " +
          "`recording` (live + rounded square), `paused` (a soft live fill with the dot — resume), `processing` " +
          "(a turning ring, `aria-busy`). `size`: `default` 44 px, `sm` 40 px. A directive on the caller's own " +
          "`<button>` (native events, `disabled`, class); name the round one with `aria-label`. `withLabel` turns " +
          "it into a pill — the glyph, then the button's own text (its accessible name).",
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-4); align-items: center">
        <button soneRecordButton type="button" aria-label="Start recording"></button>
        <button soneRecordButton state="recording" type="button" aria-label="Stop recording"></button>
        <button soneRecordButton state="processing" type="button" aria-label="Processing recording"></button>
        <button soneRecordButton size="sm" type="button" aria-label="Start recording"></button>
        <button soneRecordButton state="recording" size="sm" type="button" aria-label="Stop recording"></button>
        <button soneRecordButton type="button" disabled aria-label="Start recording"></button>
      </div>`,
  }),
};
export default meta;
export const States: StoryObj = {};

export const Paused: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-4); align-items: center">
        <button soneRecordButton state="paused" type="button" aria-label="Resume recording"></button>
        <button soneRecordButton state="paused" size="sm" type="button" aria-label="Resume recording"></button>
      </div>`,
  }),
};

export const WithLabel: StoryObj = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: center">
        <button soneRecordButton withLabel type="button">Start recording</button>
        <button soneRecordButton withLabel state="recording" type="button">Stop</button>
        <button soneRecordButton withLabel state="paused" type="button">Resume</button>
        <button soneRecordButton withLabel state="processing" type="button">Processing…</button>
        <button soneRecordButton withLabel size="sm" type="button">Record</button>
        <button soneRecordButton withLabel type="button" disabled>Start recording</button>
      </div>`,
  }),
};
