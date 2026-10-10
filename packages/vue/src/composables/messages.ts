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
  /** The speaker key `me`. */
  readonly speakerMe: string;
  /** The speaker key `others`. */
  readonly speakerOthers: string;
  /** A numbered speaker (`others-N` → N+1, `speaker-N` → N). */
  readonly speakerNumbered: (n: number) => string;
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
  /** A stepper's accessible name. */
  readonly stepperLabel: string;
  /** A stepper's visible count: `Step 2 of 4`. */
  readonly stepCount: (current: number, total: number) => string;
  /** A copy button's label. */
  readonly copy: string;
  /** A copy button's confirmation. */
  readonly copied: string;
  /** A password input's show / hide toggle. */
  readonly showPassword: string;
  /** A dismissible alert's close button. */
  readonly dismiss: string;
  /** A labelled sparkline's spoken summary: `30 values, peak 5, total 50`. */
  readonly sparklineSummary: (
    count: number,
    peak: string,
    total: string,
  ) => string;
  /** A read-only rating's spoken score: `4.5 out of 5`. */
  readonly ratingSummary: (score: number, max: number) => string;
  /** An interactive rating's group name. */
  readonly ratingLabel: string;
  /** One star of an interactive rating: `1 star`, `3 stars`. */
  readonly ratingStar: (count: number) => string;
  /** A number input's − and + buttons. */
  readonly decrease: string;
  readonly increase: string;
  /** A dock's accessible name. */
  readonly dockLabel: string;
  /** A flow canvas's accessible name, a node's role description and the keyboard help. */
  readonly flowCanvas: string;
  readonly flowNode: string;
  readonly flowInstructions: string;
  /** A node's outgoing connections: `connects to Ship order, Notify buyer`. */
  readonly flowConnectsTo: (targets: string) => string;
  /** A node's status, spoken after its name. */
  readonly flowStatusRunning: string;
  readonly flowStatusSuccess: string;
  readonly flowStatusError: string;
  readonly flowStatusWarning: string;
  /** Appended to a selected node's name. */
  readonly flowSelected: string;
  /** The handles that start / end a connection. */
  readonly flowConnectFrom: (node: string, port: string) => string;
  readonly flowConnectTo: (node: string, port: string) => string;
  /** Live-region announcements of a flow canvas. */
  readonly flowConnecting: (node: string) => string;
  readonly flowConnected: (from: string, to: string) => string;
  readonly flowCancelled: string;
  readonly flowDeleted: (count: number) => string;
  readonly flowMoved: (node: string, x: number, y: number) => string;
  /** The flow controls' group name and buttons. */
  readonly flowControls: string;
  readonly flowZoomIn: string;
  readonly flowZoomOut: string;
  readonly flowFit: string;
  readonly flowResetZoom: string;
  readonly flowLock: string;
}

export const SONE_DEFAULT_MESSAGES: SoneMessages = {
  close: "Close",
  loading: "Loading",
  meterCount: (filled, max) => `${filled} of ${max}`,
  speakerMe: "Me",
  speakerOthers: "Others",
  speakerNumbered: (n) => `Speaker ${n}`,
  statTrendUp: "up",
  statTrendDown: "down",
  statTrendFlat: "unchanged",
  numberLocale: "en",
  stackedBarPart: (label, value, percent) => `${label} ${value} (${percent})`,
  stackedBarOf: (total, max) => `${total} of ${max}`,
  stackedBarTotal: (total) => `${total} in total`,
  stackedBarEmpty: "No data",
  stepperLabel: "Progress",
  stepCount: (current, total) => `Step ${current} of ${total}`,
  copy: "Copy",
  copied: "Copied",
  showPassword: "Show password",
  dismiss: "Dismiss",
  sparklineSummary: (count, peak, total) =>
    `${count} values, peak ${peak}, total ${total}`,
  ratingSummary: (score, max) => `${score} out of ${max}`,
  ratingLabel: "Rating",
  ratingStar: (count) => (count === 1 ? "1 star" : `${count} stars`),
  decrease: "Decrease",
  increase: "Increase",
  dockLabel: "Tools",
  flowCanvas: "Flow diagram",
  flowNode: "node",
  flowInstructions:
    "Tab moves between nodes. Arrow keys move the focused node, C starts a connection from it and Enter on another node finishes it, Delete removes the selection, plus and minus zoom.",
  flowConnectsTo: (targets) => `connects to ${targets}`,
  flowStatusRunning: "running",
  flowStatusSuccess: "succeeded",
  flowStatusError: "failed",
  flowStatusWarning: "needs attention",
  flowSelected: "selected",
  flowConnectFrom: (node, port) => `Connect from ${node} ${port}`,
  flowConnectTo: (node, port) => `Connect to ${node} ${port}`,
  flowConnecting: (node) =>
    `Connecting from ${node}. Move to another node and press Enter, or Escape to cancel.`,
  flowConnected: (from, to) => `Connected ${from} to ${to}.`,
  flowCancelled: "Connection cancelled.",
  flowDeleted: (count) =>
    count === 1 ? "Deleted 1 item." : `Deleted ${count} items.`,
  flowMoved: (node, x, y) => `${node} moved to ${x}, ${y}.`,
  flowControls: "Canvas controls",
  flowZoomIn: "Zoom in",
  flowZoomOut: "Zoom out",
  flowFit: "Fit view",
  flowResetZoom: "Reset zoom",
  flowLock: "Lock canvas",
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
