"use client";

import {
  createElement,
  useId,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

import { useControllable } from "../../utils/controllable";
import { flag } from "../../utils/part";

export interface SoneDisclosureProps extends HTMLAttributes<HTMLElement> {
  /** Shown or not, controlled with `onOpenChange` (the Vue `v-model:open`). */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly disabled?: boolean;
  /** Names the panel region; by default the trigger does. */
  readonly panelLabel?: string | null;
  /** The trigger's content (the Vue `#summary` slot). */
  readonly summary?: ReactNode;
  /** The panel. */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-disclosure>` — a show / hide section (one accordion item): `summary` is the
 * trigger, the children the panel. `open` / `defaultOpen` / `onOpenChange`.
 */
export function SoneDisclosure({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  panelLabel = null,
  summary,
  children,
  ...rest
}: SoneDisclosureProps): ReactElement {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const uid = `sone-disclosure-${useId()}`;
  const panelId = `${uid}-panel`;
  const triggerId = `${uid}-trigger`;
  const toggle = (): void => {
    if (!disabled) setOpen(!open);
  };
  const state = open ? "open" : "closed";
  return createElement(
    "sone-disclosure",
    rest,
    <div
      className="disc-wrap"
      data-slot="accordion-item"
      data-state={state}
      data-disabled={flag(disabled)}
    >
      <button
        type="button"
        className="disc-trigger"
        data-slot="accordion-trigger"
        data-state={state}
        id={triggerId}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <svg
          className="disc-chevron collapsible-icon"
          width="16"
          height="16"
          viewBox="0 0 12 12"
          data-slot="accordion-trigger-icon"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 2l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="disc-summary">{summary}</span>
      </button>
      <div
        className="disc-panel"
        data-slot="accordion-content"
        role="region"
        data-state={state}
        id={panelId}
        hidden={!open}
        aria-labelledby={panelLabel ? undefined : triggerId}
        aria-label={panelLabel ?? undefined}
      >
        {children}
      </div>
    </div>,
  );
}
