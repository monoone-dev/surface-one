"use client";

import { createElement, type HTMLAttributes, type Ref } from "react";

import { useSoneLogoAssetBase } from "../../context/logo-assets";
import { cx } from "../../utils/part";

export type LogoSize = "xs" | "sm" | "default" | "lg";
export type LogoBrand = "surface-one" | "index-one" | "ivy";
export type LogoKind = "tile" | "mark";

const ASSET_STEM: Record<LogoBrand, Record<LogoKind, string>> = {
  "surface-one": {
    tile: "surface-one-{mode}-icon",
    mark: "surface-one-{mode}-mark",
  },
  "index-one": {
    tile: "index-one-{mode}-symbol",
    mark: "index-one-{mode}-symbol",
  },
  ivy: { tile: "ivy-{mode}-icon", mark: "ivy-{mode}-mark" },
};

export interface SoneLogoProps extends HTMLAttributes<HTMLElement> {
  readonly size?: LogoSize;
  readonly brand?: LogoBrand;
  readonly kind?: LogoKind;
  /** The accessible name; empty = decorative. */
  readonly label?: string;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-logo>` — a brand mark; the light and dark files swap with the theme. The files
 * load from `/brand/` or the `logoAssetBase` of `<SurfaceOneProvider>`.
 */
export function SoneLogo({
  size = "default",
  brand = "surface-one",
  kind = "tile",
  label = "",
  className,
  ...rest
}: SoneLogoProps) {
  const base = useSoneLogoAssetBase();
  const image = (mode: "light" | "dark") => (
    <img
      className={`logo-image logo-image-${mode}`}
      src={`${base}${ASSET_STEM[brand][kind].replace("{mode}", mode)}.svg`}
      alt={label}
      aria-hidden={label ? undefined : "true"}
      draggable="false"
    />
  );
  return createElement(
    "sone-logo",
    {
      "data-slot": "logo",
      "data-size": size,
      "data-brand": brand,
      "data-kind": kind,
      ...rest,
      className: cx("logo", className),
    },
    image("light"),
    image("dark"),
  );
}
