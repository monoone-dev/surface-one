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
          "`recording` (live + rounded square), `processing` (a turning ring, `aria-busy`). `size`: `default` " +
          "44 px, `sm` 40 px. A directive on the caller's own `<button>` (native events, `disabled`, class); " +
          "name it with `aria-label`.",
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
