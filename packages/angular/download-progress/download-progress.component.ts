import {
  ChangeDetectionStrategy,
  booleanAttribute,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { pct } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SoneProgressComponent,
  type SoneProgressSize,
} from "@surface-one/angular/progress";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

@Component({
  selector: "sone-download-progress",
  imports: [SoneButtonDirective, SoneProgressComponent, SoneSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./download-progress.component.html",
  styleUrl: "./download-progress.component.scss",
  host: {
    "data-slot": "download-progress",
    "[attr.data-state]": "state()",
    "[attr.data-size]": "size()",
  },
})
export class SoneDownloadProgressComponent {
  readonly frac = input<number | null>(null);

  readonly label = input($localize`Downloading…`);

  readonly separator = input(" ");

  readonly ariaLabel = input<string | null>(null);

  readonly size = input<SoneProgressSize>("sm");

  readonly cancellable = input(false, { transform: booleanAttribute });

  readonly cancelLabel = input($localize`Cancel download`);

  readonly cancelRequested = output<void>();

  readonly value = computed(() => {
    const f = this.frac();
    return f === null || f === undefined ? null : f * 100;
  });

  readonly percent = computed(() => {
    const f = this.frac();
    if (f === null || f === undefined || !Number.isFinite(f)) return null;
    return f > 0 || !this.label() ? pct(f) : null;
  });

  readonly caption = computed(() => {
    const label = this.label();
    const percent = this.percent();
    if (!percent) return label;
    return label ? `${label}${this.separator()}${percent}` : percent;
  });

  readonly state = computed<"indeterminate" | "loading" | "complete">(() => {
    const f = this.frac();
    if (f === null || f === undefined) return "indeterminate";
    return f >= 1 ? "complete" : "loading";
  });

  onCancel(): void {
    this.cancelRequested.emit();
  }
}
