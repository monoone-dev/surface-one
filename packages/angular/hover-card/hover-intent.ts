// When a hover card opens and closes, with no framework in it: the Angular
// `soneHoverCardTrigger`, the Vue and React `SoneHoverCard` (through @surface-one/core)
// and the React Native one share it.

export interface HoverIntentOptions {
  readonly isOpen: () => boolean;
  readonly open: () => void;
  readonly close: () => void;
  /** ms from entering the trigger (or focusing it) to opening. */
  readonly openDelay: () => number;
  /** ms from leaving the trigger and the card to closing. */
  readonly closeDelay: () => number;
}

export interface HoverIntent {
  /** The pointer entered (or focus reached) the trigger or the card: open after `openDelay`, or stay open. */
  enter(): void;
  /** It left: close after `closeDelay` unless it comes back first. */
  leave(): void;
  /** Open now (a tap on a touch screen, a long press). */
  openNow(): void;
  /** Drop any pending open or close. */
  cancel(): void;
}

/**
 * The open / close delays of a hover card (Radix HoverCard `openDelay` / `closeDelay`):
 * crossing the trigger on the way elsewhere opens nothing, and moving from the trigger
 * to the card (or back) does not close it. A delay of 0 acts at once.
 */
export function createHoverIntent(options: HoverIntentOptions): HoverIntent {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const cancel = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const later = (delay: number, fn: () => void): void => {
    cancel();
    if (delay <= 0) {
      fn();
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, delay);
  };
  return {
    enter() {
      if (options.isOpen()) {
        cancel();
        return;
      }
      later(options.openDelay(), () => {
        if (!options.isOpen()) options.open();
      });
    },
    leave() {
      if (!options.isOpen()) {
        cancel();
        return;
      }
      later(options.closeDelay(), () => {
        if (options.isOpen()) options.close();
      });
    },
    openNow() {
      cancel();
      if (!options.isOpen()) options.open();
    },
    cancel,
  };
}
