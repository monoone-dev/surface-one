"use client";

import type { ReactNode } from "react";

import { SoneMessagesProvider, type SoneMessages } from "./context/messages";
import {
  SoneLogoAssetsContext,
  normalizeAssetBase,
} from "./context/logo-assets";

export interface SurfaceOneProviderProps {
  /** Translations of the built-in strings (pass new ones on a locale switch). */
  readonly messages?: Partial<SoneMessages>;
  /** Where `SoneLogo` loads the brand SVGs from (default `/brand/`). */
  readonly logoAssetBase?: string;
  readonly children?: ReactNode;
}

/**
 * Optional app-wide settings — the React twin of `app.use(SurfaceOne, options)`:
 * wrap the app (Next.js: the root layout) once. Every component works without it,
 * in English with the logos under `/brand/`. Load the CSS yourself:
 * `@surface-one/tokens` then `@surface-one/react/styles.css`.
 */
export function SurfaceOneProvider({
  messages,
  logoAssetBase,
  children,
}: SurfaceOneProviderProps) {
  let tree = children;
  if (logoAssetBase)
    tree = (
      <SoneLogoAssetsContext.Provider value={normalizeAssetBase(logoAssetBase)}>
        {tree}
      </SoneLogoAssetsContext.Provider>
    );
  if (messages)
    tree = <SoneMessagesProvider messages={messages}>{tree}</SoneMessagesProvider>;
  return <>{tree}</>;
}
