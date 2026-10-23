"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
} from "react";

import { type FieldControlState, syncFieldControl } from "@surface-one/core";

import { definePart, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export type FieldOrientation = "vertical" | "horizontal" | "responsive";

interface FieldContextValue {
  register(id: string): void;
  unregister(id: string): void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface SoneFieldOwnProps {
  readonly orientation?: FieldOrientation;
  readonly invalid?: boolean;
  readonly disabled?: boolean;
}

/**
 * `[soneField]` — a label, a control and its help / error text. It points the first
 * control's `aria-describedby` at every `SoneFieldDescription` / `SoneFieldError`
 * inside it and sets `aria-invalid` while `invalid`, keeping the control's own ids.
 */
export function SoneField<E extends ElementType = "div">({
  as,
  orientation = "vertical",
  invalid = false,
  disabled = false,
  ref,
  ...rest
}: PolymorphicProps<E, SoneFieldOwnProps>): ReactElement {
  const host = useRef<HTMLElement | null>(null);
  const written = useRef<FieldControlState | null>(null);
  const [describedBy, setDescribedBy] = useState<readonly string[]>([]);

  const register = useCallback(
    (id: string) =>
      setDescribedBy((ids) => (ids.includes(id) ? ids : [...ids, id])),
    [],
  );
  const unregister = useCallback(
    (id: string) => setDescribedBy((ids) => ids.filter((x) => x !== id)),
    [],
  );
  const hostRef = useMemo(() => mergeRefs(host, ref as never), [ref]);
  const context = useMemo(
    () => ({ register, unregister }),
    [register, unregister],
  );

  // After every commit, as the Vue twin's onMounted / onUpdated.
  useLayoutEffect(() => {
    written.current = syncFieldControl(
      host.current,
      written.current,
      describedBy,
      invalid,
    );
  });

  return (
    <FieldContext.Provider value={context}>
      {createElement(as ?? "div", {
        role: "group",
        "data-slot": "field",
        "data-orientation": orientation,
        "data-invalid": invalid ? "true" : undefined,
        "data-disabled": disabled ? "true" : undefined,
        ...rest,
        ref: hostRef,
      })}
    </FieldContext.Provider>
  );
}

/** A description or error inside a field: an id (its own or a generated one) the field links. */
function useFieldTextId(slot: string, id: string | undefined): string {
  const field = useContext(FieldContext);
  const fallback = `sone-${slot}-${useId()}`;
  const resolved = id ?? fallback;
  useLayoutEffect(() => {
    if (!field) return;
    field.register(resolved);
    return () => field.unregister(resolved);
  }, [field, resolved]);
  return resolved;
}

/** `[soneFieldDescription]` — help text the field's control is described by. */
export function SoneFieldDescription<E extends ElementType = "p">({
  as,
  id,
  ...rest
}: PolymorphicProps<E, { readonly id?: string }>): ReactElement {
  const resolved = useFieldTextId("field-description", id);
  return createElement(as ?? "p", {
    "data-slot": "field-description",
    ...rest,
    id: resolved,
  });
}

/** `[soneFieldError]` — an error (`role="alert"`) the field's control is described by. */
export function SoneFieldError<E extends ElementType = "p">({
  as,
  id,
  ...rest
}: PolymorphicProps<E, { readonly id?: string }>): ReactElement {
  const resolved = useFieldTextId("field-error", id);
  return createElement(as ?? "p", {
    "data-slot": "field-error",
    role: "alert",
    ...rest,
    id: resolved,
  });
}

/** `label[soneLabel]` */
export const SoneLabel = definePart({
  name: "SoneLabel",
  tag: "label",
  slot: "label",
});

export const SoneFieldLabel = definePart({
  name: "SoneFieldLabel",
  tag: "label",
  slot: "field-label",
});

/** The quiet "Optional" marker inside a `SoneFieldLabel`. */
export const SoneFieldLabelOptional = definePart({
  name: "SoneFieldLabelOptional",
  tag: "span",
  slot: "field-label-optional",
});

export const SoneFieldContent = definePart({
  name: "SoneFieldContent",
  tag: "div",
  slot: "field-content",
});

export const SoneFieldTitle = definePart({
  name: "SoneFieldTitle",
  tag: "div",
  slot: "field-title",
});

export const SoneFieldGroup = definePart<
  "div",
  { readonly variant?: "default" | "choices" }
>({
  name: "SoneFieldGroup",
  tag: "div",
  slot: "field-group",
  props: ["variant"],
  attrs: (p) => ({ "data-variant": p.variant ?? "default" }),
});

export const SoneFieldSet = definePart({
  name: "SoneFieldSet",
  tag: "fieldset",
  slot: "field-set",
});

export const SoneFieldLegend = definePart<
  "legend",
  { readonly variant?: "legend" | "label" }
>({
  name: "SoneFieldLegend",
  tag: "legend",
  slot: "field-legend",
  props: ["variant"],
  attrs: (p) => ({ "data-variant": p.variant ?? "legend" }),
});

export const SoneFieldSeparator = definePart({
  name: "SoneFieldSeparator",
  tag: "div",
  slot: "field-separator",
  static: { role: "separator" },
});

export const SoneFieldSeparatorContent = definePart({
  name: "SoneFieldSeparatorContent",
  tag: "span",
  slot: "field-separator-content",
});
