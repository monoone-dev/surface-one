import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSpinnerComponent } from "@surface-one/angular/spinner";
import { SONE_MARKER_PARTS } from "./marker.directive";

const meta: Meta = {
  title: "Components/Chat/Marker",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [...SONE_MARKER_PARTS, SoneSpinnerComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '`[soneMarker]` — a status line in a thread ("Thinking…", "Searched 4 notes", "Listening…"). ' +
          "spartan/ui Marker, 1:1: `[soneMarker] [variant]` (`default` | `separator` | `border`), " +
          "`[soneMarkerIcon]` (a 16px, `aria-hidden` glyph slot) and `[soneMarkerContent]`. The global " +
          "`.shimmer` class sweeps a highlight across in-progress text (plain muted text under reduced " +
          "motion). `<sone-typing-indicator>` is a marker. CSS: `marker.css`.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://www.spartan.ng/components/marker](https://www.spartan.ng/components/marker)",
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-4); max-width: 480px">
        <div soneMarker>
          <span soneMarkerIcon><sone-spinner [size]="16" [label]="null" /></span>
          <span soneMarkerContent class="shimmer">Thinking…</span>
        </div>
        <div soneMarker>
          <span soneMarkerIcon>✓</span>
          <span soneMarkerContent>Searched 4 notes</span>
        </div>
        <div soneMarker variant="separator"><span soneMarkerContent>Conversation compacted</span></div>
        <div soneMarker variant="border"><span soneMarkerContent>Earlier today</span></div>
      </div>`,
  }),
};
export default meta;

export const Default: StoryObj = {};
