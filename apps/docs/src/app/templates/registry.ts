import type { Type } from "@angular/core";

export const TEMPLATE_SLUGS = [
  "dashboard",
  "chat",
  "settings",
  "notes",
] as const;
export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

/** One lazy chunk per template screen. */
export const TEMPLATES: Record<
  TemplateSlug,
  () => Promise<{ default: Type<unknown> }>
> = {
  dashboard: () => import("./dashboard.template"),
  chat: () => import("./chat.template"),
  settings: () => import("./settings.template"),
  notes: () => import("./notes.template"),
};
