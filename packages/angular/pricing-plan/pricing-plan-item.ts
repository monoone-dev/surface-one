// The pricing plans, with no framework in it: the Angular `sone-pricing-plan(s)`, the
// Vue and React twins (through @surface-one/core) read it.
import type { ShellIcon } from "@surface-one/angular/icon";

/** A line of a plan's feature list: its text, or the text with its own glyph. */
export type PricingPlanFeature =
  string | { readonly title: string; readonly icon?: ShellIcon };

/** A plan's call to action: a link drawn as a full-width button. */
export interface PricingPlanButton {
  readonly label: string;
  readonly href: string;
  /** The button look: `default` on a highlighted plan, else `outline`. */
  readonly variant?:
    "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  readonly target?: string;
  readonly rel?: string;
}

/** One plan of `sone-pricing-plans` (the inputs of `sone-pricing-plan`). */
export interface PricingPlanItem {
  readonly key?: string;
  readonly title: string;
  readonly description?: string;
  /** A badge beside the title ("Most popular"). */
  readonly badge?: string;
  /** The price as shown: `$29`, `Free`, `Custom`. */
  readonly price: string;
  /** A lower price that replaces it; `price` is struck through. */
  readonly discount?: string;
  /** `/month` — after the price. */
  readonly billingCycle?: string;
  /** `billed annually` — under the cycle. */
  readonly billingPeriod?: string;
  /** A line between the price and the features. */
  readonly tagline?: string;
  readonly features?: readonly PricingPlanFeature[];
  readonly button?: PricingPlanButton;
  /** Small print under the button. */
  readonly terms?: string;
  /** Draws the plan with the accent: the one to pick. */
  readonly highlight?: boolean;
}

/** The feature list with a glyph on every line (`check` unless it has its own). */
export const pricingPlanFeatures = (
  features: readonly PricingPlanFeature[] | null | undefined,
): { readonly title: string; readonly icon: ShellIcon }[] =>
  (features ?? []).map((f) =>
    typeof f === "string"
      ? { title: f, icon: "check" }
      : { title: f.title, icon: f.icon ?? "check" },
  );

/** The button's look: its own, else `default` on a highlighted plan and `outline` otherwise. */
export const pricingPlanButtonVariant = (
  button: PricingPlanButton,
  highlight: boolean,
): NonNullable<PricingPlanButton["variant"]> =>
  button.variant ?? (highlight ? "default" : "outline");

/** The button's `rel`: its own, else `noopener noreferrer` for a new tab. */
export const pricingPlanButtonRel = (
  button: PricingPlanButton,
): string | null =>
  button.rel ?? (button.target === "_blank" ? "noopener noreferrer" : null);
