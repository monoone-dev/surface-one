import { InjectionToken, type Signal } from "@angular/core";

export type DockPosition = "top" | "bottom" | "left" | "right";
export type DockAlign = "start" | "center" | "end";
export type DockSize = "sm" | "default";

/** What a dock item reads from the dock it sits in. */
export interface SoneDockContext {
  readonly orientation: Signal<"horizontal" | "vertical">;
  /** The item that holds the dock's single Tab stop. */
  readonly tabStop: Signal<unknown>;
  focused(item: unknown): void;
}

export const SONE_DOCK = new InjectionToken<SoneDockContext>("SONE_DOCK");
