"use client";

import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "@surface-one/core/react/controllable";
import { cx } from "../../utils/part";

/** One step of a `SoneStepper`. `key` must be unique. */
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

/** What `onStepClick` receives: the clicked step and its index. */
export interface SoneStepClick {
  readonly index: number;
  readonly step: SoneStep;
}

export interface SoneStepperProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "aria-label"
> {
  readonly ref?: Ref<HTMLElement>;
  readonly steps?: readonly SoneStep[];
  /** The active step's index (controlled). */
  readonly current?: number;
  /** The active step's index at first (uncontrolled). */
  readonly defaultCurrent?: number;
  readonly onCurrentChange?: (index: number) => void;
  readonly onStepClick?: (click: SoneStepClick) => void;
  readonly variant?: StepperVariant;
  readonly orientation?: StepperOrientation;
  /** Only the steps up to the current one can be clicked. */
  readonly linear?: boolean;
  /** Read-only: no buttons at all. */
  readonly disabled?: boolean;
  readonly showCount?: boolean;
  /** The group's accessible name (default: the "Progress" message; `null` for none). */
  readonly "aria-label"?: string | null;
}

const CHECK = (
  <svg viewBox="0 0 20 20" fill="none">
    <path
      d="m4.5 10 3.4 3.4 7.6-7.6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NO_STEPS: readonly SoneStep[] = [];

/**
 * `<sone-stepper>` — progress through a multi-step flow; `current` (controlled, with
 * `onCurrentChange`) or `defaultCurrent` is the active step's index (as in
 * @surface-one/angular).
 */
export function SoneStepper({
  steps = NO_STEPS,
  current: currentProp,
  defaultCurrent = 0,
  onCurrentChange,
  onStepClick,
  variant = "dots",
  orientation = "horizontal",
  linear = false,
  disabled = false,
  showCount = true,
  "aria-label": ariaLabel,
  ...rest
}: SoneStepperProps): ReactElement {
  const messages = useSoneMessages();
  const [current, setCurrent] = useControllable(
    currentProp,
    defaultCurrent,
    onCurrentChange,
  );
  const n = steps.length;
  const c = Math.trunc(current);
  const index =
    n === 0 || !Number.isFinite(c) ? 0 : Math.min(Math.max(c, 0), n - 1);
  const stateOf = (i: number): StepState =>
    i < index ? "completed" : i === index ? "active" : "inactive";
  const canGo = (i: number): boolean => {
    const step = steps[i];
    if (!step || step.disabled || disabled) return false;
    return !linear || i <= index;
  };
  const go = (i: number): void => {
    if (!canGo(i)) return;
    setCurrent(i);
    onStepClick?.({ index: i, step: steps[i]! });
  };

  const body = (step: SoneStep, i: number) => (
    <>
      <span
        className="stepper-indicator"
        data-slot="stepper-indicator"
        aria-hidden="true"
      >
        {variant === "numbered"
          ? stateOf(i) === "completed"
            ? CHECK
            : String(i + 1)
          : undefined}
      </span>
      <span
        className={cx("stepper-text", variant === "dots" && "sr-only")}
        data-slot="stepper-text"
      >
        <span className="stepper-title" data-slot="stepper-title">
          {step.label}
        </span>
        {step.description ? (
          <span className="stepper-description" data-slot="stepper-description">
            {step.description}
          </span>
        ) : null}
      </span>
    </>
  );

  const interactive = !disabled;
  const last = n - 1;
  return createElement(
    "sone-stepper",
    {
      role: "group",
      "data-slot": "stepper",
      "data-variant": variant,
      "data-orientation": orientation,
      "data-interactive": interactive ? "" : undefined,
      "aria-label":
        ariaLabel === undefined
          ? messages.stepperLabel
          : (ariaLabel ?? undefined),
      ...rest,
    },
    <ol className="stepper-list" data-slot="stepper-list">
      {steps.map((step, i) => (
        <li
          key={step.key}
          className="stepper-item"
          data-slot="stepper-item"
          data-state={stateOf(i)}
        >
          {interactive ? (
            <button
              type="button"
              className="stepper-trigger"
              data-slot="stepper-trigger"
              disabled={!canGo(i)}
              aria-current={i === index ? "step" : undefined}
              onClick={() => go(i)}
            >
              {body(step, i)}
            </button>
          ) : (
            <span
              className="stepper-trigger"
              data-slot="stepper-trigger"
              aria-current={i === index ? "step" : undefined}
            >
              {body(step, i)}
            </span>
          )}
          {variant === "numbered" && i < last ? (
            <span
              className="stepper-separator"
              data-slot="stepper-separator"
              aria-hidden="true"
            />
          ) : null}
        </li>
      ))}
    </ol>,
    showCount && n > 0 ? (
      <span className="stepper-count" data-slot="stepper-count">
        {messages.stepCount(index + 1, n)}
      </span>
    ) : null,
  );
}
