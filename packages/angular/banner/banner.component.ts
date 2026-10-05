import {
  ChangeDetectionStrategy,
  Component,
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
  },
  templateUrl: "./banner.component.html",
  styleUrl: "./banner.component.scss",
})
export class SoneBannerComponent {
  readonly kind = input<BannerKind>("info");
  readonly variant = computed<AlertVariant>(() => {
    const kind = this.kind();
    return kind === "danger" ? "destructive" : kind;
  });
  readonly role = computed(() =>
    this.kind() === "danger" || this.kind() === "warning" ? "alert" : "status",
  );
}
