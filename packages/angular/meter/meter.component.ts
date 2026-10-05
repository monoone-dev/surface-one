import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

/**
 * Not `<sone-progress>`: a relative rating with no unit announces a sentence
 * ("Accuracy: 4 of 4") instead of `aria-valuenow`, which would invite being
 * read as a percentage.
 */
@Component({
  selector: "sone-meter",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./meter.component.html",
  styleUrl: "./meter.component.scss",
  host: {
    role: "img",
    "data-slot": "meter",
    "[attr.aria-label]": "ariaText()",
  },
})
export class SoneMeterComponent {
  readonly label = input("");

  readonly value = input(0);

  readonly max = input(4);

  readonly detail = input<string | null>(null);

  readonly pips = computed(() => {
    const max = this.max();
    const n = Number.isFinite(max) ? Math.round(max) : 0;
    return Array.from({ length: Math.min(Math.max(n, 0), 10) }, (_, i) => i);
  });

  readonly filled = computed(() => {
    const v = this.value();
    if (!Number.isFinite(v)) return 0;
    return Math.min(Math.max(Math.round(v), 0), this.pips().length);
  });

  readonly ariaText = computed(() => {
    const count = $localize`${this.filled()}:filled: of ${this.pips().length}:max:`;
    const label = this.label().trim();
    const base = label ? `${label}: ${count}` : count;
    const detail = this.detail();
    return detail ? `${base}. ${detail}` : base;
  });
}
