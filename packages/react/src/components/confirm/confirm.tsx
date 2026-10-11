"use client";

import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  createElement,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { cx, definePart, type PolymorphicProps } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneSpinner } from "../spinner/spinner";

export type ConfirmVariant = "default" | "destructive";
export type ConfirmSize = "default" | "compact";
export type ConfirmLayout = "inline" | "card";

type PartKind = "title" | "description";

interface ConfirmContext {
  /** A part nested below the top level registers its id; returns the unregister. */
  register(kind: PartKind, id: string): () => void;
}

const CONFIRM = createContext<ConfirmContext | null>(null);

/** A title, description or error: an id (its own, the one the root handed it, or a generated one) the root links. */
function defineConfirmText(
  name: string,
  slot: string,
  kind: PartKind,
  role?: string,
) {
  function Text<E extends ElementType = "p">({
    as,
    id,
    className,
    ...rest
  }: PolymorphicProps<E, { id?: string }>) {
    const root = useContext(CONFIRM);
    const fallback = `sone-${slot}-${useId()}`;
    const resolved = id ?? fallback;
    useLayoutEffect(
      () => (root ? root.register(kind, resolved) : undefined),
      [root, resolved],
    );
    return createElement(as ?? "p", {
      "data-slot": slot,
      role,
      ...rest,
      id: resolved,
      className: cx(slot, className),
    });
  }
  Text.displayName = name;
  return Text;
}

/** `[soneConfirmTitle]` — the question; names the alertdialog. */
export const SoneConfirmTitle = defineConfirmText(
  "SoneConfirmTitle",
  "confirm-title",
  "title",
);

/** `[soneConfirmDescription]` — the consequence ("This cannot be undone."). */
export const SoneConfirmDescription = defineConfirmText(
  "SoneConfirmDescription",
  "confirm-description",
  "description",
);

/** `[soneConfirmError]` — why the last attempt failed; announced with `role="alert"`. */
export const SoneConfirmError = defineConfirmText(
  "SoneConfirmError",
  "confirm-error",
  "description",
  "alert",
);

/** `[soneConfirmActions]` — extra controls at the start of the button row (a "Don't ask again" checkbox). */
export const SoneConfirmActions = definePart({
  name: "SoneConfirmActions",
  tag: "div",
  className: "confirm-actions",
  slot: "confirm-actions",
});

const KIND = new Map<unknown, PartKind>([
  [SoneConfirmTitle, "title"],
  [SoneConfirmDescription, "description"],
  [SoneConfirmError, "description"],
]);

/** The children, with arrays and fragments flattened (the Vue `flatten`). */
function flatten(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children)
      : [child],
  );
}

/** What a `ref` on SoneConfirm gets (the Vue `expose`). */
export interface SoneConfirmHandle {
  /** Moves focus to the Confirm button. */
  focus(): void;
}

export interface SoneConfirmProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onCancel"
> {
  /** The element to render instead of a `<div>`. */
  readonly as?: ElementType;
  /** `destructive` paints the action red (delete, discard, leave). */
  readonly variant?: ConfirmVariant;
  /** `compact` uses extra-small buttons and tighter spacing — for a list row. */
  readonly size?: ConfirmSize;
  /** `inline`: text and buttons share one wrapping row. `card`: a bordered panel, buttons below. */
  readonly layout?: ConfirmLayout;
  /** The action button's label (default: the "Confirm" message). */
  readonly confirmLabel?: string | null;
  /** The cancel button's label (default: the "Cancel" message). */
  readonly cancelLabel?: string | null;
  /** The action button's label while `busy` (default: the "Working…" message). */
  readonly busyLabel?: string | null;
  /** The action is running: both buttons are disabled and the action shows `busyLabel`. */
  readonly busy?: boolean;
  /** Move focus to the Confirm button when the confirmation mounts. */
  readonly autoFocus?: boolean;
  /** Extra controls at the start of the button row (the Vue `#actions` slot). */
  readonly actions?: ReactNode;
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
  readonly children?: ReactNode;
  readonly ref?: Ref<SoneConfirmHandle>;
}

/**
 * `[soneConfirm]` — an inline confirmation: the shadcn/ui Alert Dialog anatomy
 * (title, description, Cancel then the action) rendered in place, in a row or a list,
 * instead of in a modal. Render it conditionally when the user asks to delete / discard /
 * leave; it is a `role="alertdialog"` named by its `SoneConfirmTitle` (or your
 * `aria-label`) and described by its `SoneConfirmDescription` and `SoneConfirmError`.
 *
 * The buttons are drawn for you, always Cancel then Confirm. Focus moves to the Confirm
 * button when it mounts, Escape cancels (without reaching an enclosing dialog), and while
 * `busy` both buttons are `aria-disabled` (focus stays put) and the action shows
 * `busyLabel` with a spinner. A `SoneConfirmActions` (or the `actions` prop) sits at the
 * start of the button row. Give focus back to the control that opened it in `onCancel`.
 * A `ref` gets `{ focus() }`.
 */
