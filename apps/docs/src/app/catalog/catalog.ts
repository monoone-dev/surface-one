import api from "./api.generated.json";

/**
 * The component catalogue, grouped the way Nuxt UI groups its components
 * (https://ui.nuxt.com/docs/components). One entry per secondary entry point of
 * `@surface-one/angular`; the API tables come from `api.generated.json`
 * (`npm run docs:api`), the copy from the locale messages.
 */
export const CATEGORIES = [
  "layout",
  "element",
  "form",
  "data",
  "navigation",
  "overlay",
  "page",
  "chat",
  "editor",
  "media",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface CatalogEntry {
  /** The entry point folder: `@surface-one/angular/<slug>`. */
  readonly slug: string;
  /** The component's name — a proper noun, never translated. */
  readonly name: string;
  readonly category: Category;
}

export const CATALOG: readonly CatalogEntry[] = [
  // Layout
  { slug: "sidebar", name: "Sidebar", category: "layout" },
  { slug: "card", name: "Card", category: "layout" },
  { slug: "separator", name: "Separator", category: "layout" },
  { slug: "collapsible", name: "Collapsible", category: "layout" },
  { slug: "disclosure", name: "Disclosure", category: "layout" },
  { slug: "side-panel", name: "Side Panel", category: "layout" },
  // Element
  { slug: "alert", name: "Alert", category: "element" },
  { slug: "avatar", name: "Avatar", category: "element" },
  { slug: "badge", name: "Badge", category: "element" },
  { slug: "banner", name: "Banner", category: "element" },
  { slug: "button", name: "Button", category: "element" },
  { slug: "icon", name: "Icon", category: "element" },
  { slug: "kbd", name: "Kbd", category: "element" },
  { slug: "logo", name: "Logo", category: "element" },
  { slug: "progress", name: "Progress", category: "element" },
  { slug: "download-progress", name: "Download Progress", category: "element" },
  { slug: "meter", name: "Meter", category: "element" },
  { slug: "skeleton", name: "Skeleton", category: "element" },
  { slug: "spinner", name: "Spinner", category: "element" },
  // Form
  { slug: "input", name: "Field & Input Group", category: "form" },
  { slug: "select", name: "Select", category: "form" },
  { slug: "switch", name: "Switch", category: "form" },
  { slug: "slider", name: "Slider", category: "form" },
  { slug: "power-slider", name: "Power Slider", category: "form" },
  { slug: "segmented", name: "Segmented", category: "form" },
  { slug: "toggle-group", name: "Toggle Group & Tabs", category: "form" },
  { slug: "choice-card", name: "Choice Card", category: "form" },
  { slug: "secret-field", name: "Secret Field", category: "form" },
  // Data
  { slug: "table", name: "Table", category: "data" },
  { slug: "item", name: "Item", category: "data" },
  { slug: "empty-state", name: "Empty", category: "data" },
  { slug: "source-list", name: "Source List", category: "data" },
  // Navigation
  { slug: "tree-row", name: "Tree Row", category: "navigation" },
  // Overlay
  { slug: "dialog", name: "Dialog", category: "overlay" },
  { slug: "sheet", name: "Sheet", category: "overlay" },
  { slug: "menu", name: "Menu & Popover", category: "overlay" },
  { slug: "row-menu", name: "Row Menu", category: "overlay" },
  { slug: "tooltip", name: "Tooltip", category: "overlay" },
  { slug: "toaster", name: "Toaster", category: "overlay" },
  // Page
  { slug: "page-header", name: "Page Header", category: "page" },
  { slug: "page-actions", name: "Page Actions", category: "page" },
  // AI Chat
  { slug: "chat", name: "Chat", category: "chat" },
  { slug: "message", name: "Message", category: "chat" },
  { slug: "bubble", name: "Bubble", category: "chat" },
  { slug: "marker", name: "Marker", category: "chat" },
  // Editor
  { slug: "markdown", name: "Markdown & Editor", category: "editor" },
  // Media
  { slug: "audio-player", name: "Audio Player", category: "media" },
  { slug: "recording", name: "Recording", category: "media" },
  { slug: "floating-bar", name: "Floating Bar", category: "media" },
  { slug: "transcript", name: "Transcript", category: "media" },
  { slug: "live-transcript", name: "Live Transcript", category: "media" },
  { slug: "timeline", name: "Timeline", category: "media" },
  { slug: "speaker-chip", name: "Speaker Chip", category: "media" },
];

export function entryBySlug(slug: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.slug === slug);
}

export function entriesIn(category: Category): readonly CatalogEntry[] {
  return CATALOG.filter((e) => e.category === category);
}

export interface ApiInput {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly required: boolean;
  readonly model?: boolean;
  readonly description: string;
}

export interface ApiOutput {
  readonly name: string;
  readonly type: string;
  readonly description: string;
}

export interface ApiSymbol {
  readonly name: string;
  readonly kind: "component" | "directive" | "pipe";
  readonly selector: string;
  readonly exportAs: string;
  readonly description: string;
  readonly file: string;
  readonly inputs: readonly ApiInput[];
  readonly outputs: readonly ApiOutput[];
}

export interface ApiEntry {
  readonly import: string;
  readonly symbols: readonly ApiSymbol[];
  readonly stories: readonly { title: string; id: string }[];
}

const API = api as unknown as Record<string, ApiEntry>;

export function apiOf(slug: string): ApiEntry | undefined {
  return API[slug];
}

/** Every component/directive/pipe the package exports — for the home page stats. */
export const SYMBOL_COUNT = Object.values(API).reduce(
  (n, e) => n + e.symbols.filter((s) => s.kind !== "pipe").length,
  0,
);
