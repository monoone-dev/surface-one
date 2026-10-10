import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  computed,
  signal,
  viewChild,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import {
  SONE_DIALOG_PARTS,
  SoneDialogComponent,
} from "@surface-one/angular/dialog";
import { SoneEmptyStateComponent } from "@surface-one/angular/empty-state";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import {
  SONE_FIELD_PARTS,
  SONE_INPUT_GROUP_PARTS,
} from "@surface-one/angular/input";
import { SoneInputNumberComponent } from "@surface-one/angular/input-number";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import { SoneProgressComponent } from "@surface-one/angular/progress";
import { SoneRatingComponent } from "@surface-one/angular/rating";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SoneSliderComponent } from "@surface-one/angular/slider";
import { SoneSwitchComponent } from "@surface-one/angular/switch";
import { SONE_TOGGLE_PARTS } from "@surface-one/angular/toggle-group";

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

@Component({
  selector: "docs-ecommerce-template",
  imports: [
    ...SONE_PAGE_HEADER_PARTS,
    ...SONE_CARD_PARTS,
    ...SONE_DIALOG_PARTS,
    ...SONE_FIELD_PARTS,
    ...SONE_INPUT_GROUP_PARTS,
    ...SONE_TOGGLE_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneDialogComponent,
    SoneEmptyStateComponent,
    SoneIconComponent,
    SoneInputNumberComponent,
    SoneProgressComponent,
    SoneRatingComponent,
    SoneSegmentedComponent,
    SoneSelectComponent,
    SoneSliderComponent,
    SoneSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div sonePageHeader>
      <div sonePageHeaderContent>
        <p sonePageHeaderEyebrow>Northwind Goods · Store</p>
        <h2 sonePageHeaderTitle>Shop</h2>
        <p sonePageHeaderDescription>
          Everyday tech and carry, picked by our team. Free shipping on orders
          over {{ freeShipping }}.
        </p>
      </div>
      <div sonePageHeaderActions>
        <div soneInputGroup class="search">
          <span soneInputGroupAddon><sone-icon icon="search" /></span>
          <input
            soneInputGroupInput
            type="search"
            autocomplete="off"
            placeholder="Search products"
            aria-label="Search products"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
        </div>
        <button
          soneBtn
          variant="outline"
          size="sm"
          type="button"
          [attr.aria-label]="'Cart, ' + itemsLabel()"
          (click)="focusCart()"
        >
          <sone-icon icon="shopping-cart" /><span>Cart</span>
          <span soneBadge class="count">{{ itemCount() }}</span>
        </button>
      </div>
    </div>

    <div class="shop">
      <aside
        soneCard
        class="filters"
        aria-labelledby="shop-filters-title"
        [attr.data-open]="filtersOpen() ? '' : null"
      >
        <div soneCardHeader>
          <h3 soneCardTitle id="shop-filters-title">Filters</h3>
          <div soneCardAction class="filters-toggle">
            <button
              soneBtn
              variant="outline"
              size="sm"
              type="button"
              aria-controls="shop-filters-body"
              [attr.aria-expanded]="filtersOpen()"
              (click)="filtersOpen.set(!filtersOpen())"
            >
              <sone-icon icon="sliders" /><span>{{
                filtersOpen() ? "Hide" : "Show"
              }}</span>
            </button>
          </div>
        </div>
        <div soneCardContent class="filters-body" id="shop-filters-body">
          <fieldset class="group">
            <legend class="group-label">Category</legend>
            <label class="option">
              <input
                type="radio"
                name="shop-category"
                value="all"
                [checked]="category() === 'all'"
                (change)="category.set('all')"
              />
              <span class="option-label">All products</span>
              <span class="option-count">{{ products.length }}</span>
            </label>
            @for (c of categories; track c.id) {
              <label class="option">
                <input
                  type="radio"
                  name="shop-category"
                  [value]="c.id"
                  [checked]="category() === c.id"
                  (change)="category.set(c.id)"
                />
                <span class="option-label">{{ c.label }}</span>
                <span class="option-count">{{ counts[c.id] }}</span>
              </label>
            }
          </fieldset>

          <div class="group">
            <div class="group-row">
              <span class="group-label" id="shop-price-label">Price</span>
              <span class="group-value">Up to {{ money(maxPrice()) }}</span>
            </div>
            <sone-slider
              ariaLabel="Maximum price"
              [min]="priceMin"
              [max]="priceMax"
              [step]="10"
              [(value)]="maxPrice"
            />
            <div class="range-ends" aria-hidden="true">
              <span>{{ money(priceMin) }}</span
              ><span>{{ money(priceMax) }}</span>
            </div>
          </div>

          <div class="group">
            <span class="group-label" id="shop-rating-label">Rating</span>
            <sone-segmented
              size="sm"
              ariaLabel="Minimum rating"
              [options]="ratingOptions"
              [(value)]="minRating"
            />
          </div>

          <div soneField orientation="horizontal" class="stock-field">
            <label soneFieldLabel for="shop-in-stock">In stock only</label>
            <sone-switch
              size="sm"
              inputId="shop-in-stock"
              [checked]="inStock()"
              (checkedChange)="inStock.set($event)"
            />
          </div>

          <button
            soneBtn
            variant="ghost"
            size="sm"
            type="button"
            class="clear"
            [disabled]="!filtered()"
            (click)="clearFilters()"
          >
            <sone-icon icon="refresh" /><span>Clear filters</span>
          </button>
        </div>
      </aside>

      <section class="catalog" aria-labelledby="shop-products-title">
        <div class="toolbar">
          <div class="toolbar-title">
            <h3 id="shop-products-title">{{ categoryLabel() }}</h3>
            <p class="result-count" aria-live="polite">
              {{ visible().length }} of {{ products.length }} products
            </p>
          </div>
          <div class="toolbar-actions">
            <label class="sort-label" for="shop-sort">Sort by</label>
            <sone-select selectId="shop-sort" size="sm" [(value)]="sort">
              @for (s of sorts; track s.value) {
                <option [value]="s.value">{{ s.label }}</option>
              }
            </sone-select>
            <sone-segmented
              size="sm"
              ariaLabel="Grid density"
              [options]="densities"
              [(value)]="density"
            />
          </div>
        </div>

        @if (visible().length) {
          <ul class="products" [attr.data-density]="density()">
            @for (p of visible(); track p.id) {
              <li>
                <article
                  class="product"
                  [attr.aria-labelledby]="'shop-p-' + p.id"
                >
                  <div class="art" [attr.data-tone]="p.tone">
                    <sone-icon [icon]="p.icon" />
                  </div>
                  <div class="flags">
                    @if (p.compareAt; as was) {
                      <span soneBadge variant="destructive"
                        >−{{ off(p.price, was) }}%</span
                      >
                    }
                    @if (p.isNew) {
                      <span soneBadge>New</span>
                    }
                    @if (p.stock === 0) {
                      <span soneBadge variant="secondary">Sold out</span>
                    } @else if (p.stock <= lowStock) {
                      <span soneBadge variant="warning">Low stock</span>
                    }
                  </div>
                  <button
                    soneBtn
                    variant="secondary"
                    size="icon-sm"
                    type="button"
                    class="wish"
                    [attr.aria-pressed]="isSaved(p.id)"
                    [attr.aria-label]="'Save ' + p.name + ' to wishlist'"
                    [attr.title]="isSaved(p.id) ? 'Saved' : 'Save to wishlist'"
                    (click)="toggleWish(p.id)"
                  >
                    <sone-icon icon="heart" />
                  </button>
                  <div class="product-body">
                    <p class="brand">{{ p.brand }}</p>
                    <h4 class="name" [id]="'shop-p-' + p.id">{{ p.name }}</h4>
                    <div class="rating-row">
                      <sone-rating size="sm" readonly [value]="p.rating" />
                      <span class="reviews">
                        {{ p.rating }}
                        <span aria-hidden="true">({{ p.reviews }})</span>
                        <span class="sr-only"
                          >from {{ p.reviews }} reviews</span
                        >
                      </span>
                    </div>
                    <p class="price-row">
                      @if (p.compareAt; as was) {
                        <span class="sr-only">Sale price</span>
                        <span class="price sale">{{ money(p.price) }}</span>
                        <span class="sr-only">, was</span>
                        <s class="was">{{ money(was) }}</s>
                      } @else {
                        <span class="price">{{ money(p.price) }}</span>
                      }
                    </p>
                    <ul class="swatches" aria-label="Colours">
                      @for (c of p.colours; track c) {
                        <li
                          class="swatch"
                          [attr.data-tone]="colour(c).tone"
                          [attr.title]="colour(c).label"
                        >
                          <span class="sr-only">{{ colour(c).label }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                  <div class="product-actions">
                    <button
                      soneBtn
                      size="sm"
                      type="button"
                      class="add"
                      [disabled]="p.stock === 0"
                      [attr.aria-describedby]="'shop-p-' + p.id"
                      (click)="quickAdd(p)"
                    >
                      @if (p.stock === 0) {
                        <span>Sold out</span>
                      } @else {
                        <sone-icon icon="shopping-cart" /><span
                          >Add to cart</span
                        >
                      }
                    </button>
                    <button
                      soneBtn
                      variant="outline"
                      size="icon-sm"
                      type="button"
                      [attr.aria-label]="'Quick view ' + p.name"
                      [attr.title]="'Quick view'"
                      (click)="openQuickView(p)"
                    >
                      <sone-icon icon="eye" />
                    </button>
                  </div>
                </article>
              </li>
            }
          </ul>
        } @else {
          <sone-empty-state
            class="no-results"
            icon="search"
            title="No products match"
            description="Try a different search, widen the price range or clear the filters."
          >
            <button
              soneBtn
              variant="outline"
              size="sm"
              type="button"
              (click)="clearFilters()"
            >
              <sone-icon icon="refresh" /><span>Clear filters</span>
            </button>
          </sone-empty-state>
        }
      </section>

      <section soneCard class="cart" aria-labelledby="shop-cart-title">
        <div soneCardHeader>
          <h3
            soneCardTitle
            id="shop-cart-title"
            class="cart-title"
            tabindex="-1"
            #cartTitle
          >
            Your cart
          </h3>
          <p soneCardDescription>{{ itemsLabel() }}</p>
        </div>
        <div soneCardContent class="cart-body">
          @if (lines().length) {
            <div class="shipping">
              <p class="shipping-text">
                @if (shippingLeft() > 0) {
                  <sone-icon icon="truck" />
                  <span
                    >Add <strong>{{ money(shippingLeft()) }}</strong> more for
                    free shipping</span
                  >
                } @else {
                  <sone-icon icon="circle-check" />
                  <span>You've unlocked <strong>free shipping</strong></span>
                }
              </p>
              <sone-progress
                ariaLabel="Progress toward free shipping"
                [value]="subtotal()"
                [max]="freeShippingAt"
              />
            </div>

            <ul class="lines">
              @for (line of cartRows(); track line.key) {
                <li class="line">
                  <div class="thumb" [attr.data-tone]="line.product.tone">
                    <sone-icon [icon]="line.product.icon" />
                  </div>
                  <div class="line-main">
                    <p class="line-name">{{ line.product.name }}</p>
                    <p class="line-variant">{{ line.variant }}</p>
                    <sone-input-number
                      size="sm"
                      [min]="1"
                      [max]="line.max"
                      [value]="line.qty"
                      [ariaLabel]="'Quantity of ' + line.product.name"
                      (valueChange)="setQty(line.key, $event)"
                    />
                  </div>
                  <div class="line-side">
                    <span class="line-total">{{ money(line.total) }}</span>
                    <button
                      soneBtn
                      variant="ghost"
                      size="icon-xs"
                      type="button"
                      [attr.aria-label]="'Remove ' + line.product.name"
                      [attr.title]="'Remove'"
                      (click)="remove(line.key)"
                    >
                      <sone-icon icon="trash" />
                    </button>
                  </div>
                </li>
              }
            </ul>

            @if (promo()) {
              <div class="promo-applied">
                <span soneBadge variant="success"
                  ><sone-icon icon="tag" />{{ promoCode }} · 10% off</span
                >
                <button
                  soneBtn
                  variant="link"
                  size="xs"
                  type="button"
                  (click)="removePromo()"
                >
                  Remove code
                </button>
              </div>
            } @else {
              <div soneField [invalid]="!!promoError()">
                <label soneFieldLabel for="shop-promo">Promo code</label>
                <div class="promo-row">
                  <input
                    id="shop-promo"
                    type="text"
                    autocomplete="off"
                    placeholder="Enter code"
                    [value]="promoInput()"
                    (input)="promoInput.set($any($event.target).value)"
                    (keydown.enter)="applyPromo()"
                  />
                  <button
                    soneBtn
                    variant="outline"
                    type="button"
                    (click)="applyPromo()"
                  >
                    Apply
                  </button>
                </div>
                @if (promoError(); as error) {
                  <p soneFieldError>{{ error }}</p>
                } @else {
                  <p soneFieldDescription>Try {{ promoCode }} for 10% off.</p>
                }
              </div>
            }

            <dl class="summary">
              <div class="summary-row">
                <dt>Subtotal</dt>
                <dd>{{ money(subtotal()) }}</dd>
              </div>
              @if (discount() > 0) {
                <div class="summary-row discount">
                  <dt>Discount</dt>
                  <dd>−{{ money(discount()) }}</dd>
                </div>
              }
              <div class="summary-row">
                <dt>Shipping</dt>
                <dd>{{ shipping() === 0 ? "Free" : money(shipping()) }}</dd>
              </div>
              <div class="summary-row">
                <dt>Estimated tax</dt>
                <dd>{{ money(tax()) }}</dd>
              </div>
              <div class="summary-row total">
                <dt>Total</dt>
                <dd>{{ money(total()) }}</dd>
              </div>
            </dl>
          } @else {
            <sone-empty-state
              icon="shopping-bag"
              title="Your cart is empty"
              description="Add something you like and it shows up here."
            />
          }
        </div>
        @if (lines().length) {
          <div soneCardFooter class="cart-footer">
            <button soneBtn type="button" class="checkout">
              <sone-icon icon="credit-card" /><span>Checkout</span>
              <sone-icon icon="arrow-right" />
            </button>
            <p class="secure">
              <sone-icon icon="lock" /> Secure checkout · 30-day returns
            </p>
          </div>
        }
        <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
      </section>
    </div>

    @if (quickView(); as qv) {
      <sone-dialog size="lg" (dismiss)="closeQuickView()">
        <div class="qv">
          <div class="qv-art art" [attr.data-tone]="qv.product.tone">
            <sone-icon [icon]="qv.product.icon" />
          </div>
          <div class="qv-info">
            <header soneDialogHeader>
              <p class="brand">{{ qv.product.brand }}</p>
              <h2 soneDialogTitle>{{ qv.product.name }}</h2>
              <p soneDialogDescription>{{ qv.product.description }}</p>
            </header>
            <div class="rating-row">
              <sone-rating size="sm" readonly [value]="qv.product.rating" />
              <span class="reviews">
                {{ qv.product.rating }} · {{ qv.product.reviews }} reviews
              </span>
            </div>
            <p class="price-row qv-price">
              @if (qv.product.compareAt; as was) {
                <span class="sr-only">Sale price</span>
                <span class="price sale">{{ money(qv.product.price) }}</span>
                <span class="sr-only">, was</span>
                <s class="was">{{ money(was) }}</s>
                <span soneBadge variant="destructive"
                  >−{{ off(qv.product.price, was) }}%</span
                >
              } @else {
                <span class="price">{{ money(qv.product.price) }}</span>
              }
            </p>

            <div class="qv-choice">
              <span class="group-label" id="shop-qv-colour"
                >Colour · {{ colour(qv.colour).label }}</span
              >
              <div
                soneToggleGroup
                variant="outline"
                size="sm"
                [spacing]="1"
                role="group"
                aria-labelledby="shop-qv-colour"
              >
                @for (c of qv.product.colours; track c) {
                  <button
                    soneToggleGroupItem
                    type="button"
                    [pressed]="qv.colour === c"
                    (click)="setQuick({ colour: c })"
                  >
                    <span class="dot" [attr.data-tone]="colour(c).tone"></span>
                    {{ colour(c).label }}
                  </button>
                }
              </div>
            </div>

            @if (qv.product.sizes; as sizes) {
              <div class="qv-choice">
                <span class="group-label" id="shop-qv-size">Size</span>
                <div
                  soneToggleGroup
                  variant="outline"
                  size="sm"
                  [spacing]="1"
                  role="group"
                  aria-labelledby="shop-qv-size"
                >
                  @for (s of sizes; track s) {
                    <button
                      soneToggleGroupItem
                      type="button"
                      [pressed]="qv.size === s"
                      (click)="setQuick({ size: s })"
                    >
                      {{ s }}
                    </button>
                  }
                </div>
              </div>
            }

            <div soneField class="qv-qty">
              <label soneFieldLabel for="shop-qv-qty">Quantity</label>
              <sone-input-number
                inputId="shop-qv-qty"
                [min]="1"
                [max]="maxQty(qv.product)"
                [value]="qv.qty"
                (valueChange)="setQuick({ qty: $event ?? 1 })"
              />
              <p soneFieldDescription>
                @if (qv.product.stock <= lowStock) {
                  Only {{ qv.product.stock }} left in stock.
                } @else {
                  In stock, ships in 1–2 business days.
                }
              </p>
            </div>
          </div>
        </div>
        <footer soneDialogFooter>
          <button
            soneBtn
            variant="outline"
            type="button"
            [attr.aria-pressed]="isSaved(qv.product.id)"
            (click)="toggleWish(qv.product.id)"
          >
            <sone-icon icon="heart" /><span>{{
              isSaved(qv.product.id) ? "Saved" : "Save"
            }}</span>
          </button>
          <button soneBtn type="button" (click)="addFromQuickView()">
            <sone-icon icon="shopping-cart" /><span
              >Add to cart · {{ money(qv.product.price * qv.qty) }}</span
            >
          </button>
        </footer>
      </sone-dialog>
    }
  `,
  styles: `
    :host {
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
      border: 1px solid var(--border);
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
      border: 1px solid var(--border);
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
      border: 1px dashed var(--border);
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
      border-bottom: 1px solid var(--border-subtle);
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
      border-top: 1px solid var(--border);
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
      :host {
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
  `,
})
export default class EcommerceTemplate {
  protected readonly products = PRODUCTS;
  protected readonly categories = CATEGORIES;
  protected readonly counts = Object.fromEntries(
    CATEGORIES.map((c) => [
      c.id,
      PRODUCTS.filter((p) => p.category === c.id).length,
    ]),
  ) as Record<CategoryId, number>;
  protected readonly priceMin = PRICE_MIN;
  protected readonly priceMax = PRICE_MAX;
  protected readonly lowStock = LOW_STOCK;
  protected readonly promoCode = PROMO.code;
  protected readonly freeShippingAt = FREE_SHIPPING;
  protected readonly freeShipping = usd(FREE_SHIPPING).replace(".00", "");

  protected readonly ratingOptions: readonly SegmentOption[] = [
    { value: "0", label: "Any" },
    { value: "4", label: "4+" },
    { value: "4.5", label: "4.5+" },
  ];
  protected readonly sorts: readonly { value: Sort; label: string }[] = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
    { value: "rating", label: "Top rated" },
    { value: "newest", label: "Newest" },
  ];
  protected readonly densities: readonly SegmentOption[] = [
    { value: "comfortable", label: "Comfortable" },
    { value: "compact", label: "Compact" },
  ];

  // Filters, sort and view.
  protected readonly query = signal("");
  protected readonly category = signal<CategoryId | "all">("all");
  protected readonly maxPrice = signal(PRICE_MAX);
  protected readonly minRating = signal("0");
  protected readonly inStock = signal(false);
  protected readonly sort = signal<string>("featured");
  protected readonly density = signal<string>("comfortable");
  protected readonly filtersOpen = signal(false);

  protected readonly filtered = computed(
    () =>
      this.category() !== "all" ||
      this.maxPrice() < PRICE_MAX ||
      this.minRating() !== "0" ||
      this.inStock() ||
      this.query().trim() !== "",
  );

  protected readonly categoryLabel = computed(() => {
    const id = this.category();
    return id === "all"
      ? "All products"
      : (CATEGORIES.find((c) => c.id === id)?.label ?? "All products");
  });

  protected readonly visible = computed<readonly Product[]>(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    const max = this.maxPrice();
    const min = Number(this.minRating());
    const stock = this.inStock();
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
    return [...rows].sort(by[this.sort() as Sort] ?? by.featured);
  });

  // Wishlist.
  protected readonly wishlist = signal<readonly string[]>(["halo"]);

  // Cart.
  protected readonly lines = signal<readonly CartLine[]>(INITIAL_CART);
  protected readonly announcement = signal("");
  private readonly cartTitle = viewChild<ElementRef<HTMLElement>>("cartTitle");

  protected readonly cartRows = computed(() =>
    this.lines().map((l) => {
      const product = productOf(l.productId);
      return {
        ...l,
        product,
        variant: [colourOf(l.colour).label, l.size].filter(Boolean).join(" · "),
        max: this.maxQty(product),
        total: product.price * l.qty,
      };
    }),
  );
  protected readonly itemCount = computed(() =>
    this.lines().reduce((n, l) => n + l.qty, 0),
  );
  protected readonly itemsLabel = computed(() => {
    const n = this.itemCount();
    return n === 1 ? "1 item" : `${n} items`;
  });
  protected readonly subtotal = computed(() =>
    round2(this.cartRows().reduce((s, l) => s + l.total, 0)),
  );

  // Promo code.
  protected readonly promoInput = signal("");
  protected readonly promoError = signal<string | null>(null);
  protected readonly promo = signal(false);

  protected readonly discount = computed(() =>
    this.promo() ? round2(this.subtotal() * PROMO.rate) : 0,
  );
  protected readonly shippingLeft = computed(() =>
    Math.max(0, round2(FREE_SHIPPING - this.subtotal())),
  );
  protected readonly shipping = computed(() =>
    this.shippingLeft() > 0 ? SHIPPING : 0,
  );
  protected readonly tax = computed(() =>
    round2((this.subtotal() - this.discount()) * TAX_RATE),
  );
  protected readonly total = computed(() =>
    round2(this.subtotal() - this.discount() + this.shipping() + this.tax()),
  );

  // Quick view.
  private readonly quick = signal<QuickView | null>(null);
  protected readonly quickView = computed(() => {
    const q = this.quick();
    return q ? { ...q, product: productOf(q.productId) } : null;
  });

  protected money(n: number): string {
    return usd(n);
  }

  protected off(price: number, was: number): number {
    return Math.round((1 - price / was) * 100);
  }

  protected colour(id: string): Colour {
    return colourOf(id);
  }

  protected maxQty(p: Product): number {
    return Math.max(1, Math.min(p.stock, 10));
  }

  protected isSaved(id: string): boolean {
    return this.wishlist().includes(id);
  }

  protected toggleWish(id: string): void {
    this.wishlist.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  protected clearFilters(): void {
    this.query.set("");
    this.category.set("all");
    this.maxPrice.set(PRICE_MAX);
    this.minRating.set("0");
    this.inStock.set(false);
  }

  protected focusCart(): void {
    this.cartTitle()?.nativeElement.focus();
  }

  /** "Add to cart" on a card: the first colour and size. */
  protected quickAdd(p: Product): void {
    this.add(p, p.colours[0], p.sizes?.[0] ?? null, 1);
  }

  protected openQuickView(p: Product): void {
    this.quick.set({
      productId: p.id,
      colour: p.colours[0],
      size: p.sizes?.[0] ?? null,
      qty: 1,
    });
  }

  protected closeQuickView(): void {
    this.quick.set(null);
  }

  protected setQuick(patch: Partial<Omit<QuickView, "productId">>): void {
    this.quick.update((q) => (q ? { ...q, ...patch } : q));
  }

  protected addFromQuickView(): void {
    const q = this.quick();
    if (!q) return;
    this.add(productOf(q.productId), q.colour, q.size, q.qty);
    this.quick.set(null);
  }

  private add(
    p: Product,
    colour: string,
    size: string | null,
    qty: number,
  ): void {
    const key = lineKey(p.id, colour, size);
    const max = this.maxQty(p);
    this.lines.update((lines) =>
      lines.some((l) => l.key === key)
        ? lines.map((l) =>
            l.key === key ? { ...l, qty: Math.min(l.qty + qty, max) } : l,
          )
        : [...lines, { key, productId: p.id, colour, size, qty }],
    );
    this.announcement.set(
      `Added ${p.name} to your cart. ${this.itemsLabel()} in cart.`,
    );
  }

  protected setQty(key: string, qty: number | null): void {
    if (qty === null) return;
    this.lines.update((lines) =>
      lines.map((l) => (l.key === key ? { ...l, qty } : l)),
    );
  }

  protected remove(key: string): void {
    const line = this.lines().find((l) => l.key === key);
    this.lines.update((lines) => lines.filter((l) => l.key !== key));
    if (line) {
      this.announcement.set(
        `Removed ${productOf(line.productId).name}. ${this.itemsLabel()} in cart.`,
      );
    }
    // The removed line held focus: keep it in the cart.
    if (this.lines().length === 0) this.focusCart();
  }

  protected applyPromo(): void {
    const code = this.promoInput().trim().toUpperCase();
    if (!code) {
      this.promoError.set("Enter a promo code.");
    } else if (code !== PROMO.code) {
      this.promoError.set(`“${code}” is not a valid promo code.`);
    } else {
      this.promo.set(true);
      this.promoError.set(null);
      this.promoInput.set("");
      this.announcement.set(`Promo code ${PROMO.code} applied: 10% off.`);
    }
  }

  protected removePromo(): void {
    this.promo.set(false);
    this.announcement.set("Promo code removed.");
  }
}
