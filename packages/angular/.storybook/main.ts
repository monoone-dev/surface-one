import type { StorybookConfig } from "@storybook/angular";

/**
 * Storybook for `@surface-one/angular` and `@surface-one/tokens`.
 *
 * Run it through the Angular CLI targets in `angular.json`
 * (`npm run storybook` / `npm run build-storybook`), never `storybook dev`
 * directly: the target is what hands Storybook the global stylesheet, the
 * self-hosted latin-ext fonts and `experimentalZoneless`.
 */
const config: StorybookConfig = {
  stories: [
    "./pages/**/*.mdx",
    "./pages/**/*.stories.ts",
    "../*/**/*.stories.ts",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  webpackFinal: async (webpackConfig) => {
    // `import css from "…/colors.css?raw"` hands the token pages the SOURCE of a
    // token file (names, values and the comments that explain them), so the docs
    // are read from the file itself and can never drift from it. Every other
    // CSS rule is told to skip `?raw`, or the file would also go through the
    // style pipeline and come back as a module instead of a string.
    const rules = webpackConfig.module?.rules ?? [];
    for (const rule of rules) {
      if (rule && typeof rule === "object" && !rule.resourceQuery) {
        rule.resourceQuery = { not: [/raw/] };
      }
    }
    rules.unshift({ resourceQuery: /raw/, type: "asset/source" });
    // The Angular builder already configures source maps through its own
    // SourceMapDevToolPlugin; Storybook's `devtool` adds a second emitter for the
    // same *.map names, and webpack refuses the build ("Multiple assets emit
    // different content to the same filename …map"). One emitter is enough.
    webpackConfig.devtool = false;
    return webpackConfig;
  },
};

export default config;
