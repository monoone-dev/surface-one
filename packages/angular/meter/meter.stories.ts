import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneProgressComponent } from "@surface-one/angular/progress";
import { SoneMeterComponent } from "./meter.component";

const meta: Meta<SoneMeterComponent> = {
  title: "Components/Data display/Meter",
  component: SoneMeterComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneProgressComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-meter>` — a segmented indicator for a COARSE, ordinal quantity (accuracy, speed) " +
          "where a percentage would be a lie. No spartan twin; it is `<sone-progress>` cut into segments " +
          "(same track, indicator and corner; label/detail are shadcn's progress label/value). Pip height is " +
          "`--meter-pip-h` (progress's height in Nova/Vega, 8px in Paper). Deliberately not a progressbar: the host carries " +
          '`role="img"` and announces one sentence (“Accuracy: 4 of 4”), never a number that reads ' +
          "as a percentage. `value` is clamped into `0..max`, `max` into `0..10`.",
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 10, step: 1 } },
    max: { control: { type: "range", min: 1, max: 10, step: 1 } },
    label: { control: "text" },
    detail: { control: "text" },
  },
  args: { label: "Accuracy", value: 3, max: 4, detail: "Same as Sharp" },
};
export default meta;
type Story = StoryObj<SoneMeterComponent>;

export const Default: Story = {};
export const WithoutDetail: Story = {
  args: { label: "Speed", value: 2, detail: null },
};

export const WithoutLabel: Story = {
  args: { label: "", value: 2, detail: null },
};

export const Levels: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-2)">
        <sone-meter label="Level" [value]="0" [max]="4" detail="empty" />
        <sone-meter label="Level" [value]="1" [max]="4" />
        <sone-meter label="Level" [value]="2" [max]="4" />
        <sone-meter label="Level" [value]="3" [max]="4" />
        <sone-meter label="Level" [value]="4" [max]="4" detail="full" />
        <sone-meter label="Clamped" [value]="9" [max]="4" detail="value 9 of 4 → 4 of 4" />
        <sone-meter label="Clamped" [value]="12" [max]="14" detail="max 14 → 10 pips" />
      </div>`,
  }),
};

export const ModelComparison: Story = {
  render: () => ({
    template: `
      <div class="card" style="display: grid; gap: var(--space-2); max-width: 360px; padding: var(--space-4)">
        <sone-meter label="Accuracy" [value]="4" [max]="4" detail="Best available" />
        <sone-meter label="Speed" [value]="2" [max]="4" />
        <sone-meter label="Battery" [value]="1" [max]="4" detail="Runs the fans" />
      </div>`,
  }),
};

export const WithProgress: Story = {
  render: () => ({
    template: `
      <div class="card" style="display: grid; gap: var(--space-3); max-width: 360px; padding: var(--space-4)">
        <sone-meter label="Accuracy" [value]="3" [max]="4" />
        <sone-progress [value]="60" ariaLabel="Model download" />
      </div>`,
  }),
};
