<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import {
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardAction,
  SoneCardContent,
  SoneCardDescription,
  SoneCardFooter,
  SoneCardHeader,
  SoneCardTitle,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
  SoneEmpty,
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneInputNumber,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneProgress,
  SoneRating,
  SoneSegmented,
  SoneSelect,
  SoneSlider,
  SoneSwitch,
  SoneToggleGroup,
  SoneToggleGroupItem,
  type SegmentOption,
  type ShellIcon,
} from "@surface-one/vue";

type CategoryId = "audio" | "wearables" | "desk" | "bags" | "accessories";
type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "newest";
type Density = "comfortable" | "compact";
type Tone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface Category {
  readonly id: CategoryId;
  readonly label: string;
}

interface Colour {
  readonly id: string;
  readonly label: string;
  readonly tone: Tone;
}

interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly category: CategoryId;
  readonly price: number;
  /** The price before the sale; a "−20%" badge when set. */
  readonly compareAt?: number;
  readonly rating: number;
  readonly reviews: number;
  readonly colours: readonly string[];
  readonly sizes?: readonly string[];
  readonly stock: number;
  readonly isNew?: boolean;
  /** Higher is newer: the "Newest" sort. */
  readonly added: number;
  readonly icon: ShellIcon;
  readonly tone: Tone;
  readonly description: string;
}

interface CartLine {
  readonly key: string;
  readonly productId: string;
  readonly colour: string;
  readonly size: string | null;
  readonly qty: number;
}

interface QuickView {
  readonly productId: string;
  readonly colour: string;
  readonly size: string | null;
  readonly qty: number;
}

const CATEGORIES: readonly Category[] = [
  { id: "audio", label: "Audio" },
  { id: "wearables", label: "Wearables" },
  { id: "desk", label: "Desk & home" },
  { id: "bags", label: "Bags" },
  { id: "accessories", label: "Accessories" },
];

const COLOURS: readonly Colour[] = [
  { id: "indigo", label: "Indigo", tone: 1 },
  { id: "ocean", label: "Ocean", tone: 2 },
  { id: "berry", label: "Berry", tone: 3 },
  { id: "forest", label: "Forest", tone: 4 },
  { id: "amber", label: "Amber", tone: 5 },
  { id: "plum", label: "Plum", tone: 6 },
  { id: "rust", label: "Rust", tone: 7 },
  { id: "moss", label: "Moss", tone: 8 },
];

