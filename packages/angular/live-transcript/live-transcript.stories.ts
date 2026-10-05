import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  type LiveTranscriptLine,
  SoneLiveTranscriptComponent,
} from "./live-transcript.component";
import { SONE_EMPTY_PARTS } from "@surface-one/angular/empty-state";

const LINES: LiveTranscriptLine[] = [
  {
    id: "l1",
    speaker: "Others",
    tone: "others",
    timeLabel: "0:04",
    final: true,
    text: "Morning! Can everyone see the roadmap doc?",
  },
  {
    id: "l2",
    speaker: "Me",
    tone: "me",
    timeLabel: "0:09",
    final: true,
    text: "Yes — I'm on the Q3 tab.",
  },
  {
    id: "l3",
    speaker: "Others",
    tone: "others",
    timeLabel: "0:15",
    final: true,
    flag: "Possible question",
    text: "Should we move the beta invite to next sprint?",
  },
  {
    id: "l4",
    speaker: "Me",
    tone: "me",
    timeLabel: "0:21",
    final: false,
    text: "I think we can keep it if the copy lands by",
  },
];

const meta: Meta = {
  title: "Components/Media/Live transcript",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneLiveTranscriptComponent, ...SONE_EMPTY_PARTS],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-live-transcript>` — the caption log of a recording in progress, built from the spartan " +
          "Message / Bubble / Marker parts like `<sone-transcript>` and the chat: every line aligned `start` " +
          "(a transcript is a record, not a two-sided chat) with a tone-tinted initials avatar, a " +
          '"Speaker · 0:14" header and a `muted` bubble; the partial last line is a shimmering marker, a ' +
          "flag a warning badge in the footer. The caller owns the window + follow " +
          "state: `lines`, `following` (hides “Jump to latest”), `canShowOlder`, `jumpLabel`; it reports " +
          "`showOlder`, `jumpToLatest`, `atBottomChange` and exposes `scrollToEnd()`. The empty state is projected.",
      },
    },
  },
  render: () => ({
    props: { lines: LINES },
    template: `<sone-live-transcript style="height: 360px; max-width: 360px" class="panel-card" [lines]="lines" />`,
  }),
};
export default meta;

export const Following: StoryObj = {};

export const ScrolledAway: StoryObj = {
  render: () => ({
    props: { lines: LINES },
    template: `
      <sone-live-transcript style="height: 360px; max-width: 360px" class="panel-card"
        [lines]="lines" [following]="false" [canShowOlder]="true" jumpLabel="2 new · 1 question" />`,
  }),
};

export const Empty: StoryObj = {
  render: () => ({
    template: `
      <sone-live-transcript style="height: 260px; max-width: 360px" class="panel-card" [lines]="[]">
        <div soneEmpty style="margin: auto 0">
          <strong soneEmptyTitle>Listening to the conversation…</strong>
          <span soneEmptyDescription>Me and Others will appear here automatically.</span>
        </div>
      </sone-live-transcript>`,
  }),
};
