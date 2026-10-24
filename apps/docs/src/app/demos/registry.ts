import type { Type } from "@angular/core";

/** What a demo file exports: the live component and the Angular source shown under it. */
export interface DemoModule {
  default: Type<unknown>;
  code: string;
}

/**
 * A demo with its twins: `vueCode` is `demos/vue/<slug>.vue` (the same demo as a Vue SFC)
 * and `reactCode` is `demos/react/<slug>.tsx` (as a React component), read as raw source
 * by `scripts/build-template-sources.mjs`. The Vue and React packages' tests compile and
 * render those files. Without one the page says the component is Angular-only there.
 */
export interface LoadedDemo {
  component: Type<unknown>;
  code: string;
  vueCode: string | null;
  reactCode: string | null;
}

/**
 * One lazy chunk per component page. Each `<slug>.demo.ts` default-exports a
 * standalone component and exports `code` — the template a reader can copy.
 */
export const DEMOS: Record<string, () => Promise<DemoModule>> = {
  sidebar: () => import("./sidebar.demo"),
  card: () => import("./card.demo"),
  separator: () => import("./separator.demo"),
  "scroll-area": () => import("./scroll-area.demo"),
  resizable: () => import("./resizable.demo"),
  collapsible: () => import("./collapsible.demo"),
  "collapsible-section": () => import("./collapsible-section.demo"),
  "section-heading": () => import("./section-heading.demo"),
  disclosure: () => import("./disclosure.demo"),
  accordion: () => import("./accordion.demo"),
  breadcrumb: () => import("./breadcrumb.demo"),
  "navigation-menu": () => import("./navigation-menu.demo"),
  "app-bar": () => import("./app-bar.demo"),
  "tab-bar": () => import("./tab-bar.demo"),
  pagination: () => import("./pagination.demo"),
  alert: () => import("./alert.demo"),
  confirm: () => import("./confirm.demo"),
  avatar: () => import("./avatar.demo"),
  "avatar-group": () => import("./avatar-group.demo"),
  badge: () => import("./badge.demo"),
  banner: () => import("./banner.demo"),
  "bar-chart": () => import("./bar-chart.demo"),
  "line-chart": () => import("./line-chart.demo"),
  "area-chart": () => import("./area-chart.demo"),
  "donut-chart": () => import("./donut-chart.demo"),
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
  "status-dot": () => import("./status-dot.demo"),
  input: () => import("./input.demo"),
  textarea: () => import("./textarea.demo"),
  "file-upload": () => import("./file-upload.demo"),
  "image-picker": () => import("./image-picker.demo"),
  select: () => import("./select.demo"),
  switch: () => import("./switch.demo"),
  calendar: () => import("./calendar.demo"),
  combobox: () => import("./combobox.demo"),
  "date-picker": () => import("./date-picker.demo"),
  checkbox: () => import("./checkbox.demo"),
  "radio-group": () => import("./radio-group.demo"),
  slider: () => import("./slider.demo"),
  "power-slider": () => import("./power-slider.demo"),
  segmented: () => import("./segmented.demo"),
  "toggle-group": () => import("./toggle-group.demo"),
  "search-field": () => import("./search-field.demo"),
  "filter-chips": () => import("./filter-chips.demo"),
  "choice-card": () => import("./choice-card.demo"),
  "secret-field": () => import("./secret-field.demo"),
  "copy-button": () => import("./copy-button.demo"),
  "input-otp": () => import("./input-otp.demo"),
  "password-input": () => import("./password-input.demo"),
  stepper: () => import("./stepper.demo"),
  "tag-input": () => import("./tag-input.demo"),
  table: () => import("./table.demo"),
  "data-table": () => import("./data-table.demo"),
  carousel: () => import("./carousel.demo"),
  item: () => import("./item.demo"),
  "empty-state": () => import("./empty-state.demo"),
  "load-more": () => import("./load-more.demo"),
  graph: () => import("./graph.demo"),
  "source-list": () => import("./source-list.demo"),
  "chart-legend": () => import("./chart-legend.demo"),
  "stacked-bar": () => import("./stacked-bar.demo"),
  stat: () => import("./stat.demo"),
  command: () => import("./command.demo"),
  tree: () => import("./tree.demo"),
  "tree-row": () => import("./tree-row.demo"),
  dialog: () => import("./dialog.demo"),
  sheet: () => import("./sheet.demo"),
  drawer: () => import("./drawer.demo"),
  "side-panel": () => import("./side-panel.demo"),
  "floating-bar": () => import("./floating-bar.demo"),
  menu: () => import("./menu.demo"),
  "context-menu": () => import("./context-menu.demo"),
  menubar: () => import("./menubar.demo"),
  popover: () => import("./popover.demo"),
  "hover-card": () => import("./hover-card.demo"),
  "row-menu": () => import("./row-menu.demo"),
  tooltip: () => import("./tooltip.demo"),
  toaster: () => import("./toaster.demo"),
  "page-header": () => import("./page-header.demo"),
  "page-actions": () => import("./page-actions.demo"),
  "page-hero": () => import("./page-hero.demo"),
  "page-section": () => import("./page-section.demo"),
  "pricing-plan": () => import("./pricing-plan.demo"),
  "page-site-header": () => import("./page-site-header.demo"),
  "page-footer": () => import("./page-footer.demo"),
  chat: () => import("./chat.demo"),
  terminal: () => import("./terminal.demo"),
  "agent-chat": () => import("./agent-chat.demo"),
  "chat-history": () => import("./chat-history.demo"),
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
  rating: () => import("./rating.demo"),
  "input-number": () => import("./input-number.demo"),
  flow: () => import("./flow.demo"),
  dock: () => import("./dock.demo"),
};

export async function loadDemo(slug: string): Promise<LoadedDemo | null> {
  const load = DEMOS[slug];
  if (!load) return null;
  // The twins' loader map is its own chunk too, so `main` (which holds the routes) stays small.
  const twinsOf = async (s: string) =>
    (await import("./sources/index.generated")).DEMO_TWINS[s]?.();
  const [mod, twins] = await Promise.all([load(), twinsOf(slug)]);
  return {
    component: mod.default,
    code: mod.code,
    vueCode: twins?.vue ?? null,
    reactCode: twins?.react ?? null,
  };
}
