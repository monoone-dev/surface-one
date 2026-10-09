import type { App, Component, Plugin } from "vue";

import { SONE_COMPONENT_NAMES } from "./component-names";
import * as components from "./components";
import {
  provideSoneMessages,
  type SoneMessagesInput,
} from "./composables/messages";
import { provideSoneLogoAssets } from "./components/logo";
import { vSoneTooltip } from "./directives/tooltip";

export interface SurfaceOneOptions {
  /** Register every component globally (default `true`); `false` to import them where used. */
  readonly components?: boolean;
  /** Translations of the built-in strings (a ref or getter follows a locale switch). */
  readonly messages?: SoneMessagesInput;
  /** Where `SoneLogo` loads the brand SVGs from (default `/brand/`). */
  readonly logoAssetBase?: string;
}

/**
 * `app.use(SurfaceOne)` — registers the `Sone*` components and the `v-sone-tooltip`
 * directive, and provides the messages / logo assets. Load the CSS yourself:
 * `@surface-one/tokens` then `@surface-one/vue/styles.css`.
 */
export const SurfaceOne: Plugin<[SurfaceOneOptions?]> = {
  install(app: App, options: SurfaceOneOptions = {}) {
    if (options.components !== false) {
      const all = components as unknown as Record<string, Component>;
      for (const name of SONE_COMPONENT_NAMES) app.component(name, all[name]!);
    }
    app.directive("sone-tooltip", vSoneTooltip);
    if (options.messages) provideSoneMessages(app, options.messages);
    if (options.logoAssetBase)
      provideSoneLogoAssets(app, options.logoAssetBase);
  },
};
