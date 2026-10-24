// A disabled link or label button, with no framework in it: Angular, the Vue and React
// twins (through @surface-one/core) call it from a capturing click listener.

/** The slice of a DOM or React synthetic event this needs. */
export interface SoneSwallowableEvent {
  preventDefault(): void;
  stopPropagation(): void;
  /** DOM events have it; React's synthetic events stop at `stopPropagation`. */
  stopImmediatePropagation?(): void;
}

/**
 * A link or label has no native `disabled`: while `el` is `aria-disabled="true"`, its
 * click is cancelled and goes no further. Returns whether it was swallowed.
 */
export function swallowWhenDisabled(
  el: Element | null,
  event: SoneSwallowableEvent,
): boolean {
  if (el?.getAttribute("aria-disabled") !== "true") return false;
  event.preventDefault();
  if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  else event.stopPropagation();
  return true;
}
