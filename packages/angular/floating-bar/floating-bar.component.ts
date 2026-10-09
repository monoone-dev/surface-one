import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";

export type FloatingBarState = "idle" | "live" | "processing";

@Component({
  selector: "sone-floating-bar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent, SoneTooltipDirective],
  host: {
    "data-slot": "floating-bar",
    "[attr.data-state]": "state()",
  },
  templateUrl: "./floating-bar.component.html",
  styleUrl: "./floating-bar.component.scss",
})
export class SoneFloatingBarComponent {
  private readonly renderer = inject(Renderer2);

  readonly state = input<FloatingBarState>("idle");
  readonly closeLabel = input(
    $localize`:Button that hides the floating recording bar:Hide`,
  );
  /** Show the trailing close button. */
  readonly closable = input(true, { transform: booleanAttribute });
  /**
   * An attribute that marks the bar's chrome as the window's drag handle — Tauri's
   * `data-tauri-drag-region`. Set on the bar's own background element, so projected
   * content needs none of its own. `null` = no attribute.
   */
  readonly dragRegionAttr = input<string | null>(null);
  /**
   * The attribute's value. `deep` (default): Tauri 2.11 drags from anywhere inside
   * the bar except buttons, links, inputs and labels; `""`: the background only.
   */
  readonly dragRegionValue = input("deep");

  readonly closed = output<void>();

  private readonly chrome = viewChild<ElementRef<HTMLElement>>("chrome");
  private appliedDragAttr: string | null = null;

  private readonly _dragRegion = effect(() => {
    const el = this.chrome()?.nativeElement;
    const name = this.dragRegionAttr()?.trim() || null;
    const value = this.dragRegionValue();
    if (!el) {
      return;
    }
    if (this.appliedDragAttr && this.appliedDragAttr !== name) {
      this.renderer.removeAttribute(el, this.appliedDragAttr);
    }
    if (name) {
      this.renderer.setAttribute(el, name, value);
    }
    this.appliedDragAttr = name;
  });
}
