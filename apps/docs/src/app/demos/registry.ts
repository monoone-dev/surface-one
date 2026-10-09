import type { Type } from "@angular/core";

/** What a demo file exports: the live component and the source shown under it. */
export interface DemoModule {
  default: Type<unknown>;
  code: string;
}

export interface LoadedDemo {
  component: Type<unknown>;
  code: string;
}

/**
 * One lazy chunk per component page. Each `<slug>.demo.ts` default-exports a
 * standalone component and exports `code` — the template a reader can copy.
 */
export const DEMOS: Record<string, () => Promise<DemoModule>> = {
  sidebar: () => import("./sidebar.demo"),
  card: () => import("./card.demo"),
  separator: () => import("./separator.demo"),
  collapsible: () => import("./collapsible.demo"),
  disclosure: () => import("./disclosure.demo"),
  alert: () => import("./alert.demo"),
  avatar: () => import("./avatar.demo"),
  badge: () => import("./badge.demo"),
  banner: () => import("./banner.demo"),
  "bar-chart": () => import("./bar-chart.demo"),
  "bar-list": () => import("./bar-list.demo"),
  button: () => import("./button.demo"),
  icon: () => import("./icon.demo"),
  kbd: () => import("./kbd.demo"),
  logo: () => import("./logo.demo"),
  progress: () => import("./progress.demo"),
  "download-progress": () => import("./download-progress.demo"),
  meter: () => import("./meter.demo"),
  skeleton: () => import("./skeleton.demo"),
  sparkline: () => import("./sparkline.demo"),
  spinner: () => import("./spinner.demo"),
  input: () => import("./input.demo"),
  select: () => import("./select.demo"),
  switch: () => import("./switch.demo"),
  slider: () => import("./slider.demo"),
  "power-slider": () => import("./power-slider.demo"),
  segmented: () => import("./segmented.demo"),
  "toggle-group": () => import("./toggle-group.demo"),
  "choice-card": () => import("./choice-card.demo"),
  "secret-field": () => import("./secret-field.demo"),
  table: () => import("./table.demo"),
  item: () => import("./item.demo"),
  "empty-state": () => import("./empty-state.demo"),
  "source-list": () => import("./source-list.demo"),
  "chart-legend": () => import("./chart-legend.demo"),
  "stacked-bar": () => import("./stacked-bar.demo"),
  stat: () => import("./stat.demo"),
  "tree-row": () => import("./tree-row.demo"),
  dialog: () => import("./dialog.demo"),
  sheet: () => import("./sheet.demo"),
  "side-panel": () => import("./side-panel.demo"),
  "floating-bar": () => import("./floating-bar.demo"),
  menu: () => import("./menu.demo"),
  "row-menu": () => import("./row-menu.demo"),
  tooltip: () => import("./tooltip.demo"),
  toaster: () => import("./toaster.demo"),
  "page-header": () => import("./page-header.demo"),
  "page-actions": () => import("./page-actions.demo"),
  chat: () => import("./chat.demo"),
  message: () => import("./message.demo"),
  bubble: () => import("./bubble.demo"),
  marker: () => import("./marker.demo"),
  markdown: () => import("./markdown.demo"),
  "audio-player": () => import("./audio-player.demo"),
  recording: () => import("./recording.demo"),
  "speaker-chip": () => import("./speaker-chip.demo"),
  transcript: () => import("./transcript.demo"),
  "live-transcript": () => import("./live-transcript.demo"),
  timeline: () => import("./timeline.demo"),
};

export async function loadDemo(slug: string): Promise<LoadedDemo | null> {
  const load = DEMOS[slug];
  if (!load) return null;
  const mod = await load();
  return { component: mod.default, code: mod.code };
}
