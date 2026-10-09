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
  /** Read before a stat trend that went up / down / did not change: "up 12%". */
  readonly statTrendUp: string;
  readonly statTrendDown: string;
  readonly statTrendFlat: string;
  /** The locale charts format their numbers in (legend values, stacked-bar summary). */
  readonly numberLocale: string;
  /** A stacked bar's spoken summary: "Playback 4.2 GB (40%)", "7.6 GB of 20 GB", "7.6 GB in total". */
  readonly stackedBarPart: (
    label: string,
    value: string,
    percent: string,
  ) => string;
  readonly stackedBarOf: (total: string, max: string) => string;
  readonly stackedBarTotal: (total: string) => string;
  readonly stackedBarEmpty: string;
}

export const SONE_DEFAULT_MESSAGES: SoneMessages = {
  close: "Close",
  loading: "Loading",
  meterCount: (filled, max) => `${filled} of ${max}`,
  statTrendUp: "up",
  statTrendDown: "down",
  statTrendFlat: "unchanged",
  numberLocale: "en",
  stackedBarPart: (label, value, percent) => `${label} ${value} (${percent})`,
  stackedBarOf: (total, max) => `${total} of ${max}`,
  stackedBarTotal: (total) => `${total} in total`,
  stackedBarEmpty: "No data",
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
