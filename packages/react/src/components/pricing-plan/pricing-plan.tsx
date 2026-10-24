"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  pricingPlanButtonRel,
  pricingPlanButtonVariant,
  pricingPlanFeatures,
  toHeadingLevel,
  type HeadingLevel,
  type PricingPlanButton,
  type PricingPlanFeature,
  type PricingPlanItem,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type {
  PricingPlanButton,
  PricingPlanFeature,
  PricingPlanItem,
} from "@surface-one/core";

type Level = HeadingLevel | `${HeadingLevel}`;

export interface SonePricingPlanProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: string;
  readonly description?: string | null;
  /** A badge beside the title ("Most popular"). */
  readonly badge?: string | null;
  /** The price as shown: `$29`, `Free`, `Custom`. */
  readonly price: string;
  /** A lower price that replaces it; `price` is struck through. */
  readonly discount?: string | null;
  readonly billingCycle?: string | null;
  readonly billingPeriod?: string | null;
  readonly tagline?: string | null;
  readonly features?: readonly PricingPlanFeature[];
  /** The call to action, a link drawn as a full-width button. */
  readonly button?: PricingPlanButton | null;
  /** Small print under the button. */
  readonly terms?: string | null;
  readonly highlight?: boolean;
  readonly scale?: boolean;
  /** The title's heading level, 1–6. */
  readonly level?: Level;
  /** Read before a struck-through price (default: the message). */
  readonly regularPriceLabel?: string | null;
  /** Read before the price that replaces it (default: the message). */
  readonly discountLabel?: string | null;
  /** Your own controls next to the button (the Vue `#footer` slot). */
  readonly footer?: ReactNode;
  /** Under the features. */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-pricing-plan>` — one plan of a pricing page (Nuxt UI PricingPlan): the title
 * as a heading (`level`, default 3) with a `badge`, a description, the `price` (struck
 * through when a `discount` replaces it) with its billing, a `tagline`, a feature list
 * with check marks, a call-to-action `button` link and `terms`. `highlight` draws it
 * with the accent; `scale` lets it stand taller once the row is wide.
 */
export function SonePricingPlan({
  title,
  description = null,
  badge = null,
  price,
  discount = null,
  billingCycle = null,
  billingPeriod = null,
  tagline = null,
  features = [],
  button = null,
  terms = null,
  highlight = false,
  scale = false,
  level = 3,
  regularPriceLabel = null,
  discountLabel = null,
  footer,
  children,
  ...rest
}: SonePricingPlanProps): ReactElement {
  const messages = useSoneMessages();
  const lines = pricingPlanFeatures(features);
  return createElement(
    "sone-pricing-plan",
    {
      "data-slot": "pricing-plan",
      "data-highlight": highlight ? "" : undefined,
      "data-scale": scale ? "" : undefined,
      ...rest,
    },
    <div className="pricing-plan-header" data-slot="pricing-plan-header">
      <div className="pricing-plan-title-row">
        {createElement(
          `h${toHeadingLevel(level, 3)}`,
          {
            className: "pricing-plan-title",
            "data-slot": "pricing-plan-title",
          },
          title,
        )}
        {badge ? (
          <SoneBadge
            className="pricing-plan-badge"
            data-slot="pricing-plan-badge"
            variant={highlight ? "default" : "secondary"}
          >
            {badge}
          </SoneBadge>
        ) : null}
      </div>
      {description ? (
        <p
          className="pricing-plan-description"
          data-slot="pricing-plan-description"
        >
          {description}
        </p>
      ) : null}
    </div>,
    <p className="pricing-plan-pricing" data-slot="pricing-plan-pricing">
      {discount ? (
        <>
          <span className="pricing-plan-price-original">
            <span className="sr-only">{`${regularPriceLabel ?? messages.pricingPlanRegularPrice} `}</span>
            <s>{price}</s>
          </span>
          <span className="pricing-plan-price">
            <span className="sr-only">{`${discountLabel ?? messages.pricingPlanDiscountedPrice} `}</span>
            {discount}
          </span>
        </>
      ) : (
        <span className="pricing-plan-price">{price}</span>
      )}
      {billingCycle || billingPeriod ? (
        <span className="pricing-plan-billing">
          {billingCycle ? (
            <span className="pricing-plan-cycle">{billingCycle}</span>
          ) : null}
          {billingPeriod ? (
            <span className="pricing-plan-period">{billingPeriod}</span>
          ) : null}
        </span>
      ) : null}
    </p>,
    tagline ? (
      <p className="pricing-plan-tagline" data-slot="pricing-plan-tagline">
        {tagline}
      </p>
    ) : null,
    lines.length ? (
      <ul className="pricing-plan-features" data-slot="pricing-plan-features">
        {lines.map((line, i) => (
          <li key={i} className="pricing-plan-feature">
            <SoneIcon icon={line.icon} />
            <span>{line.title}</span>
          </li>
        ))}
      </ul>
    ) : null,
    children,
    <div className="pricing-plan-footer" data-slot="pricing-plan-footer">
      {button ? (
        <SoneButton
          as="a"
          className="pricing-plan-button"
          data-slot="pricing-plan-button"
          size="lg"
          variant={pricingPlanButtonVariant(button, highlight)}
          href={button.href}
          target={button.target}
          rel={pricingPlanButtonRel(button) ?? undefined}
        >
          {button.label}
        </SoneButton>
      ) : null}
      {footer}
      {terms ? (
        <p className="pricing-plan-terms" data-slot="pricing-plan-terms">
          {terms}
        </p>
      ) : null}
    </div>,
  );
}

export interface SonePricingPlansProps extends HTMLAttributes<HTMLElement> {
  readonly plans?: readonly PricingPlanItem[];
  /** Highlighted plans stand taller than their neighbours once the row is wide. */
  readonly scale?: boolean;
  /** The plans' heading level, 1–6. */
  readonly level?: Level;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-pricing-plans>` — a row of pricing plans (Nuxt UI PricingPlans): from `plans`
 * or `SonePricingPlan` children, as many columns as fit. `scale` lets the highlighted
 * plans stand taller.
 */
export function SonePricingPlans({
  plans = [],
  scale = false,
  level = 3,
  children,
  ...rest
}: SonePricingPlansProps): ReactElement {
  return createElement(
    "sone-pricing-plans",
    { "data-slot": "pricing-plans", ...rest },
    plans.map((plan, i) => (
      <SonePricingPlan
        key={plan.key ?? i}
        title={plan.title}
        description={plan.description ?? null}
        badge={plan.badge ?? null}
        price={plan.price}
        discount={plan.discount ?? null}
        billingCycle={plan.billingCycle ?? null}
        billingPeriod={plan.billingPeriod ?? null}
        tagline={plan.tagline ?? null}
        features={plan.features ?? []}
        button={plan.button ?? null}
        terms={plan.terms ?? null}
        highlight={plan.highlight ?? false}
        scale={scale}
        level={level}
      />
    )),
    children,
  );
}
