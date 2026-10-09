import { join } from "node:path";

import { SONE_COMPONENT_NAMES } from "../component-names";
import type { SoneMessages } from "../composables/messages";

export interface SurfaceOneNuxtOptions {
  /** Add `@surface-one/tokens` and `@surface-one/vue/styles.css` to the app CSS (default `true`). */
  readonly css?: boolean;
  /** Auto-import the `Sone*` components (default `true`); a page bundles only what it uses. */
  readonly components?: boolean;
  /** Where `SoneLogo` loads the brand SVGs from (default `/brand/`, i.e. `public/brand/`). */
  readonly logoAssetBase?: string;
  /**
   * Static translations of the built-in strings. To follow a locale switch, provide them
   * from your own plugin: `provideSoneMessages(nuxtApp.vueApp, () => ({ close: t("close") }))`.
   */
  readonly messages?: Partial<Omit<SoneMessages, "meterCount">>;
}

// The slice of the Nuxt instance this module touches, typed here so the package needs
// neither @nuxt/kit nor @nuxt/schema.
interface NuxtTemplate {
  filename: string;
  getContents: () => string;
}
interface NuxtLike {
  readonly options: {
    css: string[];
    plugins: (string | { src: string; mode?: string })[];
    buildDir: string;
    build: { templates: NuxtTemplate[] };
  } & { surfaceOne?: SurfaceOneNuxtOptions };
  hook(name: "components:extend", fn: (components: object[]) => void): void;
}

const kebab = (name: string): string =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * The Nuxt module — `modules: ["@surface-one/vue/nuxt"]` in nuxt.config.ts, options
 * under `surfaceOne: { … }`: the CSS, the auto-imported `Sone*` components, the
 * `v-sone-tooltip` directive and the messages / logo assets.
 */
function surfaceOneModule(
  inlineOptions: SurfaceOneNuxtOptions | undefined,
  nuxt: NuxtLike,
): void {
  const options: SurfaceOneNuxtOptions = {
    ...nuxt.options.surfaceOne,
    ...inlineOptions,
  };

  if (options.css !== false) {
    nuxt.options.css.unshift(
      "@surface-one/tokens",
      "@surface-one/vue/styles.css",
    );
  }

  if (options.components !== false) {
    nuxt.hook("components:extend", (components) => {
      for (const name of SONE_COMPONENT_NAMES) {
        components.push({
          pascalName: name,
          kebabName: kebab(name),
          export: name,
          filePath: "@surface-one/vue",
          shortPath: "@surface-one/vue",
          chunkName: `components/${kebab(name)}`,
          prefetch: false,
          preload: false,
          global: false,
          mode: "all",
          priority: 0,
        });
      }
    });
  }

  const filename = "surface-one.plugin.mjs";
  nuxt.options.build.templates.push({
    filename,
    getContents: () =>
      [
        `import { defineNuxtPlugin } from "#app";`,
        `import { vSoneTooltip, provideSoneMessages, provideSoneLogoAssets } from "@surface-one/vue";`,
        `const messages = ${JSON.stringify(options.messages ?? null)};`,
        `const logoAssetBase = ${JSON.stringify(options.logoAssetBase ?? null)};`,
        `export default defineNuxtPlugin({`,
        `  name: "surface-one",`,
        `  setup(nuxtApp) {`,
        `    nuxtApp.vueApp.directive("sone-tooltip", vSoneTooltip);`,
        `    if (messages) provideSoneMessages(nuxtApp.vueApp, messages);`,
        `    if (logoAssetBase) provideSoneLogoAssets(nuxtApp.vueApp, logoAssetBase);`,
        `  },`,
        `});`,
        ``,
      ].join("\n"),
  });
  nuxt.options.plugins.unshift({ src: join(nuxt.options.buildDir, filename) });
}

export default Object.assign(surfaceOneModule, {
  getMeta: () => ({ name: "@surface-one/vue", configKey: "surfaceOne" }),
});