const PRODUCTS: readonly Product[] = [
  {
    id: "aria",
    name: "Aria Wireless Headphones",
    brand: "Northwind Audio",
    category: "audio",
    price: 239,
    compareAt: 299,
    rating: 4.7,
    reviews: 1284,
    colours: ["indigo", "plum", "berry"],
    stock: 24,
    added: 6,
    icon: "audio-lines",
    tone: 1,
    description:
      "Over-ear headphones with adaptive noise cancelling, 40-hour battery and a fold-flat frame that fits any bag.",
  },
  {
    id: "pulse",
    name: "Pulse Earbuds",
    brand: "Northwind Audio",
    category: "audio",
    price: 129,
    rating: 4.4,
    reviews: 856,
    colours: ["ocean", "forest"],
    stock: 40,
    isNew: true,
    added: 12,
    icon: "radio",
    tone: 2,
    description:
      "Pocket-sized earbuds with a wireless charging case, sweat resistance and six hours of playback per charge.",
  },
  {
    id: "studio",
    name: "Studio Speaker Mini",
    brand: "Loop",
    category: "audio",
    price: 89,
    compareAt: 109,
    rating: 4.2,
    reviews: 342,
    colours: ["rust", "moss"],
    stock: 3,
    added: 3,
    icon: "audio-lines",
    tone: 7,
    description:
      "A palm-sized speaker with surprisingly full bass, a 12-hour battery and stereo pairing for two.",
  },
  {
    id: "orbit",
    name: "Orbit Smartwatch",
    brand: "Tempo",
    category: "wearables",
    price: 199,
    rating: 4.5,
    reviews: 611,
    colours: ["indigo", "moss"],
    sizes: ["40 mm", "44 mm"],
    stock: 15,
    added: 9,
    icon: "clock",
    tone: 6,
    description:
      "Heart rate, sleep and workout tracking on a bright always-on display, with a week between charges.",
  },
  {
    id: "stride",
    name: "Stride Fitness Band",
    brand: "Tempo",
    category: "wearables",
    price: 59,
    compareAt: 79,
    rating: 3.9,
    reviews: 204,
    colours: ["ocean", "berry", "amber"],
    sizes: ["S/M", "M/L"],
    stock: 32,
    added: 4,
    icon: "pulse",
    tone: 3,
    description:
      "A light band that counts steps and active minutes and nudges you to move, for under a hundred.",
  },
  {
    id: "halo",
    name: "Halo Desk Lamp",
    brand: "Lumen",
    category: "desk",
    price: 79,
    rating: 4.6,
    reviews: 418,
    colours: ["amber", "forest"],
    stock: 18,
    isNew: true,
    added: 11,
    icon: "sun",
    tone: 5,
    description:
      "Glare-free light with warm-to-cool colour temperature and a touch dimmer that remembers your setting.",
  },
  {
    id: "arc",
    name: "Arc 27″ Monitor",
    brand: "Lumen",
    category: "desk",
    price: 289,
    compareAt: 329,
    rating: 4.3,
    reviews: 157,
    colours: ["indigo"],
    stock: 0,
    added: 7,
    icon: "display",
    tone: 2,
    description:
      "A 4K panel with USB-C power delivery, so one cable charges your laptop and drives the screen.",
  },
  {
    id: "folio",
    name: "Folio Smart Notebook",
    brand: "Paperline",
    category: "desk",
    price: 34,
    rating: 4.8,
    reviews: 932,
    colours: ["berry", "ocean", "moss"],
    stock: 60,
    added: 8,
    icon: "notes",
    tone: 8,
    description:
      "Reusable dotted pages that scan to the cloud and wipe clean with a damp cloth.",
  },
  {
    id: "transit",
    name: "Transit Backpack",
    brand: "Field Supply",
    category: "bags",
    price: 119,
    rating: 4.7,
    reviews: 764,
    colours: ["forest", "indigo", "amber"],
    sizes: ["18 L", "22 L"],
    stock: 21,
    added: 5,
    icon: "shopping-bag",
    tone: 4,
    description:
      "A weatherproof commuter pack with a padded laptop sleeve, luggage strap and quick-access top pocket.",
  },
  {
    id: "weekender",
    name: "Weekender Duffel",
    brand: "Field Supply",
    category: "bags",
    price: 149,
    compareAt: 189,
    rating: 4.5,
    reviews: 233,
    colours: ["rust", "indigo"],
    stock: 4,
    added: 2,
    icon: "package",
    tone: 7,
    description:
      "Waxed canvas, leather handles and a separate shoe compartment: two nights away in one bag.",
  },
  {
    id: "dock",
    name: "Charge Stand Trio",
    brand: "Loop",
    category: "accessories",
    price: 69,
    rating: 4.1,
    reviews: 98,
    colours: ["plum", "moss"],
    stock: 27,
    isNew: true,
    added: 10,
    icon: "zap",
    tone: 6,
    description:
      "Charges a phone, a watch and earbuds at once from a single plug, on a weighted aluminium base.",
  },
  {
    id: "cable",
    name: "Braided Cable Kit",
    brand: "Loop",
    category: "accessories",
    price: 24,
    rating: 4.4,
    reviews: 517,
    colours: ["ocean", "amber", "berry"],
    stock: 120,
    added: 1,
    icon: "link",
    tone: 1,
    description:
      "Three braided USB-C cables in 0.5, 1 and 2 metres, rated for fast charging and data.",
  },
];

const PRICE_MIN = 20;
const PRICE_MAX = 300;
const FREE_SHIPPING = 300;
const SHIPPING = 6.95;
const TAX_RATE = 0.08;
const PROMO = { code: "SURFACE10", rate: 0.1 } as const;
const LOW_STOCK = 5;

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const usd = (n: number): string => USD.format(n);
const round2 = (n: number): number => Math.round(n * 100) / 100;

const productOf = (id: string): Product =>
  PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
const colourOf = (id: string): Colour =>
  COLOURS.find((c) => c.id === id) ?? COLOURS[0];
const lineKey = (id: string, colour: string, size: string | null): string =>
  [id, colour, size ?? ""].join(":");

const INITIAL_CART: readonly CartLine[] = [
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

const products = PRODUCTS;
const categories = CATEGORIES;
const counts = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.id,
    PRODUCTS.filter((p) => p.category === c.id).length,
  ]),
) as Record<CategoryId, number>;
const freeShipping = usd(FREE_SHIPPING).replace(".00", "");

