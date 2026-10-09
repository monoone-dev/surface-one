import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from "@angular/core";

/** One step of a `<sone-stepper>`. `key` is the `@for` track key and must be unique. */
export interface SoneStep {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  /** This step can never be clicked. */
  readonly disabled?: boolean;
}

export type StepperVariant = "dots" | "numbered";
export type StepperOrientation = "horizontal" | "vertical";
export type StepState = "completed" | "active" | "inactive";

/** What `(stepClick)` emits: the clicked step and its index. */
export interface SoneStepClick {
  readonly index: number;
  readonly step: SoneStep;
}

/**
 * Progress through a multi-step flow. `current` is the step INDEX, not its key:
 * "Step x of y", `linear` and the completed / active / inactive split are index
 * arithmetic, and a key is one `steps.findIndex()` away.
 */
@Component({
  selector: "sone-stepper",
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./stepper.component.html",
  styleUrl: "./stepper.component.scss",
  host: {
    role: "group",
    "data-slot": "stepper",
    "[attr.data-variant]": "variant()",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-interactive]": "interactive() ? '' : null",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class SoneStepperComponent {
  readonly steps = input<readonly SoneStep[]>([]);

  /** The active step's index (0-based); out-of-range values are clamped. */
  readonly current = model(0);

  /** `dots` — the compact onboarding progress; `numbered` — circles with labels. */
  readonly variant = input<StepperVariant>("dots");

  readonly orientation = input<StepperOrientation>("horizontal");

  /** Only completed steps and the active one can be clicked — never a later one. */
  readonly linear = input(false, { transform: booleanAttribute });

  /** Progress display only: the steps are not buttons. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** The visible "Step x of y" text. */
  readonly showCount = input(true, { transform: booleanAttribute });

  /** The group's accessible name. */
  readonly ariaLabel = input<string | null>($localize`Progress`);

  /** A user picked a step (`current` is already updated). */
  readonly stepClick = output<SoneStepClick>();

  readonly index = computed(() => {
    const n = this.steps().length;
    const c = Math.trunc(this.current());
    if (n === 0 || !Number.isFinite(c)) return 0;
    return Math.min(Math.max(c, 0), n - 1);
  });

  readonly interactive = computed(() => !this.disabled());

  readonly countText = computed(
    () =>
      $localize`Step ${this.index() + 1}:current: of ${this.steps().length}:total:`,
  );

  stateOf(i: number): StepState {
    const at = this.index();
    return i < at ? "completed" : i === at ? "active" : "inactive";
  }

  canGo(i: number): boolean {
    const step = this.steps()[i];
    if (!step || step.disabled || this.disabled()) return false;
    return !this.linear() || i <= this.index();
  }

  go(i: number): void {
    if (!this.canGo(i)) return;
    this.current.set(i);
    this.stepClick.emit({ index: i, step: this.steps()[i]! });
  }
}
