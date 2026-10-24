"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type ReactElement,
} from "react";

import { SONE_DEFAULT_MESSAGES, type SoneMessages } from "@surface-one/core";

// The interface and the English defaults are shared with the Vue package.
export { SONE_DEFAULT_MESSAGES, type SoneMessages };

export const SoneMessagesContext = createContext<SoneMessages>(
  SONE_DEFAULT_MESSAGES,
);

export interface SoneMessagesProviderProps {
  /** The strings to translate; the rest stay English (or the outer provider's). */
  readonly messages: Partial<SoneMessages>;
  readonly children?: ReactNode;
}

/** Translates the built-in strings for its subtree: `<SoneMessagesProvider messages={{ close: "Zamknij" }}>`. */
export function SoneMessagesProvider({
  messages,
  children,
}: SoneMessagesProviderProps): ReactElement {
  const outer = useContext(SoneMessagesContext);
  const value = useMemo(() => ({ ...outer, ...messages }), [outer, messages]);
  return (
    <SoneMessagesContext.Provider value={value}>
      {children}
    </SoneMessagesContext.Provider>
  );
}

/** The built-in strings in the app's language. */
export function useSoneMessages(): SoneMessages {
  return useContext(SoneMessagesContext);
}