const ratingOptions: readonly SegmentOption[] = [
  { value: "0", label: "Any" },
  { value: "4", label: "4+" },
  { value: "4.5", label: "4.5+" },
];
const sorts: readonly { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];
const densities: readonly SegmentOption[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

// Filters, sort and view.
const query = ref("");
const category = ref<CategoryId | "all">("all");
const maxPrice = ref(PRICE_MAX);
const minRating = ref("0");
const inStock = ref(false);
const sort = ref<string>("featured");
const density = ref<string>("comfortable");
const filtersOpen = ref(false);

const filtered = computed(
  () =>
    category.value !== "all" ||
    maxPrice.value < PRICE_MAX ||
    minRating.value !== "0" ||
    inStock.value ||
    query.value.trim() !== "",
);

const categoryLabel = computed(() => {
  const id = category.value;
  return id === "all"
    ? "All products"
    : (CATEGORIES.find((c) => c.id === id)?.label ?? "All products");
});

const visible = computed<readonly Product[]>(() => {
  const q = query.value.trim().toLowerCase();
  const cat = category.value;
  const max = maxPrice.value;
  const min = Number(minRating.value);
  const stock = inStock.value;
  const rows = PRODUCTS.filter(
    (p) =>
      (cat === "all" || p.category === cat) &&
      p.price <= max &&
      p.rating >= min &&
      (!stock || p.stock > 0) &&
      (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)),
  );
  const by: Record<Sort, (a: Product, b: Product) => number> = {
    featured: () => 0,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    newest: (a, b) => b.added - a.added,
  };
  return [...rows].sort(by[sort.value as Sort] ?? by.featured);
});

// Wishlist.
const wishlist = ref<readonly string[]>(["halo"]);

// Cart.
const lines = ref<readonly CartLine[]>(INITIAL_CART);
const announcement = ref("");

const cartRows = computed(() =>
  lines.value.map((l) => {
    const product = productOf(l.productId);
    return {
      ...l,
      product,
      variant: [colourOf(l.colour).label, l.size].filter(Boolean).join(" · "),
      max: maxQty(product),
      total: product.price * l.qty,
    };
  }),
);
const itemCount = computed(() => lines.value.reduce((n, l) => n + l.qty, 0));
const itemsLabel = computed(() =>
  itemCount.value === 1 ? "1 item" : `${itemCount.value} items`,
);
const subtotal = computed(() =>
  round2(cartRows.value.reduce((s, l) => s + l.total, 0)),
);

// Promo code.
const promoInput = ref("");
const promoError = ref<string | null>(null);
const promo = ref(false);

const discount = computed(() =>
  promo.value ? round2(subtotal.value * PROMO.rate) : 0,
);
const shippingLeft = computed(() =>
  Math.max(0, round2(FREE_SHIPPING - subtotal.value)),
);
const shipping = computed(() => (shippingLeft.value > 0 ? SHIPPING : 0));
const tax = computed(() =>
  round2((subtotal.value - discount.value) * TAX_RATE),
);
const total = computed(() =>
  round2(subtotal.value - discount.value + shipping.value + tax.value),
);

// Quick view.
const quick = ref<QuickView | null>(null);
const quickView = computed(() => {
  const q = quick.value;
  return q ? { ...q, product: productOf(q.productId) } : null;
});

const money = usd;

function off(price: number, was: number): number {
  return Math.round((1 - price / was) * 100);
}

function colour(id: string): Colour {
  return colourOf(id);
}

function maxQty(p: Product): number {
  return Math.max(1, Math.min(p.stock, 10));
}

function isSaved(id: string): boolean {
  return wishlist.value.includes(id);
}

function toggleWish(id: string): void {
  wishlist.value = wishlist.value.includes(id)
    ? wishlist.value.filter((x) => x !== id)
    : [...wishlist.value, id];
}

function clearFilters(): void {
  query.value = "";
  category.value = "all";
  maxPrice.value = PRICE_MAX;
  minRating.value = "0";
  inStock.value = false;
}

function focusCart(): void {
  // Runs on click only: never on the server.
  document.getElementById("shop-cart-title")?.focus();
}

/** "Add to cart" on a card: the first colour and size. */
function quickAdd(p: Product): void {
  add(p, p.colours[0], p.sizes?.[0] ?? null, 1);
}

function openQuickView(p: Product): void {
  quick.value = {
    productId: p.id,
    colour: p.colours[0],
    size: p.sizes?.[0] ?? null,
    qty: 1,
  };
}

function closeQuickView(): void {
  quick.value = null;
}

function setQuick(patch: Partial<Omit<QuickView, "productId">>): void {
  if (quick.value) quick.value = { ...quick.value, ...patch };
}

function addFromQuickView(): void {
  const q = quick.value;
  if (!q) return;
  add(productOf(q.productId), q.colour, q.size, q.qty);
  quick.value = null;
}

function add(p: Product, c: string, size: string | null, qty: number): void {
  const key = lineKey(p.id, c, size);
  const max = maxQty(p);
  lines.value = lines.value.some((l) => l.key === key)
    ? lines.value.map((l) =>
        l.key === key ? { ...l, qty: Math.min(l.qty + qty, max) } : l,
      )
    : [...lines.value, { key, productId: p.id, colour: c, size, qty }];
  announcement.value = `Added ${p.name} to your cart. ${itemsLabel.value} in cart.`;
}

function setQty(key: string, qty: number | null): void {
  if (qty === null) return;
  lines.value = lines.value.map((l) => (l.key === key ? { ...l, qty } : l));
}

