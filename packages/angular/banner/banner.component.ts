import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

import type { AlertVariant } from "@surface-one/angular/alert";

export type BannerKind = "info" | "success" | "warning" | "danger";

@Component({
  selector: "sone-banner",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "alert",
    "data-slot": "alert",
    "[attr.data-variant]": "variant()",
    "[attr.role]": "role()",
    "[attr.data-floating]": "floating() ? '' : null",
  },
  templateUrl: "./banner.component.html",
  styleUrl: "./banner.component.scss",
})
export class SoneBannerComponent {
  readonly kind = input<BannerKind>("info");
  /**
   * An opaque, raised banner for an overlay (a fixed notice over the page): the overlay
   * surface, a strong (or status-coloured) border and a large shadow instead of the
   * translucent status tint, which would let the content underneath show through.
   */
  readonly floating = input(false, { transform: booleanAttribute });
  readonly variant = computed<AlertVariant>(() => {
    const kind = this.kind();
    return kind === "danger" ? "destructive" : kind;
  });
  readonly role = computed(() =>
    this.kind() === "danger" || this.kind() === "warning" ? "alert" : "status",
  );
}
