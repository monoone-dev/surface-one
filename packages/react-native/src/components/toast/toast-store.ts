import { useSyncExternalStore } from "react";

export type ToastVariant =
  "default" | "success" | "warning" | "destructive" | "info";

export interface SoneToastAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface SoneToastOptions {
  readonly title?: string;
  readonly description?: string;
  readonly variant?: ToastVariant;
  /** How long it stays, in ms; `0` keeps it until it is dismissed. Default: the toaster's. */
  readonly duration?: number;
  /** A button after the text (it dismisses the toast too). */
  readonly action?: SoneToastAction;
  /** Reuse an id to replace a toast that is still queued or showing. */
  readonly id?: string;
  /** The toast went away, by its timer, its close button or `dismiss`. */
  readonly onDismiss?: () => void;
}

export interface SoneToastItem extends SoneToastOptions {
  readonly id: string;
  readonly variant: ToastVariant;
}

type Listener = () => void;

let items: readonly SoneToastItem[] = [];
let counter = 0;
const listeners = new Set<Listener>();

const emit = (next: readonly SoneToastItem[]): void => {
  items = next;
  listeners.forEach((l) => l());
};

const subscribe = (l: Listener): (() => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** Removes one toast (or all of them) and calls its `onDismiss`. */
function dismissToast(id?: string): void {
  const gone = id === undefined ? items : items.filter((i) => i.id === id);
  if (!gone.length) return;
  emit(id === undefined ? [] : items.filter((i) => i.id !== id));
  gone.forEach((i) => i.onDismiss?.());
}

function showToast(
  input: string | SoneToastOptions,
  options?: SoneToastOptions,
): string {
  const given: SoneToastOptions =
    typeof input === "string" ? { ...options, title: input } : input;
  const id = given.id ?? `sone-toast-${++counter}`;
  const item: SoneToastItem = {
    ...given,
    id,
    variant: given.variant ?? "default",
  };
  const at = items.findIndex((i) => i.id === id);
  emit(at < 0 ? [...items, item] : items.map((i, n) => (n === at ? item : i)));
  return id;
}

type Shortcut = (
  input: string | Omit<SoneToastOptions, "variant">,
  options?: Omit<SoneToastOptions, "variant">,
) => string;

const shortcut =
  (variant: ToastVariant): Shortcut =>
  (input, options) =>
    showToast(
      typeof input === "string"
        ? { ...options, title: input, variant }
        : { ...input, variant },
    );

/**
 * Shows a toast from anywhere (an event handler, a store, a query callback): a title or
 * options, returning its id. `SoneToaster` (mounted once, in the provider) draws them.
 */
export const toast = Object.assign(showToast, {
  success: shortcut("success"),
  warning: shortcut("warning"),
  error: shortcut("destructive"),
  destructive: shortcut("destructive"),
  info: shortcut("info"),
  /** Dismiss one toast by id, or every toast. */
  dismiss: dismissToast,
});

export type SoneToastApi = typeof toast;

/** The imperative `toast` — for components that prefer a hook. */
export function useSoneToast(): SoneToastApi {
  return toast;
}

/** The queued and showing toasts, oldest first (`SoneToaster` reads this). */
export function useSoneToasts(): readonly SoneToastItem[] {
  return useSyncExternalStore(
    subscribe,
    () => items,
    () => items,
  );
}
