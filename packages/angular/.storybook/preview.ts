import "@angular/localize/init";
import type { Decorator, Preview } from "@storybook/angular";
import { themes } from "storybook/theming";

import type { ThemeGlobal } from "./theme-global";

/**
 * Mirror the app's three appearance axes onto <html>, exactly as
 * a SurfaceOne app does, so every token block in
 * `@surface-one/tokens` activates the same way it does in a consuming app:
 *   - `data-theme`  — light / dark / system (always stamped)
 *   - `data-accent` — absent for the theme's own accent
 *   - `data-skin`   — always stamped (studio / paper / minimalist / neumorphism); the
 *                     no-attribute base is the shadcn core (Minimalist light)
 */
const withAppearance: Decorator = (story, context) => {
  const root = document.documentElement;
  const theme = (context.globals["theme"] as ThemeGlobal | undefined) ?? "dark";
  const accent = (context.globals["accent"] as string | undefined) ?? "default";
  const skin = (context.globals["skin"] as string | undefined) ?? "studio";

  root.setAttribute("data-theme", theme);
  if (accent === "default") {
    root.removeAttribute("data-accent");
  } else {
    root.setAttribute("data-accent", accent);
  }
  // Every skin is stamped (Studio too): the no-attribute base is the shadcn core.
  root.setAttribute("data-skin", skin);
  return story();
};

const preview: Preview = {
  decorators: [withAppearance],
  globalTypes: {
    theme: {
      description: "Theme (data-theme)",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
    accent: {
      description: "Accent palette (data-accent)",
      toolbar: {
        title: "Accent",
        icon: "paintbrush",
        items: [
          { value: "default", title: "Theme default" },
          { value: "blue", title: "Blue" },
          { value: "teal", title: "Teal" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" },
          { value: "pink", title: "Pink" },
        ],
        dynamicTitle: true,
      },
    },
    skin: {
      description: "Theme skin (data-skin)",
      toolbar: {
        title: "Skin",
        icon: "component",
        items: [
          { value: "studio", title: "Studio (Vega, default)" },
          { value: "paper", title: "Paper (Maia)" },
          { value: "minimalist", title: "Minimalist (Nova)" },
          { value: "neumorphism", title: "Neumorphism" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "dark",
    accent: "default",
    skin: "studio",
  },
  parameters: {
    layout: "padded",
    controls: { expanded: true, sort: "requiredFirst" },
    // The canvas paints the app's own ground (body → var(--surface-base)), so
    // Storybook's backgrounds switcher would only fight the theme toolbar.
    backgrounds: { disable: true },
    // Docs chrome (prose + Controls table) stays dark; the story canvases
    // still follow the Theme toolbar through withAppearance.
    docs: {
      theme: themes.dark,
      toc: true,
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Design tokens",
          [
            "Overview",
            "Colors",
            "Typography",
            "Layout",
            "Light theme",
            "Paper skin",
            "Accents",
          ],
          "Primitives",
          "Components",
          [
            "Actions",
            "Data display",
            "Feedback",
            "Forms",
            "Layout",
            "Navigation",
            "Overlays",
          ],
        ],
      },
    },
  },
};

export default preview;
