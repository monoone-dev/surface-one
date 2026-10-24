import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { toHeadingLevel, type HeadingLevel } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  pricingPlanButtonRel,
  pricingPlanButtonVariant,
  pricingPlanFeatures,
  type PricingPlanButton,
  type PricingPlanFeature,
  type PricingPlanItem,
} from "./pricing-plan-item";

/**
 * `<sone-pricing-plan>` — one plan of a pricing page (Nuxt UI PricingPlan): the title
 * as a heading (`level`, default 3) with a `badge`, a description, the `price` (struck
 * through when a `discount` replaces it) with its `billingCycle` / `billingPeriod`, a
 * `tagline`, a feature list with check marks, a call-to-action `button` (a link) and
 * `terms`. `highlight` draws it with the accent; with `scale` it stands taller than its
 * neighbours once the row is wide. `[sonePricingPlanFooter]` adds your own controls.
 */
@Component({
  selector: "sone-pricing-plan",
  imports: [SoneBadgeDirective, SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./pricing-plan.component.html",
  styleUrl: "./pricing-plan.component.scss",
  host: {
    "data-slot": "pricing-plan",
    "[attr.data-highlight]": "highlight() ? '' : null",
    "[attr.data-scale]": "scale() ? '' : null",
    "[attr.title]": "null",
  },
})
export class SonePricingPlanComponent {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  /** A badge beside the title ("Most popular"). */
  readonly badge = input<string | null>(null);
  /** The price as shown: `$29`, `Free`, `Custom`. */
  readonly price = input.required<string>();
  /** A lower price that replaces it; `price` is struck through. */
  readonly discount = input<string | null>(null);
  /** `/month` — after the price. */
  readonly billingCycle = input<string | null>(null);
  /** `billed annually` — under the cycle. */
  readonly billingPeriod = input<string | null>(null);
  /** A line between the price and the features. */
  readonly tagline = input<string | null>(null);
  readonly features = input<readonly PricingPlanFeature[]>([]);
  /** The call to action, a link drawn as a full-width button. */
  readonly button = input<PricingPlanButton | null>(null);
  /** Small print under the button. */
  readonly terms = input<string | null>(null);
  /** Draws the plan with the accent: the one to pick. */
  readonly highlight = input(false, { transform: booleanAttribute });
  /** A highlighted plan stands taller than its neighbours once the row is wide. */
  readonly scale = input(false, { transform: booleanAttribute });
  /** The title's heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(3, {
    transform: (v: unknown) => toHeadingLevel(v, 3),
  });
  /** Read before a struck-through price. */
  readonly regularPriceLabel = input(
    $localize`:Before a struck-through price:Regular price`,
  );
  /** Read before the price that replaces it. */
  readonly discountLabel = input(
    $localize`:Before a discounted price:Discounted price`,
  );

  protected readonly lines = computed(() =>
    pricingPlanFeatures(this.features()),
  );
  protected readonly buttonVariant = pricingPlanButtonVariant;
  protected readonly rel = pricingPlanButtonRel;
}

/** `[sonePricingPlanFooter]` — your own controls next to the plan's button. */
@Directive({
  selector: "[sonePricingPlanFooter]",
  host: { "data-slot": "pricing-plan-actions" },
})
export class SonePricingPlanFooterDirective {}

/**
 * `<sone-pricing-plans>` — a row of pricing plans (Nuxt UI PricingPlans): from `plans`
 * or projected `sone-pricing-plan`s, as many columns as fit. `scale` lets the
 * highlighted plans stand taller.
 */
@Component({
  selector: "sone-pricing-plans",
  imports: [SonePricingPlanComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (plan of plans(); track plan.key ?? $index) {
      <sone-pricing-plan
        [title]="plan.title"
        [description]="plan.description ?? null"
        [badge]="plan.badge ?? null"
        [price]="plan.price"
        [discount]="plan.discount ?? null"
        [billingCycle]="plan.billingCycle ?? null"
        [billingPeriod]="plan.billingPeriod ?? null"
        [tagline]="plan.tagline ?? null"
        [features]="plan.features ?? []"
        [button]="plan.button ?? null"
        [terms]="plan.terms ?? null"
        [highlight]="plan.highlight ?? false"
        [scale]="scale()"
        [level]="level()"
      />
    }
    <ng-content />
  `,
  styleUrl: "./pricing-plans.component.scss",
  host: { "data-slot": "pricing-plans" },
})
export class SonePricingPlansComponent {
  readonly plans = input<readonly PricingPlanItem[]>([]);
  /** Highlighted plans stand taller than their neighbours once the row is wide. */
  readonly scale = input(false, { transform: booleanAttribute });
  /** The plans' heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(3, {
    transform: (v: unknown) => toHeadingLevel(v, 3),
  });
}

export const SONE_PRICING_PLAN_PARTS = [
  SonePricingPlanComponent,
  SonePricingPlanFooterDirective,
  SonePricingPlansComponent,
] as const;
