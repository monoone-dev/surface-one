"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import {
  SoneButton,
  type ButtonSize,
  type ButtonVariant,
} from "../button/button";
import { SoneIcon } from "../icon/icon";

async function writeClipboard(value: string): Promise<void> {
  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard?.writeText) {
    await clipboard.writeText(value);
    return;
  }
  // No async Clipboard API (an insecure origin): the legacy copy command.
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("copy command refused");
}

export interface SoneCopyButtonProps extends HTMLAttributes<HTMLElement> {
  /** The text to copy. */
  readonly value: string;
  /** Default: the "Copy" message. */
  readonly label?: string | null;
  /** Default: the "Copied" message. */
  readonly copiedLabel?: string | null;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize | null;
  readonly iconOnly?: boolean;
  readonly disabled?: boolean;
  /** How long "Copied" shows, in ms. */
  readonly resetAfter?: number;
  /** The value was copied. */
  readonly onCopied?: (value: string) => void;
  /** The clipboard refused. */
  readonly onCopyError?: (error: unknown) => void;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-copy-button>` — copies `value` on click, shows "Copied" for `resetAfter` ms
 * and announces it in a polite live region (as in @surface-one/angular).
 */
export function SoneCopyButton({
  value,
  label: labelProp,
  copiedLabel: copiedProp,
  variant = "outline",
  size,
  iconOnly = false,
  disabled = false,
  resetAfter = 1500,
  onCopied,
  onCopyError,
  ...rest
}: SoneCopyButtonProps) {
  const messages = useSoneMessages();
  const [isCopied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = (): void => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clearTimer, []);

  const label = labelProp ?? messages.copy;
  const copiedLabel = copiedProp ?? messages.copied;
  const text = isCopied ? copiedLabel : label;

  const copy = async (): Promise<void> => {
    try {
      await writeClipboard(value);
    } catch (error) {
      clearTimer();
      setCopied(false);
      onCopyError?.(error);
      return;
    }
    setCopied(true);
    onCopied?.(value);
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      setCopied(false);
    }, resetAfter);
  };

  return createElement(
    "sone-copy-button",
    {
      "data-slot": "copy-button",
      "data-state": isCopied ? "copied" : "idle",
      ...rest,
    },
    <SoneButton
      type="button"
      variant={variant}
      size={size ?? (iconOnly ? "icon-sm" : "sm")}
      disabled={disabled}
      aria-label={iconOnly ? text : undefined}
      title={iconOnly ? text : undefined}
      onClick={() => void copy()}
    >
      <SoneIcon
        icon={isCopied ? "check" : "copy"}
        inline={iconOnly ? null : "start"}
      />
      {iconOnly ? null : text}
    </SoneButton>,
    <span className="sr-only" aria-live="polite" data-slot="copy-button-status">
      {isCopied ? copiedLabel : ""}
    </span>,
  );
}
