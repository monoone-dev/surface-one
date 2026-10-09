/**
 * English — the source locale. Every other locale file is typed `Messages`, so a
 * missing or renamed key is a compile error, not a blank on the page.
 *
 * Inline markup in prose strings: `code`, **bold**, [label](/path) — paths that
 * start with `/` are localized automatically. Code samples are not translated;
 * they live in `../snippets.ts` and blocks point at them by id.
 */
/** One block of a guide page. `code` names a snippet in `../snippets.ts`. */
export type GuideBlock =
  | { readonly p: string }
  | { readonly h2: string }
  | { readonly list: readonly string[] }
  | { readonly code: string }
  | { readonly note: string };

const blocks = (b: GuideBlock[]): readonly GuideBlock[] => b;

export const en = {
  meta: {
    siteName: "SurfaceOne",
    tagline: "The design system for calm, local-first apps",
    description:
      "SurfaceOne is an accessible Angular design system: 50 component families, design tokens, three skins in light and dark, and fonts with full latin-ext coverage.",
  },
  a11y: {
    skipToContent: "Skip to content",
    mainNav: "Main",
    sectionNav: "Section",
    breadcrumb: "Breadcrumb",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    colorMode: "Colour mode",
    externalLink: "(opens in a new tab)",
    copyCode: "Copy code",
    copied: "Copied",
    onThisPage: "On this page",
    preview: "Live preview",
  },
  nav: {
    home: "Home",
    components: "Components",
    guide: "Guide",
    theme: "Theme",
    templates: "Templates",
    changelog: "Changelog",
    storybook: "Storybook",
    github: "GitHub",
  },
  colorMode: {
    system: "System",
    light: "Light",
    dark: "Dark",
  },
  footer: {
    madeBy: "Made by MonoOne.",
    license: "Released under the project licence.",
    resources: "Resources",
    project: "Project",
    changelog: "Changelog",
    contributing: "Contributing",
  },
  home: {
    title: "SurfaceOne — Angular design system",
    eyebrow: "Design system · v{version}",
    heading: "Build calm, accessible interfaces with SurfaceOne",
    lead: "Signal-first Angular components, design tokens and three hand-tuned skins — in light and dark — extracted from IndexOne and ready for any app.",
    getStarted: "Get started",
    browseComponents: "Browse components",
    openStorybook: "Open Storybook",
    installLabel: "Install",
    stats: {
      components: "component families",
      symbols: "components & directives",
      skins: "skins × light/dark",
      locales: "documentation languages",
    },
    featuresTitle: "Everything a product surface needs",
    features: {
      tokens: {
        title: "Tokens first",
        body: "Every colour, radius, space and shadow is a CSS custom property. Components read tokens, never raw values.",
      },
      skins: {
        title: "Three skins, two modes",
        body: "Studio, Paper and Minimalist re-declare the same tokens. Light, dark or system — switched with one attribute.",
      },
      a11y: {
        title: "Accessible by default",
        body: "Real buttons, ARIA patterns from the WAI-ARIA practices, visible focus, reduced motion and AA contrast.",
      },
      signals: {
        title: "Signals & zoneless",
        body: "Standalone, OnPush, signal inputs and models. Works with zoneless Angular and server-side rendering.",
      },
      fonts: {
        title: "latin-ext everywhere",
        body: "Every bundled font ships latin and latin-ext subsets, so ą, ł, ő, ř and ș never fall back mid-word.",
      },
      frameworks: {
        title: "Ready for more frameworks",
        body: "Tokens live in a framework-agnostic package. Angular ships today; Vue and React will share the same foundation.",
      },
    },
    showcaseTitle: "A taste of the components",
    showcaseLead:
      "Everything below is the real package, rendered live with the theme you picked.",
    ctaTitle: "Ship your next screen with SurfaceOne",
    ctaBody: "Install the package, load the tokens and start composing.",
  },
  components: {
    title: "Components",
    description:
      "Every SurfaceOne component, grouped by role: layout, elements, forms, data, navigation, overlays, page building blocks, AI chat, editor and media.",
    lead: "Every component lives in its own entry point, so an app only bundles what it imports.",
    filterLabel: "Filter components",
    filterPlaceholder: "Filter by name…",
    noResults: "No component matches “{query}”.",
    count: "{count} components",
    categories: {
      layout: {
        name: "Layout",
        description: "Structure a screen: sidebars, cards and dividers.",
      },
      element: {
        name: "Element",
        description:
          "The small building blocks: buttons, badges, alerts and indicators.",
      },
      form: {
        name: "Form",
        description: "Inputs, selects, switches, sliders and choice controls.",
      },
      data: {
        name: "Data",
        description: "Show records: tables, items, lists and empty states.",
      },
      navigation: {
        name: "Navigation",
        description: "Move through hierarchies.",
      },
      overlay: {
        name: "Overlay",
        description: "Dialogs, sheets, menus, tooltips and toasts.",
      },
      page: {
        name: "Page",
        description: "Headers and actions for a route.",
      },
      chat: {
        name: "AI Chat",
        description:
          "Threads, messages, bubbles and status markers for assistants.",
      },
      editor: {
        name: "Editor",
        description: "Render and write markdown.",
      },
      media: {
        name: "Media",
        description: "Recording, playback, transcripts and timelines.",
      },
    },
    page: {
      import: "Import",
      usage: "Usage",
      api: "API reference",
      selector: "Selector",
      exportAs: "Export as",
      inputs: "Inputs",
      outputs: "Outputs",
      name: "Name",
      type: "Type",
      default: "Default",
      required: "required",
      twoWay: "two-way",
      noInputs: "No inputs.",
      openInStorybook: "Open in Storybook",
      viewSource: "View source",
      previous: "Previous",
      next: "Next",
      preview: "Preview",
      code: "Code",
      kind: {
        component: "Component",
        directive: "Directive",
        pipe: "Pipe",
      },
    },
    entries: {
      sidebar:
        "A collapsible application sidebar with header, groups, menus, badges, a rail and an inset content area — shadcn/ui Sidebar for Angular.",
      card: "A surface that groups related content, with header, title, description, action, content and footer parts.",
      separator:
        "A one-pixel hairline between content, horizontal or vertical, decorative or semantic.",
      collapsible:
        "Show and hide a region with a trigger that keeps aria-expanded and aria-controls in sync.",
      disclosure:
        "A progressive-disclosure section following the WAI-ARIA Disclosure pattern.",
      alert:
        "A callout for important information, with title, description, action and five tones.",
      avatar:
        "A user image with initials fallback and a generic glyph when signed out.",
      badge:
        "A compact label for status, counts or tags, with six variants and four status tints.",
      banner:
        "A one-line status callout with a leading glyph; errors and warnings are announced to screen readers.",
      "bar-list":
        "A ranked list of labelled horizontal bars with the value beside each, scaled to the largest value or the total; labels can be any template.",
      button:
        "The one button: six variants, four text sizes and four square icon sizes, plus button groups.",
      icon: "Inline SVG glyphs drawn in currentColor — no icon font, no extra request.",
      kbd: "Keyboard keys and key combinations.",
      logo: "The SurfaceOne, IndexOne and Ivy marks that switch with the colour mode.",
      progress:
        "A linear progress bar, determinate or indeterminate, with an accessible progressbar role.",
      "download-progress":
        "A progress bar with a live caption and an optional cancel action.",
      meter:
        "A segmented indicator for coarse, ordinal quantities like accuracy or speed.",
      skeleton: "A pulsing placeholder sized by its host while content loads.",
      sparkline:
        "A word-sized line, area, bar or heat chart without axes in one stretched SVG, decorative by default or an image with a spoken summary.",
      spinner: "A spinning loader drawn in currentColor at any size.",
      input:
        "Fields, labels, descriptions, errors and input groups with addons — native inputs styled by the system.",
      select: "A native select as a form control with projected options.",
      switch: "An on/off switch that works as a form control, in two sizes.",
      slider:
        "A range slider with an accent fill and a round thumb, usable as a form control.",
      "power-slider":
        "A discrete ladder as a range control that previews while dragging and commits on release.",
      segmented:
        "A single-choice segmented control rendered from data — the Light / Dark / System pattern.",
      "toggle-group":
        "Toggles, toggle groups and tabs with roving focus and every orientation.",
      "choice-card":
        "Rich radio cards where the whole card is the option, with one tab stop and arrow-key navigation.",
      "secret-field":
        "Enter, save and clear a secret such as an API key, with a set / not set status.",
      table:
        "A dense data table defined by column templates, with captions and an empty state.",
      item: "A row of media, title, description and actions — for lists and settings.",
      "empty-state": "Explain an empty view and offer the next step.",
      "source-list":
        "A titled list of sources as chips or rows, with a show-more toggle.",
      "tree-row":
        "A file-tree row with indentation, expand toggle, selection and actions.",
      dialog:
        "Modal dialogs and alert dialogs with focus management, Escape and scrim dismissal.",
      sheet: "A modal panel docked to any edge of the window.",
      menu: "Dropdown menus with groups, labels, shortcuts, checkbox and radio items, sub-menus, and popovers.",
      "row-menu":
        "The ellipsis dropdown for per-row actions, with outside-click and keyboard handling.",
      tooltip:
        "A hover and focus tooltip for icon-only controls, on any side, with an optional arrow.",
      toaster:
        "Stacked toast notifications with actions and dismissal — the app owns the queue.",
      "page-header":
        "A route's title block with eyebrow, title, description and actions.",
      "page-actions":
        "A document page's header actions: status, a primary control and an overflow menu.",
      chat: "The full chat anatomy: pane, thread, messages, composer, submit, suggestions and typing indicator.",
      message:
        "One entry of a thread: avatar, header, bubbles and footer, aligned start or end.",
      bubble:
        "The speech bubble of a message, in default, secondary, muted and ghost variants.",
      marker:
        "A status line in a thread such as “Thinking…” or “Searched 4 notes”.",
      markdown:
        "Render GitHub-flavoured markdown as prose, and edit it with a toolbar, live preview and split view.",
      "audio-player":
        "A slim recording player with skip, progress, time and playback speed.",
      recording:
        "Record button, microphone toggle, level meter and status orb for capture UIs.",
      transcript: "A turn-grouped, click-to-seek transcript.",
      "side-panel": "A panel docked beside the page, with a header, title, actions, a close button and a scrolling body.",
      "floating-bar": "The pill that floats over every app while recording is ready, live or processing, with a close button.",
      "live-transcript": "The caption log of a recording in progress.",
      timeline:
        "Lanes of blocks and a chapter ribbon on one time scale, with a playhead, chapters and legend.",
    },
  },
  guide: {
    title: "Guide",
    description:
      "Learn how to install, theme and use SurfaceOne in an Angular app.",
    pages: {
      introduction: {
        title: "Introduction",
        description:
          "What SurfaceOne is, what it is built on and how the packages fit together.",
        blocks: blocks([
          {
            p: "SurfaceOne is the design system behind IndexOne, extracted into packages any app can use. It is built on **shadcn/ui** conventions, ported to Angular through **spartan/ui** anatomy, and reads every value from design tokens.",
          },
          { h2: "Packages" },
          {
            list: [
              "`@surface-one/tokens` — framework-agnostic CSS: tokens, the three skins in light and dark, accents and latin-ext fonts.",
              "`@surface-one/angular` — the components. Every component family is its own entry point, such as `@surface-one/angular/button`.",
            ],
          },
          {
            p: "Vue and React packages are planned. They will share `@surface-one/tokens`, so a theme looks identical in every framework.",
          },
          { h2: "Built on spartan/ui, shadcn/ui and Nuxt UI" },
          {
            list: [
              "**spartan/ui** (ng-spartan) — the Angular anatomy: directive-first parts, input names and behaviour.",
              "**shadcn/ui** — the visual core: variants, sizes and the styles our skins are built on.",
              "**Nuxt UI** — the documentation: component categories, templates, the MCP server and agent skills.",
            ],
          },
          { h2: "Principles" },
          {
            list: [
              "**Tokens only.** Components consume `var(--token)`; a skin re-declares tokens and never forks a component.",
              "**Native first.** A button is a `<button>`, a select is a `<select>`. ARIA fills the gaps native HTML leaves.",
              "**Signals and zoneless.** Standalone components, OnPush, signal inputs, models and outputs.",
              "**Flat, opaque surfaces.** No glass, no blur — calm chrome with a restrained accent.",
            ],
          },
          { h2: "Naming" },
          {
            p: "Every element selector starts with `sone-` (`<sone-dialog>`, `<sone-switch>`) and every attribute directive with `sone` (`button[soneBtn]`, `[soneCard]`). TypeScript symbols start with `Sone`.",
          },
          {
            note: "Want to poke at every state of a component? The [Storybook](/storybook/) renders each one with live controls.",
          },
        ]),
      },
      installation: {
        title: "Installation",
        description:
          "Add SurfaceOne to an Angular 22 application in three steps.",
        blocks: blocks([
          { h2: "1. Install the packages" },
          { code: "install" },
          {
            p: "The markdown entry point also needs its optional peers (`marked`, `dompurify` and the `@codemirror/*` packages). Install them only if you import `@surface-one/angular/markdown`.",
          },
          { h2: "2. Load the styles" },
          {
            p: "Add the tokens and the component stylesheet to the `styles` array of your build target, tokens first:",
          },
          { code: "angularJson" },
          {
            p: "Component styles are global on purpose: most parts are projected or portaled, where emulated encapsulation cannot reach.",
          },
          { h2: "3. Enable localization" },
          {
            p: "Components mark their built-in strings (such as “Close”) with `$localize`, so add the polyfill:",
          },
          { code: "localize" },
          { h2: "Use a component" },
          { code: "usage" },
          {
            p: "Next, pick a skin and colour mode on the [Theme](/theme) page.",
          },
        ]),
      },
      theming: {
        title: "Theming",
        description:
          "Switch skins, colour modes and accents with three attributes, and override any token.",
        blocks: blocks([
          { p: "Three attributes on `<html>` drive the whole system:" },
          {
            list: [
              "`data-skin` — `studio`, `paper` or `minimalist`.",
              "`data-theme` — `light`, `dark` or `system` (no attribute also follows the system).",
              "`data-accent` — `blue`, `teal`, `green`, `orange` or `pink`; no attribute uses the skin's own accent.",
            ],
          },
          { code: "themeAttributes" },
          { h2: "Avoid a flash of the wrong theme" },
          {
            p: "Set the attributes before the first paint with a tiny inline script in `index.html`:",
          },
          { code: "themeScript" },
          { h2: "Override tokens" },
          {
            p: "Every visual decision is a custom property. Re-declare one under the same selector to change it everywhere:",
          },
          { code: "overrideTokens" },
          { p: "See every token, live, on the [Theme](/theme) page." },
        ]),
      },
      fonts: {
        title: "Fonts",
        description:
          "Self-hosted variable fonts with latin and latin-ext subsets.",
        blocks: blocks([
          {
            p: "`@surface-one/tokens` bundles every font it references — Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono and Source Serif 4 — as self-hosted WOFF2 variable fonts. Nothing is loaded from a CDN.",
          },
          { h2: "latin-ext is mandatory" },
          {
            p: "Each family ships two files: **latin** and **latin-ext**. The latin subset alone has no ą, ć, ę, ł, ń, ś, ź, ż (or ő, ř, ș …), so the browser would draw those glyphs from a system face mid-word. A `unicode-range` split means a page downloads the latin-ext file only when it renders one of those characters.",
          },
          { code: "fontFace" },
          {
            p: "Chinese and Japanese text falls back to the platform's own CJK face through each font stack.",
          },
          { h2: "Adding a font" },
          {
            p: "A new family is accepted only with both subsets. Add the two WOFF2 files to `packages/tokens/fonts/` and a pair of `@font-face` rules to `fonts.css`.",
          },
        ]),
      },
      accessibility: {
        title: "Accessibility",
        description:
          "How SurfaceOne meets WCAG 2.2 AA and what your app still owns.",
        blocks: blocks([
          {
            p: "SurfaceOne targets **WCAG 2.2 level AA**. Components follow the WAI-ARIA Authoring Practices, and this documentation site is tested with axe-core on every page in light and dark mode.",
          },
          { h2: "What the components do" },
          {
            list: [
              'Use native elements first — `<button>`, `<select>`, `<input type="checkbox">` — so keyboard and screen-reader support come for free.',
              'Wire the ARIA patterns: disclosure (`aria-expanded`, `aria-controls`), radio groups with one tab stop and arrow keys, menus, dialogs that trap and restore focus, `role="progressbar"` with values.',
              "Show a visible focus ring on every interactive part (`--focus-ring`).",
              "Respect `prefers-reduced-motion` and keep text contrast at 4.5:1 or more in every skin.",
            ],
          },
          { h2: "What your app owns" },
          {
            list: [
              "Give every icon-only button an `aria-label`.",
              "Label every form control — use `soneFieldLabel` or a `<label for>`.",
              "Set `<html lang>` and a meaningful document title per route.",
              "Announce async results that matter, for example with the toaster or a live region.",
            ],
          },
        ]),
      },
      i18n: {
        title: "Internationalization",
        description: "Translate the built-in strings and support every script.",
        blocks: blocks([
          {
            p: "Components contain very little text of their own, and every built-in string (“Close”, “Show more”, “Downloading…”) is marked with `$localize`. Translate them with the standard Angular i18n workflow:",
          },
          { code: "extractI18n" },
          {
            p: "Plurals use ICU messages and follow the active locale's plural rules. Dates and durations are formatted with `Intl`.",
          },
          { h2: "Languages of this site" },
          {
            p: "This documentation is available in English, Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 and 日本語 — the same languages as the IndexOne website.",
          },
        ]),
      },
      mcp: {
        title: "MCP server",
        description:
          "Give Claude Code, Codex, GitHub Copilot, Cursor and Windsurf direct access to the SurfaceOne docs, API and tokens.",
        blocks: blocks([
          {
            p: "`@surface-one/angular-mcp` is a Model Context Protocol server. Your AI assistant asks it for a component's exact API, a working example, its source and styles, the guides, the screen templates and the theme variables — instead of guessing. Everything is bundled with the package: it works offline and always matches your version.",
          },
          { h2: "Claude Code" },
          { code: "mcpClaude" },
          { h2: "Codex" },
          { code: "mcpCodex" },
          { p: "Or add it to `~/.codex/config.toml`:" },
          { code: "mcpCodexToml" },
          { h2: "VS Code with GitHub Copilot" },
          { p: "Add `.vscode/mcp.json` to your project:" },
          { code: "mcpVsCode" },
          { h2: "Cursor, Windsurf and Claude Desktop" },
          { code: "mcpJson" },
          { h2: "Tools" },
          {
            list: [
              "`list_components` — every component family with its entry point and selectors.",
              "`get_component_docs` — description, import, a working example and the full API. Accepts names, slugs, classes or selectors such as `soneBtn`.",
              "`get_component_source_code` and `get_component_source_styles` — the implementation.",
              "`get_docs` — guide pages and release notes.",
              "`get_theme_variables` — token values for every skin in light and dark mode.",
              "`list_templates` and `get_template` — complete screens to start from.",
            ],
          },
          { h2: "Try asking" },
          {
            list: [
              "“Build a settings page with SurfaceOne: a switch, a select and a save button.”",
              "“Show me the API of the SurfaceOne dialog.”",
              "“Which tokens does the Paper skin use in dark mode?”",
            ],
          },
          {
            note: "Pair the server with the [agent skills](/guide/skills): the skills tell your assistant how to work with SurfaceOne, the server gives it the facts.",
          },
        ]),
      },
      skills: {
        title: "Agent skills",
        description:
          "Install the SurfaceOne skills for Claude Code, OpenAI Codex and GitHub Copilot with one command.",
        blocks: blocks([
          {
            p: "Agent skills are folders with a `SKILL.md` that an assistant loads when a task needs them. Claude Code, Codex and GitHub Copilot share the format, so one package serves all three.",
          },
          {
            list: [
              "`surface-one-angular` — build screens with the components: setup, entry points, `sone-` selectors, tokens, overlays and forms, with the full component catalogue.",
              "`surface-one-theming` — skins, light, dark and system mode, accents, token overrides and latin-ext fonts.",
              "`surface-one-a11y-review` — a WCAG 2.2 AA checklist for SurfaceOne screens.",
            ],
          },
          { h2: "Install" },
          { code: "skillsAdd" },
          { h2: "Where they go" },
          {
            list: [
              "**Claude Code** — `.claude/skills/` (globally `~/.claude/skills/`).",
              "**Codex** — `.agents/skills/` (globally `~/.agents/skills/`).",
              "**GitHub Copilot** — `.agents/skills/` (globally `~/.copilot/skills/`).",
            ],
          },
          {
            p: "Run the command again with `--force` after upgrading SurfaceOne to refresh the skills.",
          },
          {
            note: "Add the [MCP server](/guide/mcp) too — the skills use its tools when it is available.",
          },
        ]),
      },
      contributing: {
        title: "Contributing",
        description:
          "Branches, Conventional Commits, pull requests and code owners.",
        blocks: blocks([
          { p: "SurfaceOne follows the same rules as IndexOne." },
          { h2: "Branches and commits" },
          {
            list: [
              "Branch names are `<type>/<kebab-slug>`, for example `feat/sone-calendar`.",
              "Commit headers and PR titles follow Conventional Commits: `<type>(<scope>): <subject>`, at most 100 characters, subject in lowercase.",
              "No attribution of any kind — no AI co-author trailers or “generated with” footers.",
            ],
          },
          { code: "commit" },
          { h2: "Pull requests" },
          {
            p: "The PR body is the repository template: one short line per real change, in plain English. Every PR needs the approval of a code owner.",
          },
          { h2: "Adding a component" },
          {
            list: [
              "Create `packages/angular/<name>/` with the component, `index.ts` and `ng-package.json`.",
              "Use the `sone-` selector prefix, OnPush, signal inputs and tokens only.",
              "Add `<name>.stories.ts` and register the component in the docs catalogue with a demo.",
            ],
          },
        ]),
      },
    },
  },
  theme: {
    title: "Theme",
    description:
      "Design tokens, skins, colour modes and accents of SurfaceOne — live.",
    lead: "Every value on this page is read from the live tokens. Change the controls and the whole site follows.",
    controls: "Theme controls",
    skin: "Skin",
    mode: "Mode",
    accent: "Accent",
    accentDefault: "Skin default",
    skins: {
      studio: "Studio",
      paper: "Paper",
      minimalist: "Minimalist",
    },
    accents: {
      blue: "Blue",
      teal: "Teal",
      green: "Green",
      orange: "Orange",
      pink: "Pink",
    },
    sections: {
      colors: "Colour roles",
      colorsLead:
        "Semantic colours. Components use these names, never a palette step.",
      palette: "Accent palettes",
      typography: "Typography",
      typographyLead: "The type ladder every skin shares.",
      radius: "Radius",
      spacing: "Spacing",
      shadows: "Shadows",
      tokens: "All tokens",
      tokensLead:
        "The token files of @surface-one/tokens and the custom properties each declares.",
    },
    sample: "The quick brown fox jumps over the lazy dog — Zażółć gęślą jaźń",
    reset: "Reset",
  },
  templates: {
    title: "Templates",
    description:
      "Ready-made screens composed from SurfaceOne components: dashboard, AI chat, settings and meeting notes.",
    lead: "Full screens built only from the package. Copy them as a starting point.",
    view: "View template",
    back: "All templates",
    items: {
      dashboard: {
        title: "Dashboard",
        description:
          "A sidebar app shell with a page header, stats cards and a data table.",
      },
      chat: {
        title: "AI Chat",
        description:
          "An assistant thread with messages, markers, suggestions and a composer.",
      },
      settings: {
        title: "Settings",
        description:
          "Grouped preferences with fields, switches, choice cards and a secret.",
      },
      notes: {
        title: "Meeting notes",
        description:
          "A recording with an audio player, transcript and rendered notes.",
      },
    },
  },
  changelog: {
    title: "Changelog",
    description:
      "Every SurfaceOne release, newest first: new components, fixes and breaking changes, with the date each version shipped.",
    eyebrow: "Changelog",
    heading: "What's new in SurfaceOne",
    lead: "Every release of the design system, newest first. The tokens, the Angular components, the MCP server and the skills share one version.",
    npm: "Install from npm",
    github: "All releases on GitHub",
    latest: "Latest",
    englishNote: "Release notes are published in English.",
    versions: "Versions",
  },
  notFound: {
    title: "Page not found",
    description: "The page you are looking for does not exist.",
    back: "Back to home",
  },
};

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;
