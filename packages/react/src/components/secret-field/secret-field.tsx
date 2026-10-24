"use client";

import {
  createElement,
  useEffect,
  useId,
  useState,
  type HTMLAttributes,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
} from "../input/field";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";

export type SecretFieldState = "unknown" | "set" | "unset";

export interface SoneSecretFieldProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onSubmit"
> {
  /** `true` set, `false` not set, `null` unknown (no status shown). */
  readonly hasKey?: boolean | null;
  readonly busy?: boolean;
  readonly error?: string | null;
  /** The status label and the field's default name (default: the "Status" message). */
  readonly label?: string | null;
  readonly placeholder?: string;
  readonly ariaLabel?: string | null;
  readonly help?: string | null;
  /** Default: the "Key set ✓" message. */
  readonly setLabel?: string | null;
  /** Default: the "Not set" message. */
  readonly unsetLabel?: string | null;
  /** Default: the "Save key" message. */
  readonly saveLabel?: string | null;
  readonly autoComplete?: string;
  readonly clearable?: boolean;
  /** The typed secret; never log or store it outside secure storage. */
  readonly onSave?: (value: string) => void;
  readonly onClear?: () => void;
}

/**
 * `<sone-secret-field>` — a write-only secret (an API key, a token): a status badge
 * (`hasKey`: `true` set, `false` not set, `null` unknown and hidden), a password field
 * and a Save button that calls `onSave` with the typed value, plus a Clear button
 * (`clearable`, while a key is set) that calls `onClear`. The field empties once the
 * save settles — when `busy` is off again with no `error`.
 */
export function SoneSecretField({
  hasKey = null,
  busy = false,
  error = null,
  label,
  placeholder = "",
  ariaLabel,
  help,
  setLabel,
  unsetLabel,
  saveLabel,
  autoComplete = "off",
  clearable = false,
  onSave,
  onClear,
  ...rest
}: SoneSecretFieldProps): ReactElement {
  const m = useSoneMessages();
  const inputId = `sone-secret-field-${useId()}`;
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const canSave = !busy && draft.trim() !== "";
  const state: SecretFieldState =
    hasKey === null ? "unknown" : hasKey ? "set" : "unset";
  const name = label ?? m.secretStatus;

  // State-based, not edge-based, as in the Angular twin: a save that settles at once
  // flips `busy` on and off before anything reads it.
  useEffect(() => {
    if (!pending || busy) return;
    setPending(false);
    if (!error) setDraft("");
  }, [pending, busy, error]);

  const submit = (): void => {
    if (!canSave) return;
    setPending(true);
    onSave?.(draft);
  };

  return createElement(
    "sone-secret-field",
    { "data-slot": "secret-field", "data-state": state, ...rest },
    <SoneField invalid={!!error}>
      {hasKey !== null ? (
        <div className="status" data-slot="secret-field-status">
          <span className="text-secondary">{name}</span>
          {hasKey ? (
            <SoneBadge variant="success">
              <span className="badge-dot" />
              {setLabel ?? m.secretSet}
            </SoneBadge>
          ) : (
            <SoneBadge variant="outline">
              <span className="badge-dot" />
              {unsetLabel ?? m.secretUnset}
            </SoneBadge>
          )}
        </div>
      ) : null}
      <SoneInputGroup disabled={busy}>
        <input
          data-slot="input-group-control"
          type="password"
          id={inputId}
          value={draft}
          placeholder={placeholder}
          disabled={busy}
          aria-label={ariaLabel ?? name}
          autoComplete={autoComplete}
          spellCheck="false"
          onChange={(e) => setDraft(e.target.value)}
        />
        <SoneInputGroupAddon as="span" align="inline-end">
          <SoneButton
            variant="ghost"
            size="xs"
            type="button"
            disabled={!canSave}
            onClick={submit}
          >
            {busy ? m.secretSaving : (saveLabel ?? m.secretSave)}
          </SoneButton>
          {clearable && hasKey ? (
            <SoneButton
              variant="ghost"
              size="xs"
              type="button"
              disabled={busy}
              onClick={() => onClear?.()}
            >
              {m.secretClear}
            </SoneButton>
          ) : null}
        </SoneInputGroupAddon>
      </SoneInputGroup>
      {help ? <SoneFieldDescription>{help}</SoneFieldDescription> : null}
      {error ? <SoneFieldError>{error}</SoneFieldError> : null}
    </SoneField>,
  );
}
