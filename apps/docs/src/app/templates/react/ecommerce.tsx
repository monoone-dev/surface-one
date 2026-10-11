"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@surface-one/react";

import {
  type CategoryId,
  type Sort,
  type Tone,
  type Category,
  type Colour,
  type CartLine,
  type QuickView,
  CATEGORIES,
  PRICE_MIN,
  PRICE_MAX,
  FREE_SHIPPING,
  SHIPPING,
  TAX_RATE,
  PROMO,
  LOW_STOCK,
  USD,
  round2,
  colourOf,
  lineKey,
  INITIAL_CART,
} from "../data/ecommerce";

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
const money = (n: number): string => USD.format(n);

const productOf = (id: string): Product =>
  PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
const off = (price: number, was: number): number =>
  Math.round((1 - price / was) * 100);
const maxQty = (p: Product): number => Math.max(1, Math.min(p.stock, 10));
const itemsLabelOf = (lines: readonly CartLine[]): string => {
  const n = lines.reduce((sum, l) => sum + l.qty, 0);
  return n === 1 ? "1 item" : `${n} items`;
};

const COUNTS = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.id,
    PRODUCTS.filter((p) => p.category === c.id).length,
  ]),
) as Record<CategoryId, number>;
const FREE_SHIPPING_LABEL = money(FREE_SHIPPING).replace(".00", "");

const RATING_OPTIONS: readonly SegmentOption[] = [
  { value: "0", label: "Any" },
  { value: "4", label: "4+" },
  { value: "4.5", label: "4.5+" },
];
const SORTS: readonly { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];
const DENSITIES: readonly SegmentOption[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];
const SORT_BY: Record<Sort, (a: Product, b: Product) => number> = {
  featured: () => 0,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  newest: (a, b) => b.added - a.added,
};

/** The sale price, struck-through original price and an optional discount badge. */
function PriceRow({
  product,
  className,
  badge = false,
}: {
  product: Product;
  className?: string;
  badge?: boolean;
}) {
  return (
    <p className={className ? `price-row ${className}` : "price-row"}>
      {product.compareAt ? (
        <>
          <span className="sr-only">Sale price</span>
          <span className="price sale">{money(product.price)}</span>
          <span className="sr-only">, was</span>
          <s className="was">{money(product.compareAt)}</s>
          {badge ? (
            <SoneBadge variant="destructive">
              −{off(product.price, product.compareAt)}%
            </SoneBadge>
          ) : null}
        </>
      ) : (
        <span className="price">{money(product.price)}</span>
      )}
    </p>
  );
}

