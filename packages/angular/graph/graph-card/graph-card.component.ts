import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  input,
  output,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { SoneButtonDirective } from "@surface-one/angular/button";
import type { GraphSceneAnchor } from "@surface-one/angular/graph-layout";

import { graphCardPlacement } from "../graph-model";

/**
 * The node card of a graph. Floating, it sits above (or below, near the top edge)
 * the node at `anchor` and ignores the pointer; `pinned`, it docks to the
 * bottom-left corner and offers the `openLabel` action. `data-node-x` /
 * `data-node-y` expose the node's on-screen position for tests.
 */
@Component({
  selector: "sone-graph-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, NgTemplateOutlet],
  templateUrl: "./graph-card.component.html",
  styleUrl: "./graph-card.component.scss",
  host: {
    "data-slot": "graph-card",
    "[attr.data-state]": "pinned() ? 'pinned' : 'floating'",
    "[style.left.px]": "left()",
    "[style.top.px]": "top()",
    "[class.is-below]": "below()",
    "[attr.data-node-x]": "anchor()?.x",
    "[attr.data-node-y]": "anchor()?.y",
  },
})
export class SoneGraphCardComponent {
  readonly anchor = input<GraphSceneAnchor | null>(null);
  readonly heading = input.required<string>();
  readonly meta = input("");
  /** Any CSS colour for the swatch, e.g. `var(--graph-note)`. */
  readonly tone = input("var(--graph-ink)");
  readonly square = input(false, { transform: booleanAttribute });
  readonly pinned = input(false, { transform: booleanAttribute });
  /** The text of the open action of a pinned card; `null` hides it. */
  readonly openLabel = input<string | null>(null);
  /** Replaces the heading and meta lines. */
  readonly body = input<TemplateRef<unknown> | null>(null);
  readonly bodyContext = input<unknown>(null);

  readonly open = output<void>();

  private readonly placement = computed(() =>
    graphCardPlacement(this.anchor(), this.pinned()),
  );
  protected readonly below = computed(() => this.placement().below);
  protected readonly left = computed(() => this.placement().left);
  protected readonly top = computed(() => this.placement().top);
}
