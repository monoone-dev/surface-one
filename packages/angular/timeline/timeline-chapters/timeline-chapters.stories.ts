import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneTimelineChaptersComponent } from "./timeline-chapters.component";
import { timelineHue } from "../timeline.types";

const meta: Meta = {
  title: "Components/Media/Timeline/Chapters",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneTimelineChaptersComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-timeline-chapters>` — a part of `<sone-timeline>`: the ribbon's chapters as clickable chips " +
          "(`seek` = the chapter start); `activeOrders` marks the ones under the playhead.",
      },
    },
  },
  render: () => ({
    props: {
      chapters: [
        { label: "Intro", startS: 0, dot: timelineHue(0).dot, order: 0 },
        {
          label: "Launch checklist",
          startS: 60,
          dot: timelineHue(1).dot,
          order: 1,
        },
        {
          label: "Pricing page",
          startS: 330,
          dot: timelineHue(2).dot,
          order: 2,
        },
      ],
      active: new Set([1]),
    },
    template: `<sone-timeline-chapters [chapters]="chapters" [activeOrders]="active" />`,
  }),
};
export default meta;
export const Default: StoryObj = {};
