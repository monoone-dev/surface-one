// The progress bar's shared vocabulary, with no framework in it: Angular, the Vue and React
// twins (through @surface-one/core) and React Native (@surface-one/core/progress) read it.

export type SoneProgressSize = "sm" | "md";

export type SoneProgressTone = "default" | "warning" | "destructive";

export type SoneProgressLabelFn = (value: number, max: number) => string;

/** The spoken value when none is given: a rounded percentage. */
export const defaultProgressLabel: SoneProgressLabelFn = (value, max) =>
  `${Math.round((value / max) * 100)}%`;