function remove(key: string): void {
  const line = lines.value.find((l) => l.key === key);
  lines.value = lines.value.filter((l) => l.key !== key);
  if (line) {
    announcement.value = `Removed ${productOf(line.productId).name}. ${itemsLabel.value} in cart.`;
  }
  // The removed line held focus: keep it in the cart.
  if (lines.value.length === 0) void nextTick(focusCart);
}

function applyPromo(): void {
  const code = promoInput.value.trim().toUpperCase();
  if (!code) {
    promoError.value = "Enter a promo code.";
  } else if (code !== PROMO.code) {
    promoError.value = `“${code}” is not a valid promo code.`;
  } else {
    promo.value = true;
    promoError.value = null;
    promoInput.value = "";
    announcement.value = `Promo code ${PROMO.code} applied: 10% off.`;
  }
}

function removePromo(): void {
  promo.value = false;
  announcement.value = "Promo code removed.";
}
</script>

<template>
  <div class="ecommerce">
    <SonePageHeader as="div">
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Northwind Goods · Store</SonePageHeaderEyebrow>
        <SonePageHeaderTitle as="h2">Shop</SonePageHeaderTitle>
        <SonePageHeaderDescription>
          Everyday tech and carry, picked by our team. Free shipping on orders
          over {{ freeShipping }}.
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
      <SonePageHeaderActions>
        <SoneInputGroup class="search">
          <SoneInputGroupAddon><SoneIcon icon="search" /></SoneInputGroupAddon>
          <SoneInputGroupInput
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Search products"
            aria-label="Search products"
          />
        </SoneInputGroup>
        <SoneButton
          variant="outline"
          size="sm"
          type="button"
          :aria-label="'Cart, ' + itemsLabel"
          @click="focusCart"
        >
          <SoneIcon icon="shopping-cart" /><span>Cart</span>
          <SoneBadge class="count">{{ itemCount }}</SoneBadge>
        </SoneButton>
      </SonePageHeaderActions>
    </SonePageHeader>

    <div class="shop">
      <SoneCard
        as="aside"
        class="filters"
        aria-labelledby="shop-filters-title"
        :data-open="filtersOpen ? '' : undefined"
      >
        <SoneCardHeader>
          <SoneCardTitle id="shop-filters-title">Filters</SoneCardTitle>
          <SoneCardAction class="filters-toggle">
            <SoneButton
              variant="outline"
              size="sm"
              type="button"
              aria-controls="shop-filters-body"
              :aria-expanded="filtersOpen"
              @click="filtersOpen = !filtersOpen"
            >
              <SoneIcon icon="sliders" /><span>{{
                filtersOpen ? "Hide" : "Show"
              }}</span>
            </SoneButton>
          </SoneCardAction>
        </SoneCardHeader>
        <SoneCardContent id="shop-filters-body" class="filters-body">
          <fieldset class="group">
            <legend class="group-label">Category</legend>
            <label class="option">
              <input
                type="radio"
                name="shop-category"
                value="all"
                :checked="category === 'all'"
                @change="category = 'all'"
              />
              <span class="option-label">All products</span>
              <span class="option-count">{{ products.length }}</span>
            </label>
            <label v-for="c in categories" :key="c.id" class="option">
              <input
                type="radio"
                name="shop-category"
                :value="c.id"
                :checked="category === c.id"
                @change="category = c.id"
              />
              <span class="option-label">{{ c.label }}</span>
              <span class="option-count">{{ counts[c.id] }}</span>
            </label>
          </fieldset>

          <div class="group">
            <div class="group-row">
              <span id="shop-price-label" class="group-label">Price</span>
              <span class="group-value">Up to {{ money(maxPrice) }}</span>
            </div>
            <SoneSlider
              v-model="maxPrice"
              aria-label="Maximum price"
              :min="PRICE_MIN"
              :max="PRICE_MAX"
              :step="10"
            />
            <div class="range-ends" aria-hidden="true">
              <span>{{ money(PRICE_MIN) }}</span
              ><span>{{ money(PRICE_MAX) }}</span>
            </div>
          </div>

          <div class="group">
            <span id="shop-rating-label" class="group-label">Rating</span>
            <SoneSegmented
              v-model="minRating"
              size="sm"
              aria-label="Minimum rating"
              :options="ratingOptions"
            />
          </div>

          <SoneField orientation="horizontal" class="stock-field">
            <SoneFieldLabel for="shop-in-stock">In stock only</SoneFieldLabel>
            <SoneSwitch v-model="inStock" size="sm" input-id="shop-in-stock" />
          </SoneField>

          <SoneButton
            variant="ghost"
            size="sm"
            type="button"
            class="clear"
            :disabled="!filtered"
            @click="clearFilters"
          >
            <SoneIcon icon="refresh" /><span>Clear filters</span>
          </SoneButton>
        </SoneCardContent>
      </SoneCard>

      <section class="catalog" aria-labelledby="shop-products-title">
        <div class="toolbar">
          <div class="toolbar-title">
            <h3 id="shop-products-title">{{ categoryLabel }}</h3>
            <p class="result-count" aria-live="polite">
              {{ visible.length }} of {{ products.length }} products
            </p>
          </div>
          <div class="toolbar-actions">
            <label class="sort-label" for="shop-sort">Sort by</label>
            <SoneSelect v-model="sort" select-id="shop-sort" size="sm">
              <option v-for="s in sorts" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </SoneSelect>
            <SoneSegmented
              v-model="density"
              size="sm"
              aria-label="Grid density"
              :options="densities"
            />
          </div>
        </div>

        <ul v-if="visible.length" class="products" :data-density="density">
          <li v-for="p in visible" :key="p.id">
            <article class="product" :aria-labelledby="'shop-p-' + p.id">
              <div class="art" :data-tone="p.tone">
                <SoneIcon :icon="p.icon" />
              </div>
              <div class="flags">
                <SoneBadge v-if="p.compareAt" variant="destructive"
                  >−{{ off(p.price, p.compareAt) }}%</SoneBadge
                >
                <SoneBadge v-if="p.isNew">New</SoneBadge>
                <SoneBadge v-if="p.stock === 0" variant="secondary"
                  >Sold out</SoneBadge
                >
                <SoneBadge v-else-if="p.stock <= LOW_STOCK" variant="warning"
                  >Low stock</SoneBadge
                >
              </div>
              <SoneButton
                variant="secondary"
                size="icon-sm"
                type="button"
                class="wish"
                :aria-pressed="isSaved(p.id)"
                :aria-label="'Save ' + p.name + ' to wishlist'"
                :title="isSaved(p.id) ? 'Saved' : 'Save to wishlist'"
                @click="toggleWish(p.id)"
              >
                <SoneIcon icon="heart" />
              </SoneButton>
              <div class="product-body">
                <p class="brand">{{ p.brand }}</p>
                <h4 :id="'shop-p-' + p.id" class="name">{{ p.name }}</h4>
                <div class="rating-row">
                  <SoneRating size="sm" readonly :model-value="p.rating" />
                  <span class="reviews">
                    {{ p.rating }}
                    <span aria-hidden="true">({{ p.reviews }})</span>
                    <span class="sr-only">from {{ p.reviews }} reviews</span>
                  </span>
                </div>
                <p class="price-row">
                  <template v-if="p.compareAt">
                    <span class="sr-only">Sale price</span>
                    <span class="price sale">{{ money(p.price) }}</span>
                    <span class="sr-only">, was</span>
                    <s class="was">{{ money(p.compareAt) }}</s>
                  </template>
                  <span v-else class="price">{{ money(p.price) }}</span>
                </p>
                <ul class="swatches" aria-label="Colours">
                  <li
                    v-for="c in p.colours"
                    :key="c"
                    class="swatch"
                    :data-tone="colour(c).tone"
                    :title="colour(c).label"
                  >
                    <span class="sr-only">{{ colour(c).label }}</span>
                  </li>
                </ul>
              </div>
              <div class="product-actions">
                <SoneButton
                  size="sm"
                  type="button"
                  class="add"
                  :disabled="p.stock === 0"
                  :aria-describedby="'shop-p-' + p.id"
                  @click="quickAdd(p)"
                >
                  <span v-if="p.stock === 0">Sold out</span>
                  <template v-else>
                    <SoneIcon icon="shopping-cart" /><span>Add to cart</span>
                  </template>
                </SoneButton>
                <SoneButton
                  variant="outline"
                  size="icon-sm"
                  type="button"
                  :aria-label="'Quick view ' + p.name"
                  title="Quick view"
                  @click="openQuickView(p)"
                >
                  <SoneIcon icon="eye" />
                </SoneButton>
              </div>
            </article>
          </li>
        </ul>
        <SoneEmpty
          v-else
          class="no-results"
          icon="search"
          title="No products match"
          description="Try a different search, widen the price range or clear the filters."
        >
          <SoneButton
            variant="outline"
            size="sm"
            type="button"
            @click="clearFilters"
          >
            <SoneIcon icon="refresh" /><span>Clear filters</span>
          </SoneButton>
        </SoneEmpty>
      </section>

      <SoneCard as="section" class="cart" aria-labelledby="shop-cart-title">
        <SoneCardHeader>
          <SoneCardTitle id="shop-cart-title" class="cart-title" tabindex="-1">
            Your cart
          </SoneCardTitle>
          <SoneCardDescription>{{ itemsLabel }}</SoneCardDescription>
        </SoneCardHeader>
        <SoneCardContent class="cart-body">
          <template v-if="lines.length">
            <div class="shipping">
              <p class="shipping-text">
                <template v-if="shippingLeft > 0">
                  <SoneIcon icon="truck" />
                  <span
                    >Add <strong>{{ money(shippingLeft) }}</strong> more for
                    free shipping</span
                  >
                </template>
                <template v-else>
                  <SoneIcon icon="circle-check" />
                  <span>You've unlocked <strong>free shipping</strong></span>
                </template>
              </p>
              <SoneProgress
                aria-label="Progress toward free shipping"
                :value="subtotal"
                :max="FREE_SHIPPING"
              />
            </div>

            <ul class="lines">
              <li v-for="line in cartRows" :key="line.key" class="line">
                <div class="thumb" :data-tone="line.product.tone">
                  <SoneIcon :icon="line.product.icon" />
                </div>
                <div class="line-main">
                  <p class="line-name">{{ line.product.name }}</p>
                  <p class="line-variant">{{ line.variant }}</p>
                  <SoneInputNumber
                    size="sm"
                    :min="1"
                    :max="line.max"
                    :model-value="line.qty"
                    :aria-label="'Quantity of ' + line.product.name"
                    @update:model-value="setQty(line.key, $event)"
                  />
                </div>
                <div class="line-side">
                  <span class="line-total">{{ money(line.total) }}</span>
                  <SoneButton
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    :aria-label="'Remove ' + line.product.name"
                    title="Remove"
                    @click="remove(line.key)"
                  >
                    <SoneIcon icon="trash" />
                  </SoneButton>
                </div>
              </li>
            </ul>

            <div v-if="promo" class="promo-applied">
              <SoneBadge variant="success"
                ><SoneIcon icon="tag" />{{ PROMO.code }} · 10% off</SoneBadge
              >
              <SoneButton
                variant="link"
                size="xs"
                type="button"
                @click="removePromo"
              >
                Remove code
              </SoneButton>
            </div>
            <SoneField v-else :invalid="!!promoError">
              <SoneFieldLabel for="shop-promo">Promo code</SoneFieldLabel>
              <div class="promo-row">
                <input
                  id="shop-promo"
                  v-model="promoInput"
                  type="text"
                  autocomplete="off"
                  placeholder="Enter code"
                  @keydown.enter="applyPromo"
                />
                <SoneButton variant="outline" type="button" @click="applyPromo">
                  Apply
                </SoneButton>
              </div>
              <SoneFieldError v-if="promoError">{{
                promoError
              }}</SoneFieldError>
              <SoneFieldDescription v-else>
                Try {{ PROMO.code }} for 10% off.
              </SoneFieldDescription>
            </SoneField>

            <dl class="summary">
              <div class="summary-row">
                <dt>Subtotal</dt>
                <dd>{{ money(subtotal) }}</dd>
              </div>
              <div v-if="discount > 0" class="summary-row discount">
                <dt>Discount</dt>
                <dd>−{{ money(discount) }}</dd>
              </div>
              <div class="summary-row">
                <dt>Shipping</dt>
                <dd>{{ shipping === 0 ? "Free" : money(shipping) }}</dd>
              </div>
              <div class="summary-row">
                <dt>Estimated tax</dt>
                <dd>{{ money(tax) }}</dd>
              </div>
              <div class="summary-row total">
                <dt>Total</dt>
                <dd>{{ money(total) }}</dd>
              </div>
            </dl>
          </template>
          <SoneEmpty
            v-else
            icon="shopping-bag"
            title="Your cart is empty"
            description="Add something you like and it shows up here."
          />
        </SoneCardContent>
        <SoneCardFooter v-if="lines.length" class="cart-footer">
          <SoneButton type="button" class="checkout">
            <SoneIcon icon="credit-card" /><span>Checkout</span>
            <SoneIcon icon="arrow-right" />
          </SoneButton>
          <p class="secure">
            <SoneIcon icon="lock" /> Secure checkout · 30-day returns
          </p>
        </SoneCardFooter>
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </SoneCard>
    </div>

    <SoneDialog v-if="quickView" size="lg" @dismiss="closeQuickView">
      <div class="qv">
        <div class="qv-art art" :data-tone="quickView.product.tone">
          <SoneIcon :icon="quickView.product.icon" />
        </div>
        <div class="qv-info">
          <SoneDialogHeader as="header">
            <p class="brand">{{ quickView.product.brand }}</p>
            <SoneDialogTitle>{{ quickView.product.name }}</SoneDialogTitle>
            <SoneDialogDescription>{{
              quickView.product.description
            }}</SoneDialogDescription>
          </SoneDialogHeader>
          <div class="rating-row">
            <SoneRating
              size="sm"
              readonly
              :model-value="quickView.product.rating"
            />
            <span class="reviews">
              {{ quickView.product.rating }} ·
              {{ quickView.product.reviews }} reviews
            </span>
          </div>
          <p class="price-row qv-price">
            <template v-if="quickView.product.compareAt">
              <span class="sr-only">Sale price</span>
              <span class="price sale">{{
                money(quickView.product.price)
              }}</span>
              <span class="sr-only">, was</span>
              <s class="was">{{ money(quickView.product.compareAt) }}</s>
              <SoneBadge variant="destructive"
                >−{{
                  off(quickView.product.price, quickView.product.compareAt)
                }}%</SoneBadge
              >
            </template>
            <span v-else class="price">{{
              money(quickView.product.price)
            }}</span>
          </p>

          <div class="qv-choice">
            <span id="shop-qv-colour" class="group-label"
              >Colour · {{ colour(quickView.colour).label }}</span
            >
            <SoneToggleGroup
              variant="outline"
              size="sm"
              :spacing="1"
              role="group"
              aria-labelledby="shop-qv-colour"
            >
              <SoneToggleGroupItem
                v-for="c in quickView.product.colours"
                :key="c"
                type="button"
                :pressed="quickView.colour === c"
                @click="setQuick({ colour: c })"
              >
                <span class="dot" :data-tone="colour(c).tone"></span>
                {{ colour(c).label }}
              </SoneToggleGroupItem>
            </SoneToggleGroup>
          </div>

          <div v-if="quickView.product.sizes" class="qv-choice">
            <span id="shop-qv-size" class="group-label">Size</span>
            <SoneToggleGroup
              variant="outline"
              size="sm"
              :spacing="1"
              role="group"
              aria-labelledby="shop-qv-size"
            >
              <SoneToggleGroupItem
                v-for="s in quickView.product.sizes"
                :key="s"
                type="button"
                :pressed="quickView.size === s"
                @click="setQuick({ size: s })"
              >
                {{ s }}
              </SoneToggleGroupItem>
            </SoneToggleGroup>
          </div>

          <SoneField class="qv-qty">
            <SoneFieldLabel for="shop-qv-qty">Quantity</SoneFieldLabel>
            <SoneInputNumber
              input-id="shop-qv-qty"
              :min="1"
              :max="maxQty(quickView.product)"
              :model-value="quickView.qty"
              @update:model-value="setQuick({ qty: $event ?? 1 })"
            />
            <SoneFieldDescription>
              <template v-if="quickView.product.stock <= LOW_STOCK">
                Only {{ quickView.product.stock }} left in stock.
              </template>
              <template v-else>In stock, ships in 1–2 business days.</template>
            </SoneFieldDescription>
          </SoneField>
        </div>
      </div>
      <SoneDialogFooter as="footer">
        <SoneButton
          variant="outline"
          type="button"
          :aria-pressed="isSaved(quickView.product.id)"
          @click="toggleWish(quickView.product.id)"
        >
          <SoneIcon icon="heart" /><span>{{
            isSaved(quickView.product.id) ? "Saved" : "Save"
          }}</span>
        </SoneButton>
        <SoneButton type="button" @click="addFromQuickView">
          <SoneIcon icon="shopping-cart" /><span
            >Add to cart ·
            {{ money(quickView.product.price * quickView.qty) }}</span
          >
        </SoneButton>
      </SoneDialogFooter>
    </SoneDialog>
  </div>
