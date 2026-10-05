import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type SoneProgressSize = "sm" | "md";

export type SoneProgressTone = "default" | "warning" | "destructive";

export type SoneProgressLabelFn = (value: number, max: number) => string;

const defaultValueLabel: SoneProgressLabelFn = (value, max) =>
  `${Math.round((value / max) * 100)}%`;

@Component({
  selector: "sone-progress",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./progress.component.html",
  styleUrl: "./progress.component.scss",
  host: {
    role: "progressbar",
    "data-slot": "progress",
    "[attr.data-state]": "state()",
    "[attr.data-size]": "size()",
    "[attr.data-tone]": "tone()",
    "[attr.data-value]": "indeterminate() ? null : valueNow()",
    "[attr.data-max]": "max()",
    "[attr.aria-label]": "ariaLabel()",
    "[attr.aria-valuemin]": "0",
    "[attr.aria-valuemax]": "max()",
    // Indeterminate MUST NOT carry aria-valuenow — its absence is the signal.
    "[attr.aria-valuenow]": "indeterminate() ? null : valueNow()",
    "[attr.aria-valuetext]": "valueText()",
  },
})
export class SoneProgressComponent {
  readonly value = input<number | null>(null);

  readonly max = input(100);

  readonly ariaLabel = input<string | null>(null);

  readonly size = input<SoneProgressSize>("sm");

  readonly tone = input<SoneProgressTone>("default");

  readonly valueLabel = input<SoneProgressLabelFn>(defaultValueLabel);

  readonly indeterminate = computed(
    () => this.value() === null || this.value() === undefined,
  );

  readonly state = computed<"indeterminate" | "loading" | "complete">(() => {
    if (this.indeterminate()) return "indeterminate";
    return this.fillPct() >= 100 ? "complete" : "loading";
  });

  readonly valueText = computed(() => {
    const max = this.max();
    if (this.indeterminate() || !Number.isFinite(max) || max <= 0) return null;
    return this.valueLabel()(this.valueNow(), max);
  });

  readonly valueNow = computed(() => {
    const raw = this.value();
    if (raw === null || !Number.isFinite(raw)) return 0;
    return Math.min(Math.max(raw, 0), Math.max(this.max(), 0));
  });

  readonly fillPct = computed(() => {
    const max = this.max();
    if (!Number.isFinite(max) || max <= 0) return 0;
    return (this.valueNow() / max) * 100;
  });
}
