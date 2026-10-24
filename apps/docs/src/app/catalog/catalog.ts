/**
 * The component catalogue, grouped the way Nuxt UI groups its components
 * (https://ui.nuxt.com/docs/components). One entry per secondary entry point of
 * `@surface-one/angular`; the copy comes from the locale messages. It imports no JSON:
 * the API tables live in `./api` and are loaded per component page only.
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
  "flow",
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
  {
    slug: "collapsible-section",
    name: "Collapsible Section",
    category: "layout",
  },
  { slug: "section-heading", name: "Section Heading", category: "layout" },
  { slug: "disclosure", name: "Disclosure", category: "layout" },
  { slug: "accordion", name: "Accordion", category: "layout" },
  { slug: "side-panel", name: "Side Panel", category: "layout" },
  // Element
  { slug: "alert", name: "Alert", category: "element" },
  { slug: "avatar", name: "Avatar", category: "element" },
  { slug: "badge", name: "Badge", category: "element" },
  { slug: "banner", name: "Banner", category: "element" },
  { slug: "confirm", name: "Confirm", category: "element" },
  { slug: "button", name: "Button", category: "element" },
  { slug: "icon", name: "Icon", category: "element" },
  { slug: "kbd", name: "Kbd", category: "element" },
  { slug: "logo", name: "Logo", category: "element" },
  { slug: "progress", name: "Progress", category: "element" },
  { slug: "download-progress", name: "Download Progress", category: "element" },
  { slug: "meter", name: "Meter", category: "element" },
  { slug: "skeleton", name: "Skeleton", category: "element" },
  { slug: "spinner", name: "Spinner", category: "element" },
  { slug: "status-dot", name: "Status Dot", category: "element" },
  // Form
  { slug: "input", name: "Field & Input Group", category: "form" },
  { slug: "select", name: "Select", category: "form" },
  { slug: "combobox", name: "Combobox", category: "form" },
  { slug: "calendar", name: "Calendar", category: "form" },
  { slug: "date-picker", name: "Date Picker", category: "form" },
  { slug: "checkbox", name: "Checkbox", category: "form" },
  { slug: "radio-group", name: "Radio Group", category: "form" },
  { slug: "switch", name: "Switch", category: "form" },
  { slug: "slider", name: "Slider", category: "form" },
  { slug: "power-slider", name: "Power Slider", category: "form" },
  { slug: "segmented", name: "Segmented", category: "form" },
  { slug: "toggle-group", name: "Toggle Group & Tabs", category: "form" },
  { slug: "search-field", name: "Search Field", category: "form" },
  { slug: "filter-chips", name: "Filter Chips", category: "form" },
  { slug: "choice-card", name: "Choice Card", category: "form" },
  { slug: "secret-field", name: "Secret Field", category: "form" },
  { slug: "copy-button", name: "Copy Button", category: "form" },
  { slug: "input-otp", name: "Input OTP", category: "form" },
  { slug: "password-input", name: "Password Input", category: "form" },
  { slug: "stepper", name: "Stepper", category: "form" },
  { slug: "tag-input", name: "Tag Input", category: "form" },
  { slug: "input-number", name: "Input Number", category: "form" },
  { slug: "rating", name: "Rating", category: "form" },
  // Data
  { slug: "table", name: "Table", category: "data" },
  { slug: "data-table", name: "Data Table", category: "data" },
  { slug: "item", name: "Item", category: "data" },
  { slug: "empty-state", name: "Empty", category: "data" },
  { slug: "load-more", name: "Load More", category: "data" },
  { slug: "source-list", name: "Source List", category: "data" },
  { slug: "chart-legend", name: "Chart Legend", category: "data" },
  { slug: "stacked-bar", name: "Stacked Bar", category: "data" },
  { slug: "stat", name: "Stat", category: "data" },
  { slug: "bar-list", name: "Bar List", category: "data" },
  { slug: "sparkline", name: "Sparkline", category: "data" },
  { slug: "bar-chart", name: "Bar Chart", category: "data" },
  { slug: "line-chart", name: "Line Chart", category: "data" },
  { slug: "area-chart", name: "Area Chart", category: "data" },
  { slug: "donut-chart", name: "Donut Chart", category: "data" },
  { slug: "graph", name: "Graph", category: "data" },
  // Navigation
  { slug: "breadcrumb", name: "Breadcrumb", category: "navigation" },
  { slug: "pagination", name: "Pagination", category: "navigation" },
  { slug: "tree-row", name: "Tree Row", category: "navigation" },
  { slug: "command", name: "Command", category: "navigation" },
  { slug: "tree", name: "Tree", category: "navigation" },
  // Overlay
  { slug: "dialog", name: "Dialog", category: "overlay" },
  { slug: "sheet", name: "Sheet", category: "overlay" },
  { slug: "menu", name: "Menu", category: "overlay" },
  { slug: "popover", name: "Popover", category: "overlay" },
  { slug: "row-menu", name: "Row Menu", category: "overlay" },
  { slug: "tooltip", name: "Tooltip", category: "overlay" },
  { slug: "toaster", name: "Toaster", category: "overlay" },
  // Page
  { slug: "page-header", name: "Page Header", category: "page" },
  { slug: "page-actions", name: "Page Actions", category: "page" },
  // AI Chat
  { slug: "chat", name: "Chat", category: "chat" },
  { slug: "terminal", name: "Terminal", category: "chat" },
  { slug: "agent-chat", name: "Agent Chat", category: "chat" },
  { slug: "chat-history", name: "Chat History", category: "chat" },
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
  // Flow
  { slug: "flow", name: "Flow", category: "flow" },
  { slug: "dock", name: "Dock", category: "flow" },
];

export function entryBySlug(slug: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.slug === slug);
}

export function entriesIn(category: Category): readonly CatalogEntry[] {
  return CATALOG.filter((e) => e.category === category);
}
