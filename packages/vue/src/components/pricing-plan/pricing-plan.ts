import { defineComponent, h, type PropType } from "vue";

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

import { useSoneMessages } from "../../composables/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type {
  PricingPlanButton,
  PricingPlanFeature,
  PricingPlanItem,
} from "@surface-one/core";

const optionalString = {
  type: String as PropType<string | null>,
  default: null,
};
const levelProp = {
  type: [Number, String] as PropType<HeadingLevel | `${HeadingLevel}`>,
  default: 3,
};

/**
 * `<sone-pricing-plan>` — one plan of a pricing page (Nuxt UI PricingPlan): the title
 * as a heading (`level`, default 3) with a `badge`, a description, the `price` (struck
 * through when a `discount` replaces it) with its billing, a `tagline`, a feature list
 * with check marks, a call-to-action `button` link and `terms`. `highlight` draws it
 * with the accent; `scale` lets it stand taller once the row is wide. The default slot
 * goes under the features, the `#footer` slot next to the button.
 */
export const SonePricingPlan = defineComponent({
  name: "SonePricingPlan",
  props: {
    title: { type: String, required: true },
    description: optionalString,
    /** A badge beside the title ("Most popular"). */
    badge: optionalString,
    /** The price as shown: `$29`, `Free`, `Custom`. */
    price: { type: String, required: true },
    /** A lower price that replaces it; `price` is struck through. */
    discount: optionalString,
    billingCycle: optionalString,
    billingPeriod: optionalString,
    tagline: optionalString,
    features: {
      type: Array as PropType<readonly PricingPlanFeature[]>,
      default: () => [],
    },
    /** The call to action, a link drawn as a full-width button. */
    button: {
      type: Object as PropType<PricingPlanButton | null>,
      default: null,
    },
    /** Small print under the button. */
    terms: optionalString,
    highlight: { type: Boolean, default: false },
    scale: { type: Boolean, default: false },
    /** The title's heading level, 1–6. */
    level: levelProp,
    /** Read before a struck-through price (default: the message). */
    regularPriceLabel: optionalString,
    /** Read before the price that replaces it (default: the message). */
    discountLabel: optionalString,
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    return () => {
      const m = messages.value;
      const lines = pricingPlanFeatures(props.features);
      const button = props.button;
      return h(
        "sone-pricing-plan",
        {
          "data-slot": "pricing-plan",
          "data-highlight": props.highlight ? "" : undefined,
          "data-scale": props.scale ? "" : undefined,
        },
        [
          h(
            "div",
            {
              class: "pricing-plan-header",
              "data-slot": "pricing-plan-header",
            },
            [
              h("div", { class: "pricing-plan-title-row" }, [
                h(
                  `h${toHeadingLevel(props.level, 3)}`,
                  {
                    class: "pricing-plan-title",
                    "data-slot": "pricing-plan-title",
                  },
                  props.title,
                ),
                props.badge
                  ? h(
                      SoneBadge,
                      {
                        class: "pricing-plan-badge",
                        "data-slot": "pricing-plan-badge",
                        variant: props.highlight ? "default" : "secondary",
                      },
                      () => props.badge,
                    )
                  : null,
              ]),
              props.description
                ? h(
                    "p",
                    {
                      class: "pricing-plan-description",
                      "data-slot": "pricing-plan-description",
                    },
                    props.description,
                  )
                : null,
            ],
          ),
          h(
            "p",
            {
              class: "pricing-plan-pricing",
              "data-slot": "pricing-plan-pricing",
            },
            [
              ...(props.discount
                ? [
                    h("span", { class: "pricing-plan-price-original" }, [
                      h(
                        "span",
                        { class: "sr-only" },
                        `${props.regularPriceLabel ?? m.pricingPlanRegularPrice} `,
                      ),
                      h("s", props.price),
                    ]),
                    h("span", { class: "pricing-plan-price" }, [
                      h(
                        "span",
                        { class: "sr-only" },
                        `${props.discountLabel ?? m.pricingPlanDiscountedPrice} `,
                      ),
                      props.discount,
                    ]),
                  ]
                : [h("span", { class: "pricing-plan-price" }, props.price)]),
              props.billingCycle || props.billingPeriod
                ? h("span", { class: "pricing-plan-billing" }, [
                    props.billingCycle
                      ? h(
                          "span",
                          { class: "pricing-plan-cycle" },
                          props.billingCycle,
                        )
                      : null,
                    props.billingPeriod
                      ? h(
                          "span",
                          { class: "pricing-plan-period" },
                          props.billingPeriod,
                        )
                      : null,
                  ])
                : null,
            ],
          ),
          props.tagline
            ? h(
                "p",
                {
                  class: "pricing-plan-tagline",
                  "data-slot": "pricing-plan-tagline",
                },
                props.tagline,
              )
            : null,
          lines.length
            ? h(
                "ul",
                {
                  class: "pricing-plan-features",
                  "data-slot": "pricing-plan-features",
                },
                lines.map((line, i) =>
                  h("li", { key: i, class: "pricing-plan-feature" }, [
                    h(SoneIcon, { icon: line.icon }),
                    h("span", line.title),
                  ]),
                ),
              )
            : null,
          slots.default?.(),
          h(
            "div",
            {
              class: "pricing-plan-footer",
              "data-slot": "pricing-plan-footer",
            },
            [
              button
                ? h(
                    SoneButton,
                    {
                      as: "a",
                      class: "pricing-plan-button",
                      "data-slot": "pricing-plan-button",
                      size: "lg",
                      variant: pricingPlanButtonVariant(
                        button,
                        props.highlight,
                      ),
                      href: button.href,
                      target: button.target,
                      rel: pricingPlanButtonRel(button) ?? undefined,
                    },
                    () => button.label,
                  )
                : null,
              slots.footer?.(),
              props.terms
                ? h(
                    "p",
                    {
                      class: "pricing-plan-terms",
                      "data-slot": "pricing-plan-terms",
                    },
                    props.terms,
                  )
                : null,
            ],
          ),
        ],
      );
    };
  },
});

/**
 * `<sone-pricing-plans>` — a row of pricing plans (Nuxt UI PricingPlans): from `plans`
 * or `SonePricingPlan` children, as many columns as fit. `scale` lets the highlighted
 * plans stand taller.
 */
export const SonePricingPlans = defineComponent({
  name: "SonePricingPlans",
  props: {
    plans: {
      type: Array as PropType<readonly PricingPlanItem[]>,
      default: () => [],
    },
    scale: { type: Boolean, default: false },
    /** The plans' heading level, 1–6. */
    level: levelProp,
  },
  setup(props, { slots }) {
    return () =>
      h("sone-pricing-plans", { "data-slot": "pricing-plans" }, [
        ...props.plans.map((plan, i) =>
          h(SonePricingPlan, {
            key: plan.key ?? i,
            title: plan.title,
            description: plan.description ?? null,
            badge: plan.badge ?? null,
            price: plan.price,
            discount: plan.discount ?? null,
            billingCycle: plan.billingCycle ?? null,
            billingPeriod: plan.billingPeriod ?? null,
            tagline: plan.tagline ?? null,
            features: plan.features ?? [],
            button: plan.button ?? null,
            terms: plan.terms ?? null,
            highlight: plan.highlight ?? false,
            scale: props.scale,
            level: props.level,
          }),
        ),
        slots.default?.(),
      ]);
  },
});
