import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { DomSanitizer, type SafeHtml } from "@angular/platform-browser";

import { SONE_ICONS, type ShellIcon } from "./icons";

export type { ShellIcon };

export type IconSize = "xs" | "sm" | "base" | "lg" | "xl";

@Component({
  selector: "sone-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "icon",
    "[attr.data-icon]": "icon()",
    "[attr.data-size]": "size()",
    "[attr.data-inline]": "inline()",
  },
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
})
export class SoneIconComponent {
  readonly icon = input.required<ShellIcon>();
  readonly size = input<IconSize | null>(null);
  // Only for a MEANINGFUL icon (the only thing saying what it means); omit for a
  // decorative glyph next to a text label — it then stays `aria-hidden`.
  readonly label = input<string | null>(null);
  readonly inline = input<"start" | "end" | null>(null);

  private readonly sanitizer = inject(DomSanitizer);
  /** The glyph's markup: a constant of ./icons.ts, never user input, so it is trusted as is. */
  protected readonly markup = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(SONE_ICONS[this.icon()] ?? ""),
  );
}
