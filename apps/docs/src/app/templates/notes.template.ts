import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneAudioPlayerComponent } from "@surface-one/angular/audio-player";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneMarkdownComponent } from "@surface-one/angular/markdown";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import {
  SONE_PAGE_ACTIONS_PARTS,
  SonePageActionsComponent,
} from "@surface-one/angular/page-actions";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import {
  SoneTranscriptComponent,
  foldTranscriptTurns,
  type TranscriptSegment,
} from "@surface-one/angular/transcript";

/** A silent, zero-length WAV inlined as a data URI: no network request, nothing to play. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

const SEGMENTS: TranscriptSegment[] = [
  {
    id: 0,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 0,
    endS: 7,
    text: "Thanks for joining. Let's lock the Harbor launch plan today.",
  },
  {
    id: 1,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 7,
    endS: 14,
    text: "I'd like to move the date to October 18 to give billing a full week.",
  },
  {
    id: 2,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 14,
    endS: 23,
    text: "That works. I can freeze the release branch on the 14th and run the migration dry run on the 15th.",
  },
  {
    id: 3,
    speakerKey: "mina",
    speaker: "Mina Sato",
    tone: "others",
    startS: 23,
    endS: 31,
    text: "I'll own the launch checklist and share a draft in Friday's sync.",
  },
  {
    id: 4,
    speakerKey: "mina",
    speaker: "Mina Sato",
    tone: "others",
    startS: 31,
    endS: 37,
    text: "Who is covering support during launch week?",
  },
  {
    id: 5,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 37,
    endS: 45,
    text: "Still open. Leo, can you propose a rota by Wednesday?",
  },
  {
    id: 6,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 45,
    endS: 52,
    text: "Sure, I'll draft it and ask the support leads to review.",
  },
  {
    id: 7,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 52,
    endS: 60,
    text: "Great. Last item: the pricing page screenshots still need updating.",
  },
];

const NOTES = `Harbor launch moves to **October 18**. The extra week gives the billing migration a full dry run before the release freeze.

#### Decisions

- Launch date set to **October 18**.
- Release branch freezes on **October 14**.
- The announcement stays in draft until QA signs off.

#### Action items

- [ ] Leo Ruiz — propose a launch-week support rota by Wednesday
- [ ] Mina Sato — share the launch checklist draft on Friday
- [x] Ada Park — confirm the new date with marketing

#### Open questions

1. Who updates the pricing page screenshots?
2. Do we need a status page entry for the migration window?`;

@Component({
  selector: "docs-notes-template",
  imports: [
    ...SONE_CARD_PARTS,
    ...SONE_MENU_PARTS,
    ...SONE_PAGE_ACTIONS_PARTS,
    ...SONE_PAGE_HEADER_PARTS,
    SoneAudioPlayerComponent,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneMarkdownComponent,
    SonePageActionsComponent,
    SoneTranscriptComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div sonePageHeader>
      <div sonePageHeaderContent>
        <p sonePageHeaderEyebrow>Meeting · Oct 2 · 42 min</p>
        <h2 sonePageHeaderTitle>Harbor launch — weekly sync</h2>
        <p sonePageHeaderDescription>
          Ada Park, Leo Ruiz and Mina Sato · Product
        </p>
      </div>
      <div sonePageHeaderActions>
        <sone-page-actions
          status="Edited 2 min ago"
          label="More actions"
          tooltip="More actions"
        >
          <span sonePageActionsLead>
            <button
              soneBtn
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Favorite"
              [attr.aria-pressed]="starred()"
              (click)="starred.set(!starred())"
            >
              <sone-icon icon="star" />
            </button>
          </span>
          <div soneMenuGroup>
            <button soneMenuItem type="button" role="menuitem">
              <sone-icon icon="link" /> Copy link
            </button>
            <button soneMenuItem type="button" role="menuitem">
              <sone-icon icon="share" /> Share
            </button>
            <button soneMenuItem type="button" role="menuitem">
              <sone-icon icon="download" /> Export as Markdown
            </button>
          </div>
          <div soneMenuGroup>
            <button soneMenuItem type="button" role="menuitem">
              <sone-icon icon="refresh" /> Regenerate notes
            </button>
            <button
              soneMenuItem
              variant="destructive"
              type="button"
              role="menuitem"
            >
              <sone-icon icon="trash" /> Move to Trash
            </button>
          </div>
        </sone-page-actions>
      </div>
    </div>

    <div soneCard size="sm" class="player">
      <div soneCardContent>
        <sone-audio-player
          [src]="audioSrc"
          (timeUpdate)="currentTime.set($event)"
        />
      </div>
    </div>

    <div class="columns">
      <div class="column" role="group" aria-labelledby="notes-summary">
        <div class="column-head">
          <h3 id="notes-summary">Summary</h3>
          <span soneBadge variant="secondary"
            ><sone-icon icon="sparkles" size="xs" /> Generated</span
          >
        </div>
        <sone-markdown [source]="notes" />
      </div>

      <div class="column" role="group" aria-labelledby="notes-transcript">
        <div class="column-head">
          <h3 id="notes-transcript">Transcript</h3>
          <input
            type="search"
            class="search"
            aria-label="Filter transcript"
            placeholder="Filter…"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
        </div>
        <sone-transcript
          [turns]="turns"
          [currentTime]="currentTime()"
          [query]="query()"
          (seek)="currentTime.set($event)"
        />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-6);
    }
    .player {
      margin-bottom: var(--space-6);
    }
    .columns {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: var(--space-6);
      align-items: start;
    }
    .column {
      display: grid;
      gap: var(--space-3);
      min-width: 0;
    }
    .column-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      min-height: var(--space-7);
    }
    .column-head h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
    }
    .search {
      width: 12rem;
      max-width: 60%;
    }
    @media (max-width: 720px) {
      :host {
        padding: var(--space-4);
      }
      .columns {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export default class Template {
  protected readonly audioSrc = SILENT_WAV;
  protected readonly notes = NOTES;
  protected readonly turns = foldTranscriptTurns(SEGMENTS);

  protected readonly currentTime = signal(14);
  protected readonly query = signal("");
  protected readonly starred = signal(false);
}