</template>

<style scoped>
.ecommerce {
  display: block;
  padding: var(--space-6);
}
.search {
  width: 16rem;
  max-width: 100%;
}
.count {
  min-width: 1.25rem;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}
.shop {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr) 21rem;
  align-items: start;
  gap: var(--space-5);
  margin-top: var(--space-5);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Filters */
.filters {
  position: sticky;
  top: var(--space-4);
}
.filters-toggle {
  display: none;
}
.filters-body {
  display: grid;
  gap: var(--space-5);
}
.group {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.group-label {
  padding: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.group-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}
.group-value,
.range-ends {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.range-ends {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
}
.option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}
.option:has(input:checked) {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}
.option-label {
  flex: 1;
}
.option-count {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.stock-field {
  justify-content: space-between;
}
.clear {
  justify-self: start;
}

/* Toolbar */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.toolbar-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}
.result-count {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.sort-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* Product grid */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.products[data-density="compact"] {
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  gap: var(--space-3);
}
.product {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--card-radius);
  background: var(--surface-raised);
  box-shadow: var(--card-shadow);
  transition: border-color var(--transition-fast);
}
.product:hover {
  border-color: var(--border-strong);
}
.art {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  background:
    radial-gradient(
      circle at 30% 20%,
      color-mix(in oklch, var(--_tone) 30%, transparent),
      transparent 60%
    ),
    linear-gradient(
      145deg,
      color-mix(in oklch, var(--_tone) 18%, var(--surface-base)),
      color-mix(in oklch, var(--_tone) 6%, var(--surface-base))
    );
  color: var(--_tone);
  --icon-size: var(--icon-size-xl);
}
.art sone-icon {
  opacity: 0.85;
}
[data-tone="1"] {
  --_tone: var(--chart-1);
}
[data-tone="2"] {
  --_tone: var(--chart-2);
}
[data-tone="3"] {
  --_tone: var(--chart-3);
}
[data-tone="4"] {
  --_tone: var(--chart-4);
}
[data-tone="5"] {
  --_tone: var(--chart-5);
}
[data-tone="6"] {
  --_tone: var(--chart-6);
}
[data-tone="7"] {
  --_tone: var(--chart-7);
}
[data-tone="8"] {
  --_tone: var(--chart-8);
}
.products[data-density="compact"] .art {
  aspect-ratio: 1;
  --icon-size: var(--icon-size-lg);
}
.flags {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  max-width: calc(100% - 3.5rem);
}
.wish {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}
.wish[aria-pressed="true"] {
  color: var(--danger-text);
}
.product-body {
  display: grid;
  flex: 1;
  align-content: start;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4) var(--space-2);
}
.brand {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.name {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
}
.rating-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.reviews {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  margin: var(--space-1) 0 0;
}
.price {
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
}
.price.sale {
  color: var(--danger-text);
}
.was {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
}
.swatches {
  display: flex;
  gap: var(--space-1);
  margin: var(--space-1) 0 0;
  padding: 0;
  list-style: none;
}
.swatch,
.dot {
  width: 0.875rem;
  height: 0.875rem;
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--_tone);
}
.product-actions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4) var(--space-4);
}
.add {
  flex: 1;
}
.products[data-density="compact"] .swatches,
.products[data-density="compact"] .brand {
  display: none;
}
.products[data-density="compact"] .product-body,
.products[data-density="compact"] .product-actions {
  padding-inline: var(--space-3);
}
.no-results {
  border: var(--border-width-thin) dashed var(--border);
  border-radius: var(--card-radius);
}

