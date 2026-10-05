import {
  Directive,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  forwardRef,
  inject,
  input,
} from "@angular/core";

@Directive({
  selector: "[soneChoiceGroup]",
  host: {
    role: "radiogroup",
    "data-slot": "choice-group",
    "[attr.aria-orientation]": "orientation()",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneChoiceGroupDirective {
  readonly orientation = input<"vertical" | "horizontal" | null>(null);

  private readonly cards = contentChildren(
    forwardRef(() => SoneChoiceCardDirective),
    { descendants: true },
  );

  // The checked card, else the first ENABLED one — a disabled first card would
  // leave the group with no reachable Tab stop.
  readonly tabStop = computed<SoneChoiceCardDirective | undefined>(() => {
    const cards = this.cards();
    return (
      cards.find((c) => c.selected()) ??
      cards.find((c) => !c.isDisabled()) ??
      cards[0]
    );
  });

  protected onKeydown(event: KeyboardEvent): void {
    const keys = [
      "ArrowDown",
      "ArrowRight",
      "ArrowUp",
      "ArrowLeft",
      "Home",
      "End",
    ];
    if (!keys.includes(event.key)) return;
    const cards = this.cards().filter((c) => !c.isDisabled());
    if (cards.length === 0) return;
    const current = cards.findIndex((c) =>
      c.host.contains(event.target as Node),
    );
    let next: number;
    switch (event.key) {
      case "Home":
        next = 0;
        break;
      case "End":
        next = cards.length - 1;
        break;
      case "ArrowDown":
      case "ArrowRight":
        next = current < 0 ? 0 : (current + 1) % cards.length;
        break;
      default:
        next =
          current < 0
            ? cards.length - 1
            : (current - 1 + cards.length) % cards.length;
    }
    event.preventDefault();
    const target = cards[next];
    target.host.focus();
    if (!target.selected()) target.host.click();
  }
}

@Directive({
  selector: "[soneChoiceCard]",
  host: {
    class: "choice-card",
    "data-slot": "choice-card",
    "[attr.role]": "role",
    "[attr.data-state]": "selected() ? 'checked' : 'unchecked'",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-with-indicator]": "indicator() ? '' : null",
    "[attr.aria-checked]": "isRadio ? selected() : null",
    "[attr.aria-pressed]": "isRadio ? null : selected()",
    "[attr.tabindex]": "tabIndex()",
  },
})
export class SoneChoiceCardDirective {
  private readonly group = inject(SoneChoiceGroupDirective, { optional: true });
  private readonly staticRole = inject(new HostAttributeToken("role"), {
    optional: true,
  });
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly role = this.group ? "radio" : this.staticRole;
  protected readonly isRadio = this.role === "radio";

  readonly selected = input(false, { transform: booleanAttribute });
  readonly orientation = input<"vertical" | "horizontal">("vertical");

  protected readonly indicator = contentChild(
    forwardRef(() => SoneChoiceCardIndicatorDirective),
  );

  protected readonly tabIndex = computed(() => {
    if (!this.group) return null;
    return this.group.tabStop() === this ? 0 : -1;
  });

  // Read from the DOM at event time on purpose: owners bind the native `[disabled]`
  // (or a disabled `<fieldset>` wraps the set); an `input()` named `disabled` here
  // would swallow that binding.
  isDisabled(): boolean {
    return (
      this.host.matches(":disabled") ||
      this.host.getAttribute("aria-disabled") === "true"
    );
  }
}

@Directive({
  selector: "[soneChoiceCardTitle]",
  host: { class: "choice-card-title", "data-slot": "choice-card-title" },
})
export class SoneChoiceCardTitleDirective {}

@Directive({
  selector: "[soneChoiceCardDescription]",
  host: {
    class: "choice-card-description",
    "data-slot": "choice-card-description",
  },
})
export class SoneChoiceCardDescriptionDirective {}

@Directive({
  selector: "[soneChoiceCardIndicator]",
  host: {
    class: "choice-card-indicator",
    "data-slot": "choice-card-indicator",
    "aria-hidden": "true",
  },
})
export class SoneChoiceCardIndicatorDirective {}

export const SONE_CHOICE_CARD_PARTS = [
  SoneChoiceGroupDirective,
  SoneChoiceCardDirective,
  SoneChoiceCardTitleDirective,
  SoneChoiceCardDescriptionDirective,
  SoneChoiceCardIndicatorDirective,
] as const;
