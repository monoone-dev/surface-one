import {
  computed,
  inject,
  toValue,
  type App,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from "vue";

/**
 * The few strings the components say themselves (the Angular package marks the same
 * ones with `$localize`). English by default; translate them for the app with
 * `app.use(SurfaceOne, { messages })` or `provideSoneMessages()`. Pass a ref or a
 * getter to follow a locale switch (`() => ({ close: t("close") })`).
 */
export interface SoneMessages {
  /** The corner close button of a dialog or sheet. */
  readonly close: string;
  /** A spinner's accessible name. */
  readonly loading: string;
  /** The meter's spoken count: `3 of 4`. */
  readonly meterCount: (filled: number, max: number) => string;
  /** A stepper's accessible name. */
  readonly stepperLabel: string;
  /** A stepper's visible count: `Step 2 of 4`. */
  readonly stepCount: (current: number, total: number) => string;
}

export const SONE_DEFAULT_MESSAGES: SoneMessages = {
  close: "Close",
  loading: "Loading",
  meterCount: (filled, max) => `${filled} of ${max}`,
  stepperLabel: "Progress",
  stepCount: (current, total) => `Step ${current} of ${total}`,
};

export type SoneMessagesInput = MaybeRefOrGetter<Partial<SoneMessages>>;

export const SONE_MESSAGES: InjectionKey<ComputedRef<SoneMessages>> =
  Symbol("SONE_MESSAGES");

/** Provides translated messages to an app: `provideSoneMessages(app, { close: "Zamknij" })`. */
export function provideSoneMessages(
  app: App,
  messages: SoneMessagesInput,
): void {
  app.provide(
    SONE_MESSAGES,
    computed(() => ({ ...SONE_DEFAULT_MESSAGES, ...toValue(messages) })),
  );
}

const defaults = computed(() => SONE_DEFAULT_MESSAGES);

export function useSoneMessages(): ComputedRef<SoneMessages> {
  return inject(SONE_MESSAGES, defaults);
}
