import { Directive, computed, input } from "@angular/core";
import { chartColor } from "@surface-one/angular/core";

export type SoneSwatchShape = "dot" | "square" | "line";

/**
 * `span[soneSwatch]` — the colour key of a series: a dot, a square or a short
 * line. Decorative (`aria-hidden`); the text next to it carries the meaning.
 * `tone` is a token suffix (`chart-3`, `graph-note`, `success`), a custom
 * property name (`--brand`) or any CSS colour; empty uses `currentColor`.
 * Size it with `--swatch-size`.
 */
@Directive({
  selector: "span[soneSwatch]",
  host: {
    "data-slot": "chart-swatch",
    "aria-hidden": "true",
    "[attr.data-shape]": "shape()",
    "[style.--swatch-color]": "color()",
  },
})
export class SoneSwatchDirective {
  readonly tone = input<string | null | undefined>("");

  readonly shape = input<SoneSwatchShape>("dot");

  protected readonly color = computed(() => chartColor(this.tone()));
}
