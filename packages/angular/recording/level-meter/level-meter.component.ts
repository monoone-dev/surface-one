import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  selector: "sone-level-meter",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "level-meter",
    "aria-hidden": "true",
    "[style.--level]": "clampedLevel()",
  },
  templateUrl: "./level-meter.component.html",
  styleUrl: "./level-meter.component.scss",
})
export class SoneLevelMeterComponent {
  readonly level = input(0);
  readonly bars = input(30);

  protected readonly clampedLevel = computed(() => {
    const v = this.level();
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
  });
  protected readonly barIndexes = computed(() =>
    Array.from({ length: Math.max(0, Math.floor(this.bars())) }, (_, i) => i),
  );
}