export default function EcommerceTemplate() {
  // Filters, sort and view.
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [minRating, setMinRating] = useState("0");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<string>("featured");
  const [density, setDensity] = useState<string>("comfortable");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Wishlist, cart and promo code.
  const [wishlist, setWishlist] = useState<readonly string[]>(["halo"]);
  const [lines, setLines] = useState<readonly CartLine[]>(INITIAL_CART);
  const [announcement, setAnnouncement] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promo, setPromo] = useState(false);

  // Quick view.
  const [quick, setQuick] = useState<QuickView | null>(null);

  // The removed line held focus: once the cart is empty, focus moves to its title.
  const focusCartNext = useRef(false);

  const filtered =
    category !== "all" ||
    maxPrice < PRICE_MAX ||
    minRating !== "0" ||
    inStock ||
    query.trim() !== "";

  const categoryLabel =
    category === "all"
      ? "All products"
      : (CATEGORIES.find((c) => c.id === category)?.label ?? "All products");

  const visible = useMemo<readonly Product[]>(() => {
    const q = query.trim().toLowerCase();
    const min = Number(minRating);
    const rows = PRODUCTS.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        p.price <= maxPrice &&
        p.rating >= min &&
        (!inStock || p.stock > 0) &&
        (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)),
    );
    return [...rows].sort(SORT_BY[sort as Sort] ?? SORT_BY.featured);
  }, [query, category, maxPrice, minRating, inStock, sort]);

  const cartRows = lines.map((l) => {
    const product = productOf(l.productId);
    return {
      ...l,
      product,
      variant: [colourOf(l.colour).label, l.size].filter(Boolean).join(" · "),
      max: maxQty(product),
      total: product.price * l.qty,
    };
  });
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const itemsLabel = itemsLabelOf(lines);
  const subtotal = round2(cartRows.reduce((s, l) => s + l.total, 0));
  const discount = promo ? round2(subtotal * PROMO.rate) : 0;
  const shippingLeft = Math.max(0, round2(FREE_SHIPPING - subtotal));
  const shipping = shippingLeft > 0 ? SHIPPING : 0;
  const tax = round2((subtotal - discount) * TAX_RATE);
  const total = round2(subtotal - discount + shipping + tax);

  const quickView = quick
    ? { ...quick, product: productOf(quick.productId) }
    : null;

  const isSaved = (id: string): boolean => wishlist.includes(id);

  function toggleWish(id: string): void {
    setWishlist((all) =>
      all.includes(id) ? all.filter((x) => x !== id) : [...all, id],
    );
  }

  function clearFilters(): void {
    setQuery("");
    setCategory("all");
    setMaxPrice(PRICE_MAX);
    setMinRating("0");
    setInStock(false);
  }

  function focusCart(): void {
    // Runs on click or after a commit only: never on the server.
    document.getElementById("shop-cart-title")?.focus();
  }

  useEffect(() => {
    if (!focusCartNext.current) return;
    focusCartNext.current = false;
    focusCart();
  }, [lines]);

  function add(p: Product, c: string, size: string | null, qty: number): void {
    const key = lineKey(p.id, c, size);
    const max = maxQty(p);
    const next = lines.some((l) => l.key === key)
      ? lines.map((l) =>
          l.key === key ? { ...l, qty: Math.min(l.qty + qty, max) } : l,
        )
      : [...lines, { key, productId: p.id, colour: c, size, qty }];
    setLines(next);
    setAnnouncement(
      `Added ${p.name} to your cart. ${itemsLabelOf(next)} in cart.`,
    );
  }

  /** "Add to cart" on a card: the first colour and size. */
  function quickAdd(p: Product): void {
    add(p, p.colours[0], p.sizes?.[0] ?? null, 1);
  }

  function openQuickView(p: Product): void {
    setQuick({
      productId: p.id,
      colour: p.colours[0],
      size: p.sizes?.[0] ?? null,
      qty: 1,
    });
  }

  function patchQuick(patch: Partial<Omit<QuickView, "productId">>): void {
    setQuick((q) => (q ? { ...q, ...patch } : q));
  }

  function addFromQuickView(): void {
    if (!quick) return;
    add(productOf(quick.productId), quick.colour, quick.size, quick.qty);
    setQuick(null);
  }

  function setQty(key: string, qty: number | null): void {
    if (qty === null) return;
    setLines((all) => all.map((l) => (l.key === key ? { ...l, qty } : l)));
  }

  function remove(key: string): void {
    const line = lines.find((l) => l.key === key);
    const next = lines.filter((l) => l.key !== key);
    setLines(next);
    if (line) {
      setAnnouncement(
        `Removed ${productOf(line.productId).name}. ${itemsLabelOf(next)} in cart.`,
      );
    }
    if (next.length === 0) focusCartNext.current = true;
  }

  function applyPromo(): void {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a promo code.");
    } else if (code !== PROMO.code) {
      setPromoError(`“${code}” is not a valid promo code.`);
    } else {
      setPromo(true);
      setPromoError(null);
      setPromoInput("");
      setAnnouncement(`Promo code ${PROMO.code} applied: 10% off.`);
    }
  }

  function removePromo(): void {
    setPromo(false);
    setAnnouncement("Promo code removed.");
  }

  return (
    <div className="ecommerce tpl-ecommerce">
      <style>{css}</style>
      <SonePageHeader as="div">
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Northwind Goods · Store</SonePageHeaderEyebrow>
          <SonePageHeaderTitle as="h2">Shop</SonePageHeaderTitle>
          <SonePageHeaderDescription>
            Everyday tech and carry, picked by our team. Free shipping on orders
            over {FREE_SHIPPING_LABEL}.
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          <SoneInputGroup className="search">
            <SoneInputGroupAddon>
              <SoneIcon icon="search" />
            </SoneInputGroupAddon>
            <SoneInputGroupInput
              value={query}
              onValueChange={setQuery}
              type="search"
              autoComplete="off"
              placeholder="Search products"
              aria-label="Search products"
            />
          </SoneInputGroup>
          <SoneButton
            variant="outline"
            size="sm"
            type="button"
            aria-label={`Cart, ${itemsLabel}`}
            onClick={focusCart}
          >
            <SoneIcon icon="shopping-cart" />
            <span>Cart</span>
            <SoneBadge className="count">{itemCount}</SoneBadge>
          </SoneButton>
        </SonePageHeaderActions>
      </SonePageHeader>

      <div className="shop">
        <SoneCard
          as="aside"
          className="filters"
          aria-labelledby="shop-filters-title"
          data-open={filtersOpen ? "" : undefined}
        >
          <SoneCardHeader>
            <SoneCardTitle id="shop-filters-title">Filters</SoneCardTitle>
            <SoneCardAction className="filters-toggle">
              <SoneButton
                variant="outline"
                size="sm"
                type="button"
                aria-controls="shop-filters-body"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <SoneIcon icon="sliders" />
                <span>{filtersOpen ? "Hide" : "Show"}</span>
              </SoneButton>
            </SoneCardAction>
          </SoneCardHeader>
          <SoneCardContent id="shop-filters-body" className="filters-body">
            <fieldset className="group">
              <legend className="group-label">Category</legend>
              <label className="option">
                <input
                  type="radio"
                  name="shop-category"
                  value="all"
                  checked={category === "all"}
                  onChange={() => setCategory("all")}
                />
                <span className="option-label">All products</span>
                <span className="option-count">{PRODUCTS.length}</span>
              </label>
              {CATEGORIES.map((c) => (
                <label key={c.id} className="option">
                  <input
                    type="radio"
                    name="shop-category"
                    value={c.id}
                    checked={category === c.id}
                    onChange={() => setCategory(c.id)}
                  />
                  <span className="option-label">{c.label}</span>
                  <span className="option-count">{COUNTS[c.id]}</span>
                </label>
              ))}
            </fieldset>

            <div className="group">
              <div className="group-row">
                <span id="shop-price-label" className="group-label">
                  Price
                </span>
                <span className="group-value">Up to {money(maxPrice)}</span>
              </div>
              <SoneSlider
                value={maxPrice}
                onValueChange={setMaxPrice}
                ariaLabel="Maximum price"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={10}
              />
              <div className="range-ends" aria-hidden="true">
                <span>{money(PRICE_MIN)}</span>
                <span>{money(PRICE_MAX)}</span>
              </div>
            </div>

            <div className="group">
              <span id="shop-rating-label" className="group-label">
                Rating
              </span>
              <SoneSegmented
                value={minRating}
                onValueChange={setMinRating}
                size="sm"
                ariaLabel="Minimum rating"
                options={RATING_OPTIONS}
              />
            </div>

            <SoneField orientation="horizontal" className="stock-field">
              <SoneFieldLabel htmlFor="shop-in-stock">
                In stock only
              </SoneFieldLabel>
              <SoneSwitch
                checked={inStock}
                onCheckedChange={setInStock}
                size="sm"
                inputId="shop-in-stock"
              />
            </SoneField>

            <SoneButton
              variant="ghost"
              size="sm"
              type="button"
              className="clear"
              disabled={!filtered}
              onClick={clearFilters}
            >
              <SoneIcon icon="refresh" />
              <span>Clear filters</span>
            </SoneButton>
          </SoneCardContent>
        </SoneCard>

        <section className="catalog" aria-labelledby="shop-products-title">
          <div className="toolbar">
            <div className="toolbar-title">
              <h3 id="shop-products-title">{categoryLabel}</h3>
              <p className="result-count" aria-live="polite">
                {visible.length} of {PRODUCTS.length} products
              </p>
            </div>
            <div className="toolbar-actions">
              <label className="sort-label" htmlFor="shop-sort">
                Sort by
              </label>
              <SoneSelect
                value={sort}
                onValueChange={setSort}
                selectId="shop-sort"
                size="sm"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </SoneSelect>
              <SoneSegmented
                value={density}
                onValueChange={setDensity}
                size="sm"
                ariaLabel="Grid density"
                options={DENSITIES}
              />
            </div>
          </div>

          {visible.length ? (
            <ul className="products" data-density={density}>
              {visible.map((p) => (
                <li key={p.id}>
                  <article
                    className="product"
                    aria-labelledby={`shop-p-${p.id}`}
                  >
                    <div className="art" data-tone={p.tone}>
                      <SoneIcon icon={p.icon} />
                    </div>
                    <div className="flags">
                      {p.compareAt ? (
                        <SoneBadge variant="destructive">
                          −{off(p.price, p.compareAt)}%
                        </SoneBadge>
                      ) : null}
                      {p.isNew ? <SoneBadge>New</SoneBadge> : null}
                      {p.stock === 0 ? (
                        <SoneBadge variant="secondary">Sold out</SoneBadge>
                      ) : p.stock <= LOW_STOCK ? (
                        <SoneBadge variant="warning">Low stock</SoneBadge>
                      ) : null}
                    </div>
                    <SoneButton
                      variant="secondary"
                      size="icon-sm"
                      type="button"
                      className="wish"
                      aria-pressed={isSaved(p.id)}
                      aria-label={`Save ${p.name} to wishlist`}
                      title={isSaved(p.id) ? "Saved" : "Save to wishlist"}
                      onClick={() => toggleWish(p.id)}
                    >
                      <SoneIcon icon="heart" />
                    </SoneButton>
                    <div className="product-body">
                      <p className="brand">{p.brand}</p>
                      <h4 id={`shop-p-${p.id}`} className="name">
                        {p.name}
                      </h4>
                      <div className="rating-row">
                        <SoneRating size="sm" readonly value={p.rating} />
                        <span className="reviews">
                          {p.rating}{" "}
                          <span aria-hidden="true">({p.reviews})</span>{" "}
                          <span className="sr-only">
                            from {p.reviews} reviews
                          </span>
                        </span>
                      </div>
                      <PriceRow product={p} />
                      <ul className="swatches" aria-label="Colours">
                        {p.colours.map((c) => (
                          <li
                            key={c}
                            className="swatch"
                            data-tone={colourOf(c).tone}
                            title={colourOf(c).label}
                          >
                            <span className="sr-only">{colourOf(c).label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="product-actions">
                      <SoneButton
                        size="sm"
                        type="button"
                        className="add"
                        disabled={p.stock === 0}
                        aria-describedby={`shop-p-${p.id}`}
                        onClick={() => quickAdd(p)}
                      >
                        {p.stock === 0 ? (
                          <span>Sold out</span>
                        ) : (
                          <>
                            <SoneIcon icon="shopping-cart" />
                            <span>Add to cart</span>
                          </>
                        )}
                      </SoneButton>
                      <SoneButton
                        variant="outline"
                        size="icon-sm"
                        type="button"
                        aria-label={`Quick view ${p.name}`}
                        title="Quick view"
                        onClick={() => openQuickView(p)}
                      >
                        <SoneIcon icon="eye" />
                      </SoneButton>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <SoneEmpty
              className="no-results"
              icon="search"
              title="No products match"
              description="Try a different search, widen the price range or clear the filters."
            >
              <SoneButton
                variant="outline"
                size="sm"
                type="button"
                onClick={clearFilters}
              >
                <SoneIcon icon="refresh" />
                <span>Clear filters</span>
              </SoneButton>
            </SoneEmpty>
          )}
        </section>

        <SoneCard
          as="section"
          className="cart"
          aria-labelledby="shop-cart-title"
        >
          <SoneCardHeader>
            <SoneCardTitle
              id="shop-cart-title"
              className="cart-title"
              tabIndex={-1}
            >
              Your cart
            </SoneCardTitle>
            <SoneCardDescription>{itemsLabel}</SoneCardDescription>
          </SoneCardHeader>
          <SoneCardContent className="cart-body">
            {lines.length ? (
              <>
                <div className="shipping">
                  <p className="shipping-text">
                    {shippingLeft > 0 ? (
                      <>
                        <SoneIcon icon="truck" />
                        <span>
                          Add <strong>{money(shippingLeft)}</strong> more for
                          free shipping
                        </span>
                      </>
                    ) : (
                      <>
                        <SoneIcon icon="circle-check" />
                        <span>
                          You've unlocked <strong>free shipping</strong>
                        </span>
                      </>
                    )}
                  </p>
                  <SoneProgress
                    aria-label="Progress toward free shipping"
                    value={subtotal}
                    max={FREE_SHIPPING}
                  />
                </div>

                <ul className="lines">
                  {cartRows.map((line) => (
                    <li key={line.key} className="line">
                      <div className="thumb" data-tone={line.product.tone}>
                        <SoneIcon icon={line.product.icon} />
                      </div>
                      <div className="line-main">
                        <p className="line-name">{line.product.name}</p>
                        <p className="line-variant">{line.variant}</p>
                        <SoneInputNumber
                          size="sm"
                          min={1}
                          max={line.max}
                          value={line.qty}
                          ariaLabel={`Quantity of ${line.product.name}`}
                          onValueChange={(qty) => setQty(line.key, qty)}
                        />
                      </div>
                      <div className="line-side">
                        <span className="line-total">{money(line.total)}</span>
                        <SoneButton
                          variant="ghost"
                          size="icon-xs"
                          type="button"
                          aria-label={`Remove ${line.product.name}`}
                          title="Remove"
                          onClick={() => remove(line.key)}
                        >
                          <SoneIcon icon="trash" />
                        </SoneButton>
                      </div>
                    </li>
                  ))}
                </ul>

                {promo ? (
                  <div className="promo-applied">
                    <SoneBadge variant="success">
                      <SoneIcon icon="tag" />
                      {PROMO.code} · 10% off
                    </SoneBadge>
                    <SoneButton
                      variant="link"
                      size="xs"
                      type="button"
                      onClick={removePromo}
                    >
                      Remove code
                    </SoneButton>
                  </div>
                ) : (
                  <SoneField invalid={!!promoError}>
                    <SoneFieldLabel htmlFor="shop-promo">
                      Promo code
                    </SoneFieldLabel>
                    <div className="promo-row">
                      <input
                        id="shop-promo"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        type="text"
                        autoComplete="off"
                        placeholder="Enter code"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") applyPromo();
                        }}
                      />
                      <SoneButton
                        variant="outline"
                        type="button"
                        onClick={applyPromo}
                      >
                        Apply
                      </SoneButton>
                    </div>
                    {promoError ? (
                      <SoneFieldError>{promoError}</SoneFieldError>
                    ) : (
                      <SoneFieldDescription>
                        Try {PROMO.code} for 10% off.
                      </SoneFieldDescription>
                    )}
                  </SoneField>
                )}

                <dl className="summary">
                  <div className="summary-row">
                    <dt>Subtotal</dt>
                    <dd>{money(subtotal)}</dd>
                  </div>
                  {discount > 0 ? (
                    <div className="summary-row discount">
                      <dt>Discount</dt>
                      <dd>−{money(discount)}</dd>
                    </div>
                  ) : null}
                  <div className="summary-row">
                    <dt>Shipping</dt>
                    <dd>{shipping === 0 ? "Free" : money(shipping)}</dd>
                  </div>
                  <div className="summary-row">
                    <dt>Estimated tax</dt>
                    <dd>{money(tax)}</dd>
                  </div>
                  <div className="summary-row total">
                    <dt>Total</dt>
                    <dd>{money(total)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <SoneEmpty
                icon="shopping-bag"
                title="Your cart is empty"
                description="Add something you like and it shows up here."
              />
            )}
          </SoneCardContent>
          {lines.length ? (
            <SoneCardFooter className="cart-footer">
              <SoneButton type="button" className="checkout">
                <SoneIcon icon="credit-card" />
                <span>Checkout</span>
                <SoneIcon icon="arrow-right" />
              </SoneButton>
              <p className="secure">
                <SoneIcon icon="lock" /> Secure checkout · 30-day returns
              </p>
            </SoneCardFooter>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </SoneCard>
      </div>

      {quickView ? (
        // Portaled to <body>: the scope class on the dialog host keeps the styles below.
        <SoneDialog
          size="lg"
          className="tpl-ecommerce"
          onDismiss={() => setQuick(null)}
        >
          <div className="qv">
            <div className="qv-art art" data-tone={quickView.product.tone}>
              <SoneIcon icon={quickView.product.icon} />
            </div>
            <div className="qv-info">
              <SoneDialogHeader as="header">
                <p className="brand">{quickView.product.brand}</p>
                <SoneDialogTitle>{quickView.product.name}</SoneDialogTitle>
                <SoneDialogDescription>
                  {quickView.product.description}
                </SoneDialogDescription>
              </SoneDialogHeader>
              <div className="rating-row">
                <SoneRating
                  size="sm"
                  readonly
                  value={quickView.product.rating}
                />
                <span className="reviews">
                  {quickView.product.rating} · {quickView.product.reviews}{" "}
                  reviews
                </span>
              </div>
              <PriceRow
                product={quickView.product}
                className="qv-price"
                badge
              />

              <div className="qv-choice">
                <span id="shop-qv-colour" className="group-label">
                  Colour · {colourOf(quickView.colour).label}
                </span>
                <SoneToggleGroup
                  variant="outline"
                  size="sm"
                  spacing={1}
                  role="group"
                  aria-labelledby="shop-qv-colour"
                >
                  {quickView.product.colours.map((c) => (
                    <SoneToggleGroupItem
                      key={c}
                      type="button"
                      pressed={quickView.colour === c}
                      onClick={() => patchQuick({ colour: c })}
                    >
                      <span className="dot" data-tone={colourOf(c).tone} />
                      {colourOf(c).label}
                    </SoneToggleGroupItem>
                  ))}
                </SoneToggleGroup>
              </div>

              {quickView.product.sizes ? (
                <div className="qv-choice">
                  <span id="shop-qv-size" className="group-label">
                    Size
                  </span>
                  <SoneToggleGroup
                    variant="outline"
                    size="sm"
                    spacing={1}
                    role="group"
                    aria-labelledby="shop-qv-size"
                  >
                    {quickView.product.sizes.map((s) => (
                      <SoneToggleGroupItem
                        key={s}
                        type="button"
                        pressed={quickView.size === s}
                        onClick={() => patchQuick({ size: s })}
                      >
                        {s}
                      </SoneToggleGroupItem>
                    ))}
                  </SoneToggleGroup>
                </div>
              ) : null}

              <SoneField className="qv-qty">
                <SoneFieldLabel htmlFor="shop-qv-qty">Quantity</SoneFieldLabel>
                <SoneInputNumber
                  inputId="shop-qv-qty"
                  min={1}
                  max={maxQty(quickView.product)}
                  value={quickView.qty}
                  onValueChange={(qty) => patchQuick({ qty: qty ?? 1 })}
                />
                <SoneFieldDescription>
                  {quickView.product.stock <= LOW_STOCK
                    ? `Only ${quickView.product.stock} left in stock.`
                    : "In stock, ships in 1–2 business days."}
                </SoneFieldDescription>
              </SoneField>
            </div>
          </div>
          <SoneDialogFooter as="footer">
            <SoneButton
              variant="outline"
              type="button"
              aria-pressed={isSaved(quickView.product.id)}
              onClick={() => toggleWish(quickView.product.id)}
            >
              <SoneIcon icon="heart" />
              <span>{isSaved(quickView.product.id) ? "Saved" : "Save"}</span>
            </SoneButton>
            <SoneButton type="button" onClick={addFromQuickView}>
              <SoneIcon icon="shopping-cart" />
              <span>
                Add to cart · {money(quickView.product.price * quickView.qty)}
              </span>
            </SoneButton>
          </SoneDialogFooter>
        </SoneDialog>
      ) : null}
    </div>
  );
}

const css = `
.tpl-ecommerce.ecommerce {
  display: block;
  padding: var(--space-6);
}
.tpl-ecommerce .search {
  width: 16rem;
  max-width: 100%;
}
.tpl-ecommerce .count {
  min-width: 1.25rem;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .shop {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr) 21rem;
  align-items: start;
  gap: var(--space-5);
  margin-top: var(--space-5);
}
.tpl-ecommerce .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Filters */
.tpl-ecommerce .filters {
  position: sticky;
  top: var(--space-4);
}
.tpl-ecommerce .filters-toggle {
  display: none;
}
.tpl-ecommerce .filters-body {
  display: grid;
  gap: var(--space-5);
}
.tpl-ecommerce .group {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.tpl-ecommerce .group-label {
  padding: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.tpl-ecommerce .group-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-ecommerce .group-value,
.tpl-ecommerce .range-ends {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .range-ends {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
}
.tpl-ecommerce .option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}
.tpl-ecommerce .option:has(input:checked) {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}
.tpl-ecommerce .option-label {
  flex: 1;
}
.tpl-ecommerce .option-count {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .stock-field {
  justify-content: space-between;
}
.tpl-ecommerce .clear {
  justify-self: start;
}

/* Toolbar */
.tpl-ecommerce .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.tpl-ecommerce .toolbar-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}
.tpl-ecommerce .result-count {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.tpl-ecommerce .toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.tpl-ecommerce .sort-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* Product grid */
.tpl-ecommerce .products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tpl-ecommerce .products[data-density="compact"] {
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  gap: var(--space-3);
}
.tpl-ecommerce .product {
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
.tpl-ecommerce .product:hover {
  border-color: var(--border-strong);
}
.tpl-ecommerce .art {
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
.tpl-ecommerce .art sone-icon {
  opacity: 0.85;
}
.tpl-ecommerce [data-tone="1"] {
  --_tone: var(--chart-1);
}
.tpl-ecommerce [data-tone="2"] {
  --_tone: var(--chart-2);
}
.tpl-ecommerce [data-tone="3"] {
  --_tone: var(--chart-3);
}
.tpl-ecommerce [data-tone="4"] {
  --_tone: var(--chart-4);
}
.tpl-ecommerce [data-tone="5"] {
  --_tone: var(--chart-5);
}
.tpl-ecommerce [data-tone="6"] {
  --_tone: var(--chart-6);
}
.tpl-ecommerce [data-tone="7"] {
  --_tone: var(--chart-7);
}
.tpl-ecommerce [data-tone="8"] {
  --_tone: var(--chart-8);
}
.tpl-ecommerce .products[data-density="compact"] .art {
  aspect-ratio: 1;
  --icon-size: var(--icon-size-lg);
}
.tpl-ecommerce .flags {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  max-width: calc(100% - 3.5rem);
}
.tpl-ecommerce .wish {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}
.tpl-ecommerce .wish[aria-pressed="true"] {
  color: var(--danger-text);
}
.tpl-ecommerce .product-body {
  display: grid;
  flex: 1;
  align-content: start;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4) var(--space-2);
}
.tpl-ecommerce .brand {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-ecommerce .name {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
}
.tpl-ecommerce .rating-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.tpl-ecommerce .reviews {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  margin: var(--space-1) 0 0;
}
.tpl-ecommerce .price {
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .price.sale {
  color: var(--danger-text);
}
.tpl-ecommerce .was {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .swatches {
  display: flex;
  gap: var(--space-1);
  margin: var(--space-1) 0 0;
  padding: 0;
  list-style: none;
}
.tpl-ecommerce .swatch,
.tpl-ecommerce .dot {
  width: 0.875rem;
  height: 0.875rem;
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--_tone);
}
.tpl-ecommerce .product-actions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4) var(--space-4);
}
.tpl-ecommerce .add {
  flex: 1;
}
.tpl-ecommerce .products[data-density="compact"] .swatches,
.tpl-ecommerce .products[data-density="compact"] .brand {
  display: none;
}
.tpl-ecommerce .products[data-density="compact"] .product-body,
.tpl-ecommerce .products[data-density="compact"] .product-actions {
  padding-inline: var(--space-3);
}
.tpl-ecommerce .no-results {
  border: var(--border-width-thin) dashed var(--border);
  border-radius: var(--card-radius);
}

/* Cart */
.tpl-ecommerce .cart {
  position: sticky;
  top: var(--space-4);
}
.tpl-ecommerce .cart-title:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-control);
}
.tpl-ecommerce .cart-body {
  display: grid;
  gap: var(--space-4);
}
.tpl-ecommerce .shipping {
  display: grid;
  gap: var(--space-2);
}
.tpl-ecommerce .shipping-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-ecommerce .shipping-text strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}
.tpl-ecommerce .lines {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tpl-ecommerce .line {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-ecommerce .thumb {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius);
  background: color-mix(in oklch, var(--_tone) 16%, var(--surface-base));
  color: var(--_tone);
}
.tpl-ecommerce .line-main {
  display: grid;
  justify-items: start;
  gap: var(--space-1);
  min-width: 0;
}
.tpl-ecommerce .line-name {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-ecommerce .line-variant {
  margin: 0 0 var(--space-1);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-ecommerce .line-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}
.tpl-ecommerce .line-total {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .promo-row {
  display: flex;
  gap: var(--space-2);
}
.tpl-ecommerce .promo-row input {
  flex: 1;
  min-width: 0;
  text-transform: uppercase;
}
.tpl-ecommerce .promo-row input::placeholder {
  text-transform: none;
}
.tpl-ecommerce .promo-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-ecommerce .summary {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--font-size-sm);
}
.tpl-ecommerce .summary-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}
.tpl-ecommerce .summary-row dt {
  color: var(--text-secondary);
}
.tpl-ecommerce .summary-row dd {
  margin: 0;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce .summary-row.discount dd {
  color: var(--success-text);
}
.tpl-ecommerce .summary-row.total {
  padding-top: var(--space-2);
  border-top: var(--border-width-thin) solid var(--border);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-ecommerce .summary-row.total dt {
  color: var(--text-primary);
}
.tpl-ecommerce .cart-footer {
  display: grid;
  gap: var(--space-2);
}
.tpl-ecommerce .checkout {
  width: 100%;
}
.tpl-ecommerce .secure {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

/* Quick view */
.tpl-ecommerce .qv {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: var(--space-5);
}
.tpl-ecommerce .qv-art {
  align-self: start;
  aspect-ratio: 1;
  border-radius: var(--radius);
  --icon-size: calc(var(--icon-size-xl) * 1.5);
}
.tpl-ecommerce .qv-info {
  display: grid;
  align-content: start;
  gap: var(--space-4);
}
.tpl-ecommerce .qv-price {
  margin: 0;
}
.tpl-ecommerce .qv-choice {
  display: grid;
  gap: var(--space-2);
}
.tpl-ecommerce .qv-choice .toggle-group {
  flex-wrap: wrap;
}
.tpl-ecommerce .qv-qty sone-input-number {
  justify-self: start;
}
.tpl-ecommerce .dot {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
}

@media (max-width: 1200px) {
  .tpl-ecommerce .shop {
    grid-template-columns: 14rem minmax(0, 1fr);
  }
  .tpl-ecommerce .cart {
    position: static;
    grid-column: 2;
  }
}
@media (max-width: 760px) {
  .tpl-ecommerce.ecommerce {
    padding: var(--space-4);
  }
  .tpl-ecommerce .shop {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-ecommerce .filters {
    position: static;
  }
  .tpl-ecommerce .cart {
    grid-column: auto;
  }
  .tpl-ecommerce .filters-toggle {
    display: block;
  }
  .tpl-ecommerce .filters:not([data-open]) .filters-body {
    display: none;
  }
  .tpl-ecommerce .search {
    width: 100%;
  }
  .tpl-ecommerce .qv {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-ecommerce .qv-art {
    aspect-ratio: 16 / 9;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-ecommerce .product {
    transition: none;
  }
}
`;
