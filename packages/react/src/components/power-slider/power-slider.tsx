"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from "react";

import { useControllable } from "@surface-one/core/react/controllable";

import { cx, flag } from "../../utils/part";

export interface PowerRung {
  id: string;
  name: string;
}

export interface SonePowerSliderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "defaultValue"
> {
  readonly rungs?: readonly PowerRung[];
  readonly ariaLabel?: string | null;
  /** The committed rung's `id` (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  /** A rung was committed: on release, a key or Page Up / Page Down — never mid-drag. */
  readonly onValueChange?: (id: string) => void;
  readonly disabled?: boolean;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-power-slider>` — a stepped range over named rungs ("Battery saver" … "Maximum").
 * Dragging only previews; the value commits once, on release, a key or Page Up / Page
 * Down — so dragging past the end never stores every rung on the way.
 */
export function SonePowerSlider({
  rungs = [],
  ariaLabel = null,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  disabled = false,
  ...rest
}: SonePowerSliderProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [preview, setPreview] = useState<number | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  const maxIndex = Math.max(0, rungs.length - 1);
  const committedIndex = rungs.findIndex((r) => r.id === value);
  const offLadder = committedIndex < 0;
  const activeIndex = preview ?? Math.max(0, committedIndex);
  const fillFraction = maxIndex <= 0 ? 1 : activeIndex / maxIndex;

  const clamp = (index: number): number =>
    Number.isFinite(index)
      ? Math.min(Math.max(Math.round(index), 0), maxIndex)
      : 0;
  const commit = (index: number): void => {
    const rung = rungs[index];
    setPreview(null);
    if (rung) setValue(rung.id);
  };
  // React's onChange fires on every `input`; the commit listens to the native `change`.
  const commitRef = useRef(commit);
  commitRef.current = commit;
  const clampRef = useRef(clamp);
  clampRef.current = clamp;
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const onChange = (): void =>
      commitRef.current(clampRef.current(Number(el.value)));
    el.addEventListener("change", onChange);
    return () => el.removeEventListener("change", onChange);
  }, []);
  // Disabling mid-drag drops the preview: the thumb goes back to the committed rung.
  useEffect(() => {
    if (disabled) setPreview(null);
  }, [disabled]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (disabled) return;
    const step = e.key === "PageUp" ? 1 : e.key === "PageDown" ? -1 : 0;
    if (step === 0) return;
    e.preventDefault();
    commit(clamp(activeIndex + step));
  };

  return createElement(
    "sone-power-slider",
    {
      "data-slot": "power-slider",
      "data-orientation": "horizontal",
      "data-disabled": flag(disabled),
      ...rest,
    },
    <div className={cx("ps-wrap", disabled && "is-disabled")}>
      <div
        className="ps-track"
        data-slot="power-slider-track"
        aria-hidden="true"
      >
        <span
          className="ps-fill"
          data-slot="power-slider-range"
          style={{ "--ps-frac": fillFraction } as CSSProperties}
        />
        {rungs.map((r, i) => (
          <span
            key={r.id}
            className={cx(
              "ps-notch",
              i <= activeIndex && !offLadder && "is-reached",
            )}
            style={
              {
                "--ps-frac": maxIndex > 0 ? i / maxIndex : 0,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <input
        ref={input}
        className="sone-range ps-input"
        data-slot="power-slider-thumb"
        type="range"
        min="0"
        step="1"
        max={maxIndex}
        value={activeIndex}
        disabled={disabled}
        aria-label={ariaLabel ?? undefined}
        aria-valuetext={rungs[activeIndex]?.name ?? ""}
        onChange={(e) => {
          // The native `change` (release) already committed; only `input` previews.
          if (e.nativeEvent.type === "change") return;
          setPreview(clamp(Number(e.currentTarget.value)));
        }}
        onKeyDown={onKeyDown}
      />
      <div
        className="ps-labels"
        data-slot="power-slider-labels"
        aria-hidden="true"
      >
        {rungs.map((r, i) => (
          <span
            key={r.id}
            className={cx(
              "ps-label",
              i === activeIndex && !offLadder && "is-active",
            )}
          >
            {r.name}
          </span>
        ))}
      </div>
    </div>,
  );
}
