import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneAudioPlayerComponent } from "./audio-player.component";

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

const meta: Meta = {
  title: "Components/Media/Audio player",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneAudioPlayerComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-audio-player>` — the slim recording player, on shadcn.io's Audio Player anatomy (one row: " +
          "a round default `icon` play button, a `soneButtonGroup` of outline `sm` skip buttons, time, " +
          "progress, duration, a ghost `sm` speed button; tabular muted times): play / pause, skip " +
          '±`skipSeconds`, the rate cycle (`rates`), and a `role="slider"` scrub track drawn with ' +
          "`<sone-slider>`'s tokens (click; ← / → by `keyStepSeconds`, Home / End, " +
          "Space / Enter toggles; `aria-valuetext` “1:23 of 45:00”).\n\n" +
          "Presentational: pass `src` (or `null` — nothing renders; a locked recording must never reach it). " +
          "Outputs: `timeUpdate`, `durationChange`, `playingChange`, `userSeek` (its own controls moved the " +
          "playhead), `playbackEnd`. Methods (via `viewChild`): `seekTo(s, { play? })` (plays by default; `{ play: false }` only moves the playhead), `pause()`, `togglePlay()`, " +
          "`stopAndUnload()`. The frame (card, padding, sticky) is the caller's.",
      },
    },
  },
  render: () => ({
    props: { src: SILENT_WAV },
    template: `
      <div class="panel-card" style="max-width: 560px; padding: var(--space-4) var(--space-5)">
        <sone-audio-player [src]="src" />
      </div>`,
  }),
};
export default meta;

export const Default: StoryObj = {};

export const CustomSteps: StoryObj = {
  render: () => ({
    props: { src: SILENT_WAV },
    template: `
      <div class="panel-card" style="max-width: 560px; padding: var(--space-4) var(--space-5)">
        <sone-audio-player [src]="src" [skipSeconds]="30" [rates]="[1, 1.5, 2, 3]" />
      </div>`,
  }),
};

export const NoSource: StoryObj = {
  render: () => ({
    template: `<sone-audio-player [src]="null" /><p class="text-muted">(nothing rendered)</p>`,
  }),
};
