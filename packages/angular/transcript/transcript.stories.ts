import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneTranscriptComponent } from "./transcript.component";
import {
  type TranscriptSegment,
  foldTranscriptTurns,
} from "./transcript.types";

const SEGMENTS: TranscriptSegment[] = [
  {
    id: 0,
    speakerKey: "me",
    speaker: "Me",
    tone: "me",
    startS: 0,
    endS: 6,
    text: "Thanks for joining — let's go through the launch checklist.",
  },
  {
    id: 1,
    speakerKey: "me",
    speaker: "Me",
    tone: "me",
    startS: 6,
    endS: 11,
    text: "First item is the onboarding copy.",
  },
  {
    id: 2,
    speakerKey: "others",
    speaker: "Others",
    tone: "others",
    startS: 11,
    endS: 19,
    text: "The draft is in the shared folder, it still needs a legal pass.",
  },
  {
    id: 3,
    speakerKey: "others-1",
    speaker: "Speaker 2",
    tone: "others",
    startS: 19,
    endS: 27,
    text: "I can take that. Friday works for me.",
  },
  {
    id: 4,
    speakerKey: "me",
    speaker: "Me",
    tone: "me",
    startS: 27,
    endS: 33,
    text: "Great. Next: the pricing page screenshots.",
  },
  {
    id: 5,
    speakerKey: null,
    speaker: null,
    startS: 33,
    endS: 40,
    text: "(an unattributed line from a mic-only recording)",
  },
];
const TURNS = foldTranscriptTurns(SEGMENTS);

const LONG = foldTranscriptTurns(
  Array.from({ length: 400 }, (_, i) => ({
    id: i,
    speakerKey: i % 3 === 0 ? "me" : "others",
    speaker: i % 3 === 0 ? "Me" : "Others",
    tone: i % 3 === 0 ? "me" : "others",
    startS: i * 5,
    endS: i * 5 + 5,
    text: `Sentence number ${i + 1} of a long planning call.`,
  })),
);

const meta: Meta = {
  title: "Components/Media/Transcript",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneTranscriptComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-transcript>` — turn-grouped, click-to-seek transcript. spartan/ui has none; each turn is " +
          "built from the chat's parts — a `soneMessage` (aligned `start` for every speaker), a tone-tinted " +
          '`<sone-avatar size="sm">` with the speaker\'s initials, a `soneMessageHeader` "Speaker · 0:14" ' +
          "(the time seeks) and a `muted` `soneBubble`; the playing turn's bubble is `tinted`. Build `turns` with " +
          "`foldTranscriptTurns(segments)` (consecutive same-speaker segments, split every 16 fragments). " +
          "Inputs: `currentTime` (karaoke + follow), `query` (filter), `flashId` + `flashSeq` (a one-shot " +
          "pulse over one fragment), `seekable`, `renderCap` / `fragmentCap` (the bounded window; “Show all” " +
          "expands, `collapse()` resets). Outputs: `seek` (seconds), `flashEnd` (fragment id).",
      },
    },
  },
  argTypes: {
    currentTime: { control: { type: "range", min: 0, max: 40, step: 1 } },
    query: { control: "text" },
    seekable: { control: "boolean" },
  },
  args: { currentTime: 14, query: "", seekable: true },
  render: (args) => ({
    props: { ...args, turns: TURNS },
    template: `<div style="max-width: 640px"><sone-transcript [turns]="turns" [currentTime]="currentTime" [query]="query" [seekable]="seekable" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<{
  currentTime: number;
  query: string;
  seekable: boolean;
}>;

export const Default: Story = {};
export const Filtered: Story = { args: { query: "friday" } };
export const NoMatches: Story = { args: { query: "budget" } };
export const WithoutAudio: Story = {
  args: { seekable: false, currentTime: 0 },
};

export const Flash: Story = {
  render: () => ({
    props: { turns: TURNS },
    template: `<div style="max-width: 640px"><sone-transcript [turns]="turns" [currentTime]="20" [flashId]="3" [flashSeq]="1" /></div>`,
  }),
};

export const Long: Story = {
  render: () => ({
    props: { turns: LONG },
    template: `<div style="max-width: 640px"><sone-transcript [turns]="turns" [currentTime]="900" /></div>`,
  }),
};

export const Empty: Story = {
  render: () => ({
    template: `<div style="max-width: 640px"><sone-transcript [turns]="[]" /></div>`,
  }),
};
