import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import {
  SoneTranscriptComponent,
  type TranscriptSegment,
  foldTranscriptTurns,
} from "@surface-one/angular/transcript";

const TEMPLATE = `<div class="demo-stack" style="max-width: 640px; width: 100%">
  <div soneField>
    <label soneFieldLabel for="transcript-demo-filter">Filter transcript</label>
    <input #filter id="transcript-demo-filter" type="search" placeholder="Try “friday”"
      [value]="query()" (input)="query.set(filter.value)" />
  </div>
  <sone-transcript
    [turns]="turns"
    [currentTime]="currentTime()"
    [query]="query()"
    (seek)="currentTime.set($event)"
  />
</div>`;

export const code = TEMPLATE;

const SEGMENTS: TranscriptSegment[] = [
  {
    id: 0,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 0,
    endS: 6,
    text: "Thanks for joining — let's go through the launch checklist.",
  },
  {
    id: 1,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 6,
    endS: 11,
    text: "First item is the onboarding copy.",
  },
  {
    id: 2,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 11,
    endS: 19,
    text: "The draft is in the shared folder. It still needs a legal pass.",
  },
  {
    id: 3,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 19,
    endS: 25,
    text: "I can take that. Friday works for me.",
  },
  {
    id: 4,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 25,
    endS: 32,
    text: "Great. Next up: the pricing page screenshots.",
  },
  {
    id: 5,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 32,
    endS: 40,
    text: "Those are waiting on the new plan names, so let's revisit on Friday.",
  },
];

@Component({
  selector: "docs-transcript-demo",
  imports: [SoneTranscriptComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TranscriptDemo {
  /** Consecutive segments from the same speaker fold into one turn. */
  readonly turns = foldTranscriptTurns(SEGMENTS);
  readonly currentTime = signal(14);
  readonly query = signal("");
}
