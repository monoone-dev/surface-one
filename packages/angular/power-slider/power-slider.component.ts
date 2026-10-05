import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";

export interface PowerRung {
  id: string;
  name: string;
}

/**
 * Dragging fires `input` continuously (preview only); only `change` (release
 * / keyboard settle) commits `value` and `onChange` once — otherwise dragging
 * past the end would persist every rung on the way.
 */
@Component({
  selector: "sone-power-slider",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./power-slider.component.html",
  styleUrl: "./power-slider.component.scss",
  host: {
    "data-slot": "power-slider",
    "data-orientation": "horizontal",
    "[attr.data-disabled]": 'isDisabled() ? "" : null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SonePowerSliderComponent),
      multi: true,
    },
  ],
})
export class SonePowerSliderComponent implements ControlValueAccessor {
  readonly rungs = input<readonly PowerRung[]>([]);

  readonly ariaLabel = input<string | null>(null);

  readonly value = model("");

  readonly disabled = input(false);

  private readonly cvaDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly range =
    viewChild<ElementRef<HTMLInputElement>>("rangeInput");

  private readonly _preview = signal<number | null>(null);

  readonly maxIndex = computed(() => Math.max(0, this.rungs().length - 1));

  readonly committedIndex = computed(() =>
    this.rungs().findIndex((r) => r.id === this.value()),
  );

  readonly isOffLadder = computed(() => this.committedIndex() < 0);

  readonly activeIndex = computed(() => {
    const preview = this._preview();
    if (preview !== null) return preview;
    return Math.max(0, this.committedIndex());
  });

  readonly activeRung = computed<PowerRung | null>(
    () => this.rungs()[this.activeIndex()] ?? null,
  );

  readonly valueText = computed(() => this.activeRung()?.name ?? "");

  readonly fillFraction = computed(() => {
    const max = this.maxIndex();
    if (max <= 0) return 1;
    return this.activeIndex() / max;
  });

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // Disabling mid-drag is a NET-ZERO change to `activeIndex` (preview N →
  // commit N), so the `[value]` binding would never touch the element and
  // the DOM would stay at the abandoned position; write it directly instead.
  private readonly _revertOnDisable = effect(() => {
    if (!this.isDisabled()) return;
    const el = this.range()?.nativeElement;
    if (!el) return;
    untracked(() => {
      this._preview.set(null);
      el.value = String(Math.max(0, this.committedIndex()));
    });
  });

  writeValue(v: unknown): void {
    this.value.set(v == null ? "" : String(v));
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.cvaDisabled.set(d);
  }

  onInput(e: Event): void {
    this._preview.set(this.clamp(Number((e.target as HTMLInputElement).value)));
  }

  onChangeEvent(e: Event): void {
    this.commit(this.clamp(Number((e.target as HTMLInputElement).value)));
  }

  onKeydown(e: KeyboardEvent): void {
    if (this.isDisabled()) return;
    const step = e.key === "PageUp" ? 1 : e.key === "PageDown" ? -1 : 0;
    if (step === 0) return;
    e.preventDefault();
    this.commit(this.clamp(this.activeIndex() + step));
  }

  private commit(index: number): void {
    const rung = this.rungs()[index];
    this._preview.set(null);
    if (!rung) return;
    this.value.set(rung.id);
    this.onChange(rung.id);
    this.onTouched();
  }

  private clamp(index: number): number {
    if (!Number.isFinite(index)) return 0;
    return Math.min(Math.max(Math.round(index), 0), this.maxIndex());
  }
}
