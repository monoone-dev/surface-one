// The popover context, shared with the hover card and the context menu (which open the
// same anchored layer) but not exported from the package.
import { createContext, useContext, type ComponentRef } from "react";
import type { View } from "react-native";

import type { TooltipAlign, TooltipSide } from "../tooltip/tooltip";

export type PopoverSide = TooltipSide;
export type PopoverAlign = TooltipAlign;

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PopoverContext {
  readonly open: boolean;
  readonly anchor: Rect | null;
  readonly side: PopoverSide;
  readonly align: PopoverAlign;
  readonly offset: number | undefined;
  readonly contentId: string;
  readonly anchorRef: { current: ComponentRef<typeof View> | null };
  setOpen(open: boolean): void;
  close(): void;
}

export const POPOVER = createContext<PopoverContext | null>(null);

export function usePopover(part: string, root = "SonePopover"): PopoverContext {
  const popover = useContext(POPOVER);
  if (!popover) throw new Error(`${part} needs a ${root}`);
  return popover;
}
