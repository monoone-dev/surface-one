import {
  computed,
  inject,
  toValue,
  type App,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from "vue";

import { SONE_DEFAULT_MESSAGES, type SoneMessages } from "@surface-one/core";

// The interface and the English defaults are shared with the React package.
export { SONE_DEFAULT_MESSAGES, type SoneMessages };

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
