import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";

import {
  markSizePreset,
  markSizeStyle,
  type MarkSize,
  type MarkTone,
} from "./mark-tones";

/**
 * `<sone-mark>` — an app or source mark: a small rounded tile (28% of its size round)
 * with a gradient `tone` and a white glyph. Decorative by default (`aria-hidden`); give
 * it a `label` when nothing next to it names what it stands for, and it becomes an image.
 */
@Component({
  selector: "sone-mark",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<sone-icon [icon]="icon()" />`,
  styleUrl: "./mark.component.scss",
  host: {
    "data-slot": "mark",
    "[attr.data-tone]": "tone()",
    "[attr.data-size]": "preset()",
    "[style.--mark-size]": "px()",
    "[attr.role]": "label() ? 'img' : null",
    "[attr.aria-label]": "label()",
    "[attr.aria-hidden]": "label() ? null : 'true'",
  },
})
export class SoneMarkComponent {
  readonly icon = input<ShellIcon>("layout-grid");
  readonly tone = input<MarkTone>("brand");
  /** `sm` (20), `md` (28), `lg` (40) or a size in px. */
  readonly size = input<MarkSize>("md");
  /** The accessible name; leave it out when text beside the mark already names it. */
  readonly label = input<string | null>(null);

  protected readonly preset = computed(() => markSizePreset(this.size()));
  protected readonly px = computed(() => markSizeStyle(this.size()));
}