export function SoneConfirm({
  as,
  variant = "default",
  size = "default",
  layout = "inline",
  confirmLabel = null,
  cancelLabel = null,
  busyLabel = null,
  busy = false,
  autoFocus = true,
  actions: actionsProp,
  onConfirm,
  onCancel,
  onKeyDown,
  className,
  children,
  ref,
  ...rest
}: SoneConfirmProps) {
  const messages = useSoneMessages();
  const uid = `sone-confirm-${useId()}`;
  const [registered, setRegistered] = useState<
    readonly { kind: PartKind; id: string }[]
  >([]);
  const context = useMemo<ConfirmContext>(
    () => ({
      register(kind, id) {
        const entry = { kind, id };
        setRegistered((list) => [...list, entry]);
        return () => setRegistered((list) => list.filter((e) => e !== entry));
      },
    }),
    [],
  );

  const confirmButton = useRef<HTMLButtonElement | null>(null);
  const focus = useCallback(() => confirmButton.current?.focus(), []);
  useImperativeHandle(ref, () => ({ focus }), [focus]);
  const autoFocusOnMount = useRef(autoFocus);
  useEffect(() => {
    if (autoFocusOnMount.current) focus();
  }, [focus]);

  const handleConfirm = (): void => {
    if (!busy) onConfirm?.();
  };
  const handleCancel = (): void => {
    if (!busy) onCancel?.();
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
    onKeyDown?.(e);
    if (e.key !== "Escape") return;
    // Handled here, so an enclosing dialog or sheet stays open.
    e.preventDefault();
    e.stopPropagation();
    handleCancel();
  };

  // The top-level parts get their ids here, while rendering, so the server-rendered
  // alertdialog is already named and described; nested parts register theirs.
  const ids: Record<PartKind, string[]> = { title: [], description: [] };
  const content: ReactNode[] = [];
  const actions: ReactNode[] = [];
  let n = 0;
  for (const node of flatten(children)) {
    const kind = isValidElement(node) ? KIND.get(node.type) : undefined;
    if (isValidElement(node) && node.type === SoneConfirmActions) {
      actions.push(node);
    } else if (kind && isValidElement<{ id?: string }>(node)) {
      const id = node.props.id ?? `${uid}-${kind}-${n++}`;
      ids[kind].push(id);
      content.push(cloneElement(node as ReactElement<{ id?: string }>, { id }));
    } else {
      content.push(node);
    }
  }
  for (const { kind, id } of registered)
    if (!ids[kind].includes(id)) ids[kind].push(id);

  const buttonSize = size === "compact" ? "xs" : "sm";
  const busyAttr = busy ? "true" : undefined;

  return createElement(
    as ?? "div",
    {
      ...rest,
      className: cx("confirm", className),
      "data-slot": "confirm",
      role: "alertdialog",
      "data-variant": variant,
      "data-size": size,
      "data-layout": layout,
      "aria-labelledby": ids.title[0],
      "aria-describedby": ids.description.join(" ") || undefined,
      "aria-busy": busyAttr,
      onKeyDown: handleKeyDown,
    },
    <CONFIRM.Provider value={context}>
      <div className="confirm-content" data-slot="confirm-content">
        {content}
      </div>
      <div className="confirm-footer" data-slot="confirm-footer">
        {actions}
        {actionsProp != null && actionsProp !== false ? (
          <SoneConfirmActions>{actionsProp}</SoneConfirmActions>
        ) : null}
        <SoneButton
          type="button"
          className="confirm-cancel"
          variant={layout === "card" ? "outline" : "ghost"}
          size={buttonSize}
          aria-disabled={busyAttr}
          onClick={handleCancel}
        >
          {cancelLabel ?? messages.cancel}
        </SoneButton>
        <SoneButton
          ref={confirmButton}
          type="button"
          className="confirm-action"
          variant={variant === "destructive" ? "destructive" : "default"}
          size={buttonSize}
          aria-disabled={busyAttr}
          onClick={handleConfirm}
        >
          {busy ? (
            <>
              <SoneSpinner size={14} label={null} data-icon="inline-start" />
              {busyLabel ?? messages.confirmBusy}
            </>
          ) : (
            (confirmLabel ?? messages.confirm)
          )}
        </SoneButton>
      </div>
    </CONFIRM.Provider>,
  );
}
