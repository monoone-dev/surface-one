import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneTimelineComponent } from "./timeline.component";
import type { TimelineData, TimelineLaneSuggestion } from "./timeline.types";

const DATA: TimelineData = {
  blocks: [
    { lane: "Me", startS: 0, endS: 95 },
    { lane: "others-1", startS: 95, endS: 260 },
    { lane: "Me", startS: 260, endS: 310 },
    { lane: "Priya", startS: 310, endS: 520 },
    { lane: "others-1", startS: 520, endS: 610 },
    { lane: "Me", startS: 610, endS: 720 },
  ],
  chapters: [
    { label: "Intro", startS: 0, endS: 60 },
    { label: "Launch checklist", startS: 60, endS: 330 },
    { label: "Pricing page", startS: 330, endS: 560 },
    { label: "Next steps", startS: 560, endS: 720 },
  ],
};
const SUGGESTIONS: TimelineLaneSuggestion[] = [
  { lane: "others-1", label: "Jonas" },
];

const meta: Meta = {
  title: "Components/Media/Timeline",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneTimelineComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-timeline>` — lanes of blocks + a chapter ribbon on one time scale with one playhead, an axis, " +
          "hover-scrub, pin-this-moment, and loading / needs-generation / unavailable states. Pure CSS.\n\n" +
          "Inputs: `data` ({ blocks, chapters }), `total`, `currentTime`, `loading`, `error`, `needsGeneration`, " +
          "`suggestions` (lane → label), `labels` (copy overrides). Outputs: `seek`, `pin`, `renameLane` " +
          "(inline legend rename or an accepted suggestion), `retry`, `generate`. Parts: " +
          "`<sone-timeline-legend>`, `<sone-timeline-chapters>`.",
      },
    },
  },
  argTypes: {
    currentTime: { control: { type: "range", min: 0, max: 720, step: 5 } },
  },
  args: { currentTime: 290 },
  render: (args) => ({
    props: { ...args, data: DATA, suggestions: SUGGESTIONS },
    template: `<div style="max-width: 760px; padding-top: var(--space-6)"><sone-timeline [data]="data" [total]="760" [currentTime]="currentTime" [suggestions]="suggestions" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<{ currentTime: number }>;

export const Default: Story = {};
export const BeforePlayback: Story = { args: { currentTime: 0 } };

export const Loading: Story = {
  render: () => ({
    template: `<div style="max-width: 760px"><sone-timeline [loading]="true" /></div>`,
  }),
};
export const NeedsGeneration: Story = {
  render: () => ({
    template: `<div style="max-width: 760px"><sone-timeline [needsGeneration]="true" /></div>`,
  }),
};
export const Unavailable: Story = {
  render: () => ({
    template: `<div style="max-width: 760px"><sone-timeline [error]="true" /></div>`,
  }),
};

export const CustomLabels: Story = {
  render: () => ({
    props: {
      data: DATA,
      labels: {
        title: "Episode map",
        description: "Hosts and segments",
        lanes: "Hosts",
        chapters: "Segments",
      },
    },
    template: `<div style="max-width: 760px"><sone-timeline [data]="data" [total]="720" [currentTime]="100" [labels]="labels" /></div>`,
  }),
};
