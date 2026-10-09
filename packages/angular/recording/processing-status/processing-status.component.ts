import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { processingStageLabel } from "@surface-one/angular/format";
import { SoneProgressComponent } from "@surface-one/angular/progress";

import {
  SoneStatusOrbComponent,
  type StatusOrbState,
} from "../status-orb/status-orb.component";

export type ProcessingStatusSize = "default" | "sm";

/**
 * `<sone-processing-status>` — where a recording is in the pipeline: the
 * processing orb, the stage label and a thin `<sone-progress>`. A polite live
 * region (`role="status"`), so a stage change is announced once.
 */
@Component({
  selector: "sone-processing-status",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneStatusOrbComponent, SoneProgressComponent],
  host: {
    role: "status",
    "data-slot": "processing-status",
    "[attr.data-stage]": "stage()",
    "[attr.data-size]": "size()",
  },
  templateUrl: "./processing-status.component.html",
  styleUrl: "./processing-status.component.scss",
})
export class SoneProcessingStatusComponent {
  /** `recording`, `transcribing`, `summarizing`, `exporting`, `saved`, `finalized`, `done`, `error` or your own. */
  readonly stage = input<string>("transcribing");
  /** Overrides for the built-in stage labels; an unknown stage shows itself capitalised. */
  readonly labels = input<Partial<Record<string, string>>>({});
  /** A live detail that replaces the stage label while it is non-empty (“Transcribing 3 of 7…”). */
  readonly message = input<string | null>(null);
  /** 0..1; `null` = indeterminate. */
  readonly progress = input<number | null>(null);
  /** Draw the progress track (off for a compact row status). */
  readonly showProgress = input(true, { transform: booleanAttribute });
  readonly size = input<ProcessingStatusSize>("default");

  protected readonly text = computed(
    () =>
      this.message()?.trim() ||
      processingStageLabel(this.stage(), this.labels()),
  );
  protected readonly failed = computed(() => this.stage() === "error");
  protected readonly orb = computed<StatusOrbState>(() =>
    this.failed() ? "error" : "processing",
  );
  protected readonly value = computed(() => {
    const p = this.progress();
    return p === null || p === undefined || !Number.isFinite(p)
      ? null
      : Math.min(1, Math.max(0, p)) * 100;
  });
}
