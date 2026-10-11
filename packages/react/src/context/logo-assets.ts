"use client";

import { createContext, useContext } from "react";

/**
 * Where `SoneLogo` loads the brand SVGs from. Copy `@surface-one/tokens/brand` into the
 * app's public folder (Next.js / Vite: `public/brand/`) — the default is `/brand/`.
 */
export const SoneLogoAssetsContext = createContext("/brand/");

export function useSoneLogoAssetBase(): string {
  return useContext(SoneLogoAssetsContext);
}

export const normalizeAssetBase = (base: string): string =>
  base.endsWith("/") ? base : `${base}/`;
