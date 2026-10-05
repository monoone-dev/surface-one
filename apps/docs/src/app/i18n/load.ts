import type { LocaleCode } from "./locales";
import type { Messages } from "./messages/en";

/** One lazy chunk per locale; English is bundled as the fallback. */
export const MESSAGE_LOADERS: Record<LocaleCode, () => Promise<Messages>> = {
  en: () => import("./messages/en").then((m) => m.en),
  pl: () => import("./messages/pl").then((m) => m.pl),
  es: () => import("./messages/es").then((m) => m.es),
  it: () => import("./messages/it").then((m) => m.it),
  fr: () => import("./messages/fr").then((m) => m.fr),
  pt: () => import("./messages/pt").then((m) => m.pt),
  de: () => import("./messages/de").then((m) => m.de),
  zh: () => import("./messages/zh").then((m) => m.zh),
  ja: () => import("./messages/ja").then((m) => m.ja),
};
