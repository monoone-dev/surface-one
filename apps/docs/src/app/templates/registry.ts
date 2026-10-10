import type { Type } from "@angular/core";

export const TEMPLATE_SLUGS = [
  "dashboard",
  "chat",
  "settings",
  "notes",
  "login",
  "signup",
  "form",
  "messages",
  "workspace",
  "editor",
  "media",
  "finances",
  "crm",
  "ecommerce",
  "board",
  "workflow",
] as const;
export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

/**
 * A template screen and the code shown under its "Code" tab: the Angular file itself and,
 * when there is one, its Vue twin (`vue/<slug>.vue`), both read by
 * `scripts/build-template-sources.mjs`.
 */
export interface LoadedTemplate {
  component: Type<unknown>;
  angular: string;
  vue: string | null;
}

type Loader = () => Promise<LoadedTemplate>;

const load =
  (
    screen: () => Promise<{ default: Type<unknown> }>,
    sources: () => Promise<{ angular: string; vue: string | null }>,
  ): Loader =>
  async () => {
    const [s, src] = await Promise.all([screen(), sources()]);
    return { component: s.default, angular: src.angular, vue: src.vue };
  };

/** One lazy chunk per template screen, and one for its sources. */
export const TEMPLATES: Record<TemplateSlug, Loader> = {
  dashboard: load(
    () => import("./dashboard.template"),
    () => import("./sources/dashboard.generated"),
  ),
  chat: load(
    () => import("./chat.template"),
    () => import("./sources/chat.generated"),
  ),
  settings: load(
    () => import("./settings.template"),
    () => import("./sources/settings.generated"),
  ),
  notes: load(
    () => import("./notes.template"),
    () => import("./sources/notes.generated"),
  ),
  login: load(
    () => import("./login.template"),
    () => import("./sources/login.generated"),
  ),
  signup: load(
    () => import("./signup.template"),
    () => import("./sources/signup.generated"),
  ),
  form: load(
    () => import("./form.template"),
    () => import("./sources/form.generated"),
  ),
  messages: load(
    () => import("./messages.template"),
    () => import("./sources/messages.generated"),
  ),
  workspace: load(
    () => import("./workspace.template"),
    () => import("./sources/workspace.generated"),
  ),
  editor: load(
    () => import("./editor.template"),
    () => import("./sources/editor.generated"),
  ),
  media: load(
    () => import("./media.template"),
    () => import("./sources/media.generated"),
  ),
  finances: load(
    () => import("./finances.template"),
    () => import("./sources/finances.generated"),
  ),
  crm: load(
    () => import("./crm.template"),
    () => import("./sources/crm.generated"),
  ),
  ecommerce: load(
    () => import("./ecommerce.template"),
    () => import("./sources/ecommerce.generated"),
  ),
  board: load(
    () => import("./board.template"),
    () => import("./sources/board.generated"),
  ),
  workflow: load(
    () => import("./workflow.template"),
    () => import("./sources/workflow.generated"),
  ),
};