/* Cart */
.cart {
  position: sticky;
  top: var(--space-4);
}
.cart-title:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-control);
}
.cart-body {
  display: grid;
  gap: var(--space-4);
}
.shipping {
  display: grid;
  gap: var(--space-2);
}
.shipping-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.shipping-text strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}
.lines {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.line {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.thumb {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius);
  background: color-mix(in oklch, var(--_tone) 16%, var(--surface-base));
  color: var(--_tone);
}
.line-main {
  display: grid;
  justify-items: start;
  gap: var(--space-1);
  min-width: 0;
}
.line-name {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.line-variant {
  margin: 0 0 var(--space-1);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.line-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}
.line-total {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-variant-numeric: tabular-nums;
}
.promo-row {
  display: flex;
  gap: var(--space-2);
}
.promo-row input {
  flex: 1;
  min-width: 0;
  text-transform: uppercase;
}
.promo-row input::placeholder {
  text-transform: none;
}
.promo-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.summary {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--font-size-sm);
}
.summary-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}
.summary-row dt {
  color: var(--text-secondary);
}
.summary-row dd {
  margin: 0;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.summary-row.discount dd {
  color: var(--success-text);
}
.summary-row.total {
  padding-top: var(--space-2);
  border-top: var(--border-width-thin) solid var(--border);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.summary-row.total dt {
  color: var(--text-primary);
}
.cart-footer {
  display: grid;
  gap: var(--space-2);
}
.checkout {
  width: 100%;
}
.secure {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

/* Quick view */
.qv {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: var(--space-5);
}
.qv-art {
  align-self: start;
  aspect-ratio: 1;
  border-radius: var(--radius);
  --icon-size: calc(var(--icon-size-xl) * 1.5);
}
.qv-info {
  display: grid;
  align-content: start;
  gap: var(--space-4);
}
.qv-price {
  margin: 0;
}
.qv-choice {
  display: grid;
  gap: var(--space-2);
}
.qv-choice .toggle-group {
  flex-wrap: wrap;
}
.qv-qty sone-input-number {
  justify-self: start;
}
.dot {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
}

@media (max-width: 1200px) {
  .shop {
    grid-template-columns: 14rem minmax(0, 1fr);
  }
  .cart {
    position: static;
    grid-column: 2;
  }
}
@media (max-width: 760px) {
  .ecommerce {
    padding: var(--space-4);
  }
  .shop {
    grid-template-columns: minmax(0, 1fr);
  }
  .filters {
    position: static;
  }
  .cart {
    grid-column: auto;
  }
  .filters-toggle {
    display: block;
  }
  .filters:not([data-open]) .filters-body {
    display: none;
  }
  .search {
    width: 100%;
  }
  .qv {
    grid-template-columns: minmax(0, 1fr);
  }
  .qv-art {
    aspect-ratio: 16 / 9;
  }
}
@media (prefers-reduced-motion: reduce) {
  .product {
    transition: none;
  }
}
</style>
