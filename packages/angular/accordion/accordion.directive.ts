import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
} from "@angular/core";
import { rovingFocusTarget, soneId } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  isAccordionItemOpen,
  toggleAccordionValue,
  type AccordionType,
  type AccordionValue,
} from "./accordion-state";

const state = (open: boolean) => (open ? "open" : "closed");

/**
 * `[soneAccordion]` / `<sone-accordion>` — a stack of headed sections that show and
 * hide their content (WAI-ARIA Accordion). `type` single or multiple, `collapsible`
 * (single), two-way `[(value)]` with the open item values. Up / Down, Home and End
 * move between the triggers.
 */
@Directive({
  selector: "[soneAccordion], sone-accordion",
  exportAs: "soneAccordion",
  host: {
    class: "accordion",
    "data-slot": "accordion",
    "data-orientation": "vertical",
    "[attr.data-disabled]": "disabled() ? '' : null",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneAccordionDirective {
  /** `single`: one item open at a time; `multiple`: any number. */
  readonly type = input<AccordionType>("single");
  /** A `single` accordion lets its open item close again. */
  readonly collapsible = input(false, { transform: booleanAttribute });
  /** Disables every item. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The open item values: a value (or `null`) when `single`, a list when `multiple`. */
  readonly value = model<AccordionValue>(null);

  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  isOpen(item: string): boolean {
    return isAccordionItemOpen(this.value(), item);
  }

  toggle(item: string): void {
    const next = toggleAccordionValue(
      this.value(),
      item,
      this.type(),
      this.collapsible(),
    );
    if (next !== this.value()) this.value.set(next);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.classList.contains("accordion-trigger")) return;
    const triggers = Array.from(
      this.host.querySelectorAll<HTMLButtonElement>("button.accordion-trigger"),
    ).filter(
      (el) =>
        !el.disabled && el.closest('[data-slot="accordion"]') === this.host,
    );
    const at = triggers.indexOf(target as HTMLButtonElement);
    if (at < 0) return;
    rovingFocusTarget(event, triggers, at, { paging: false })?.focus();
  }
}

/** `[soneAccordionItem]` / `<sone-accordion-item>` — one section: a trigger and its content. */
@Directive({
  selector: "[soneAccordionItem], sone-accordion-item",
  exportAs: "soneAccordionItem",
  host: {
    class: "accordion-item",
    "data-slot": "accordion-item",
    "[attr.data-state]": "state()",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
  },
})
export class SoneAccordionItemDirective {
  private readonly root = inject(SoneAccordionDirective);
  private readonly uid = soneId("sone-accordion-item");

  /** Names the item in the accordion's `value`; unique by default. */
  readonly value = input<string>(this.uid);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly triggerId = `${this.uid}-trigger`;
  readonly contentId = `${this.uid}-content`;

  readonly open = computed(() => this.root.isOpen(this.value()));
  readonly isDisabled = computed(() => this.disabled() || this.root.disabled());
  readonly state = computed(() => state(this.open()));

  toggle(): void {
    if (!this.isDisabled()) this.root.toggle(this.value());
  }
}

/**
 * `<sone-accordion-trigger>` — the item's heading (`role="heading"`, `level`) with the
 * button that opens and closes it. Project an `[soneAccordionIcon]` to replace the chevron.
 */
@Component({
  selector: "sone-accordion-trigger",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "accordion-header",
    "data-slot": "accordion-header",
    role: "heading",
    "[attr.aria-level]": "level()",
    "[attr.data-state]": "item.state()",
  },
  templateUrl: "./accordion-trigger.component.html",
})
export class SoneAccordionTriggerComponent {
  protected readonly item = inject(SoneAccordionItemDirective);
  /** The heading level of the trigger (`aria-level`). */
  readonly level = input(3, { transform: numberAttribute });
}

/** `[soneAccordionContent]` / `<sone-accordion-content>` — the region the trigger shows. */
@Directive({
  selector: "[soneAccordionContent], sone-accordion-content",
  host: {
    class: "accordion-content",
    "data-slot": "accordion-content",
    role: "region",
    "[id]": "item.contentId",
    "[attr.aria-labelledby]": "item.triggerId",
    "[attr.data-state]": "item.state()",
    "[attr.data-disabled]": "item.isDisabled() ? '' : null",
    "[hidden]": "!item.open()",
  },
})
export class SoneAccordionContentDirective {
  protected readonly item = inject(SoneAccordionItemDirective);
}

/** `[soneAccordionIcon]` — your own icon in place of the chevron; it turns when open. */
@Directive({
  selector: "[soneAccordionIcon]",
  host: {
    class: "accordion-icon",
    "data-slot": "accordion-trigger-icon",
    "aria-hidden": "true",
  },
})
export class SoneAccordionIconDirective {}

export const SONE_ACCORDION_PARTS = [
  SoneAccordionDirective,
  SoneAccordionItemDirective,
  SoneAccordionTriggerComponent,
  SoneAccordionContentDirective,
  SoneAccordionIconDirective,
] as const;
