// The Vite / Vitest / playground configs of @surface-one/vue and @surface-one/react,
// which differ only by the framework plugin, the externals, the name and the port.
//
// The private core package is BUNDLED into both: the `@surface-one/core` alias points
// at its sources, so nothing in dist/ imports it at run time. Its modules (and the
// Angular-free files of packages/angular it re-exports) land in dist/_shared/, next to
// the declarations `link-dts.mjs` copies there — the published packages never depend
// on it, and their .d.ts never name it.
import { fileURLToPath } from "node:url";

import type { PluginOption, UserConfig } from "vite";

/** packages/core/src/index.ts — what `@surface-one/core` resolves to in every build. */
const CORE_ENTRY = fileURLToPath(new URL("../src/index.ts", import.meta.url));
/** packages/ — the common root of the package sources, core and packages/angular. */
const PACKAGES_DIR = fileURLToPath(new URL("../../", import.meta.url));

/** packages/angular/format — Angular-free, imported by name from chart-utils/chart.ts. */
const ANGULAR_FORMAT = fileURLToPath(
  new URL("../../angular/format/index.ts", import.meta.url),
);

export const coreAlias = [
  { find: /^@surface-one\/core$/, replacement: CORE_ENTRY },
  { find: /^@surface-one\/angular\/format$/, replacement: ANGULAR_FORMAT },
];

export interface SoneLibOptions {
  /** `import.meta.url` of the package's vite.config.ts. */
  readonly url: string;
  readonly plugins: PluginOption[];
  /** Entry name → path under src/ (`{ index: "index.ts" }`). */
  readonly entries: Readonly<Record<string, string>>;
  /** The framework runtime that stays external (`/^vue($|\/)/`). */
  readonly external: readonly RegExp[];
}

const withoutExtension = (path: string): string =>
  path.replace(/\.[cm]?[jt]sx?$/, "");

/**
 * Library build: one ES module per source file (so an app bundles only what it
 * imports), the framework external, and every stylesheet bundled into dist/styles.css.
 */
export function soneLibConfig(options: SoneLibOptions): UserConfig {
  const src = fileURLToPath(new URL("./src/", options.url));
  return {
    plugins: options.plugins,
    resolve: { alias: coreAlias },
    build: {
      target: "es2022",
      outDir: "dist",
      emptyOutDir: true,
      minify: false,
      cssMinify: false,
      lib: {
        entry: Object.fromEntries(
          Object.entries(options.entries).map(([name, path]) => [
            name,
            src + path,
          ]),
        ),
        formats: ["es"],
        cssFileName: "styles",
      },
      rollupOptions: {
        external: [...options.external, /^node:/],
        output: {
          preserveModules: true,
          preserveModulesRoot: "src",
          // The package's own modules keep their path under src/; the shared ones
          // (packages/core, packages/angular) go to _shared/ with their repo path.
          entryFileNames: (chunk) => {
            const id = chunk.facadeModuleId?.split("?")[0];
            if (id?.startsWith(src)) {
              return `${withoutExtension(id.slice(src.length))}.js`;
            }
            if (id?.startsWith(PACKAGES_DIR) && !id.includes("node_modules")) {
              return `_shared/${withoutExtension(id.slice(PACKAGES_DIR.length))}.js`;
            }
            return "[name].js";
          },
        },
      },
    },
  };
}

export interface SoneTestOptions {
  readonly url: string;
  readonly plugins: PluginOption[];
  /** The package name the docs templates import (`@surface-one/vue`). */
  readonly name: string;
  readonly include: string[];
  readonly setupFiles?: string[];
}

/** Vitest: jsdom, the package resolved from its sources, core from its sources. */
export function soneTestConfig(options: SoneTestOptions) {
  return {
    plugins: options.plugins,
    resolve: {
      // The docs templates (apps/docs/src/app/templates/<framework>) import the package by name.
      alias: [
        ...coreAlias,
        {
          find: options.name,
          replacement: fileURLToPath(new URL("./src/index.ts", options.url)),
        },
      ],
    },
    test: {
      include: options.include,
      environment: "jsdom",
      ...(options.setupFiles ? { setupFiles: options.setupFiles } : {}),
    },
  };
}

export interface SonePlaygroundOptions {
  /** `import.meta.url` of playground/vite.config.ts. */
  readonly url: string;
  readonly plugins: PluginOption[];
  readonly name: string;
  readonly port: number;
}

/** The playground compiles the package from source (`npm run playground -w <name>`). */
export function sonePlaygroundConfig(
  options: SonePlaygroundOptions,
): UserConfig {
  const path = (p: string): string => fileURLToPath(new URL(p, options.url));
  return {
    root: path("."),
    publicDir: path("../../tokens"),
    plugins: options.plugins,
    resolve: {
      alias: [
        ...coreAlias,
        {
          find: `${options.name}/styles.css`,
          replacement: path("../src/styles.css"),
        },
        { find: options.name, replacement: path("../src/index.ts") },
        {
          find: "@surface-one/tokens",
          replacement: path("../../tokens/css/index.css"),
        },
      ],
    },
    server: { port: options.port },
  };
}
