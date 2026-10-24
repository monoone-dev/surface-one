// The filter chips' count tones, with no framework in it: Angular, the Vue and React twins
// (through @surface-one/core) and React Native (@surface-one/core/filter-chips) read it.

export type FilterChipTone =
  "default" | "danger" | "warning" | "success" | "accent";

/**
 * The badge variant that paints a count in each tone. The values are BadgeVariant
 * literals, checked where they meet the badge's `variant` (this file names no badge type,
 * so it stays free of every entry point).
 */
export const FILTER_CHIP_TONE_BADGE = {
  default: "secondary",
  danger: "destructive",
  warning: "warning",
  success: "success",
  accent: "accent",
} as const satisfies Record<FilterChipTone, string>;
