// The mock data of the ecommerce template, shared by its Angular (ecommerce.template.ts), Vue
// (vue/ecommerce.vue) and React (react/ecommerce.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type CategoryId =
  "audio" | "wearables" | "desk" | "bags" | "accessories";
export type Sort =
  "featured" | "price-asc" | "price-desc" | "rating" | "newest";
export type Tone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Category {
  readonly id: CategoryId;
  readonly label: string;
}

export interface Colour {
  readonly id: string;
  readonly label: string;
  readonly tone: Tone;
}

export interface CartLine {
  readonly key: string;
  readonly productId: string;
  readonly colour: string;
  readonly size: string | null;
  readonly qty: number;
}

export interface QuickView {
  readonly productId: string;
  readonly colour: string;
  readonly size: string | null;
  readonly qty: number;
}

export const CATEGORIES: readonly Category[] = [
  { id: "audio", label: "Audio" },
  { id: "wearables", label: "Wearables" },
  { id: "desk", label: "Desk & home" },
  { id: "bags", label: "Bags" },
  { id: "accessories", label: "Accessories" },
];

export const COLOURS: readonly Colour[] = [
  { id: "indigo", label: "Indigo", tone: 1 },
  { id: "ocean", label: "Ocean", tone: 2 },
  { id: "berry", label: "Berry", tone: 3 },
  { id: "forest", label: "Forest", tone: 4 },
  { id: "amber", label: "Amber", tone: 5 },
  { id: "plum", label: "Plum", tone: 6 },
  { id: "rust", label: "Rust", tone: 7 },
  { id: "moss", label: "Moss", tone: 8 },
];

export const PRICE_MIN = 20;
export const PRICE_MAX = 300;
export const FREE_SHIPPING = 300;
export const SHIPPING = 6.95;
export const TAX_RATE = 0.08;
export const PROMO = { code: "SURFACE10", rate: 0.1 } as const;
export const LOW_STOCK = 5;

export const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
export const round2 = (n: number): number => Math.round(n * 100) / 100;
export const colourOf = (id: string): Colour =>
  COLOURS.find((c) => c.id === id) ?? COLOURS[0];
export const lineKey = (
  id: string,
  colour: string,
  size: string | null,
): string => [id, colour, size ?? ""].join(":");

export const INITIAL_CART: readonly CartLine[] = [
  {
    key: lineKey("aria", "indigo", null),
    productId: "aria",
    colour: "indigo",
    size: null,
    qty: 1,
  },
  {
    key: lineKey("folio", "ocean", null),
    productId: "folio",
    colour: "ocean",
    size: null,
    qty: 1,
  },
];
