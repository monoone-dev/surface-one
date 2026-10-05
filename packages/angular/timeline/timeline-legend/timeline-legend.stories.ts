import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneTimelineLegendComponent } from "./timeline-legend.component";
import { timelineHue } from "../timeline.types";

const meta: Meta = {
  title: "Components/Media/Timeline/Legend",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneTimelineLegendComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-timeline-legend>` — a part of `<sone-timeline>`: one item per lane (dot, click-to-rename label, " +
          "an optional “Looks like …?” suggestion, total time). Both a rename and an accepted suggestion emit `rename`.",
      },
    },
  },
  render: () => ({
    props: {
      lanes: [
        { lane: "Me", hue: 0, dot: timelineHue(0).dot, totalS: 255 },
        { lane: "others-1", hue: 1, dot: timelineHue(1).dot, totalS: 255 },
        { lane: "Priya", hue: 2, dot: timelineHue(2).dot, totalS: 210 },
      ],
      suggestions: [{ lane: "others-1", label: "Jonas" }],
    },
    template: `<sone-timeline-legend [lanes]="lanes" [suggestions]="suggestions" />`,
  }),
};
export default meta;
export const Default: StoryObj = {};
