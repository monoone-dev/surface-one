import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";

import { SoneSidebarService } from "./sidebar.service";

export type SoneSidebarSide = "left" | "right";
export type SoneSidebarVariant = "sidebar" | "floating" | "inset";
export type SoneSidebarCollapsible = "offcanvas" | "icon" | "none";

/**
 * `sidebar.css` is global, not component-scoped: the app shell must be styled
 * before Angular boots (WKWebView cold-launch FOUC fix, see app-shell).
 *
 * `collapsible` defaults to `"none"`, not spartan's `"offcanvas"`: this same
 * part is also the static section rail in the Settings dialog, which must not
 * collapse whenever the app-wide sidebar does.
 */
@Component({
  selector: "sone-sidebar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    "data-slot": "sidebar",
    "[attr.data-state]": "dataState()",
    "[attr.data-collapsible]": "dataCollapsible()",
    "[attr.data-variant]": "dataVariant()",
    "[attr.data-side]": "dataSide()",
  },
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
})
export class SoneSidebarComponent {
  private readonly sidebar = inject(SoneSidebarService);

  readonly side = input<SoneSidebarSide>("left");
  readonly variant = input<SoneSidebarVariant>("sidebar");
  readonly collapsible = input<SoneSidebarCollapsible>("none");

  private readonly follows = computed(() => this.collapsible() !== "none");

  protected readonly dataState = computed(() =>
    this.follows() ? this.sidebar.state() : null,
  );
  protected readonly dataCollapsible = computed(() => {
    if (!this.follows()) return null;
    return this.sidebar.state() === "collapsed" ? this.collapsible() : "";
  });
  protected readonly dataVariant = computed(() =>
    this.follows() ? this.variant() : null,
  );
  protected readonly dataSide = computed(() =>
    this.follows() ? this.side() : null,
  );

  readonly iconCollapsed = computed(
    () => this.collapsible() === "icon" && this.sidebar.state() === "collapsed",
  );
  protected readonly layered = this.follows;
}
