import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from "@angular/core";

let nextCollapsibleId = 0;

@Directive({
  selector: "[soneCollapsible]",
  exportAs: "soneCollapsible",
  host: {
    "data-slot": "collapsible",
    "[attr.data-state]": "expanded() ? 'open' : 'closed'",
    "[attr.data-disabled]": "disabled() ? '' : null",
  },
})
export class SoneCollapsibleDirective {
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly fallbackContentId = `sone-collapsible-${nextCollapsibleId++}-content`;
  private readonly content = signal<SoneCollapsibleContentDirective | null>(
    null,
  );

  readonly contentId = computed(
    () => this.content()?.id() ?? this.fallbackContentId,
  );

  registerContent(content: SoneCollapsibleContentDirective): void {
    this.content.set(content);
  }

  toggle(): void {
    if (this.disabled()) return;
    this.expanded.update((v) => !v);
  }
}

@Directive({
  selector: "button[soneCollapsibleTrigger]",
  host: {
    class: "collapsible-trigger",
    "data-slot": "collapsible-trigger",
    "[attr.type]": "type()",
    "(click)": "root?.toggle()",
  },
})
export class SoneCollapsibleTriggerDirective {
  protected readonly root = inject(SoneCollapsibleDirective, {
    optional: true,
  });
  readonly type = input<"button" | "submit" | "reset">("button");

  constructor() {
    const root = this.root;
    if (!root) return;
    const el = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    effect(() => {
      const open = root.expanded();
      const disabled = root.disabled();
      renderer.setAttribute(el, "aria-controls", root.contentId());
      renderer.setAttribute(el, "aria-expanded", String(open));
      renderer.setAttribute(el, "data-state", open ? "open" : "closed");
      renderer.setProperty(el, "disabled", disabled);
      if (disabled) renderer.setAttribute(el, "data-disabled", "");
      else renderer.removeAttribute(el, "data-disabled");
    });
  }
}

@Directive({
  selector: "[soneCollapsibleContent]",
  host: {
    class: "collapsible-content",
    "data-slot": "collapsible-content",
    "[id]": "root.contentId()",
    "[attr.data-state]": "root.expanded() ? 'open' : 'closed'",
    "[attr.data-disabled]": "root.disabled() ? '' : null",
    "[hidden]": "!root.expanded()",
  },
})
export class SoneCollapsibleContentDirective {
  protected readonly root = inject(SoneCollapsibleDirective);
  readonly id = input<string | null | undefined>(undefined);

  constructor() {
    this.root.registerContent(this);
  }
}

@Directive({
  selector: "[soneCollapsibleIcon]",
  host: {
    class: "collapsible-icon",
    "data-slot": "collapsible-icon",
    "aria-hidden": "true",
  },
})
export class SoneCollapsibleIconDirective {}

export const SONE_COLLAPSIBLE_PARTS = [
  SoneCollapsibleDirective,
  SoneCollapsibleTriggerDirective,
  SoneCollapsibleContentDirective,
  SoneCollapsibleIconDirective,
] as const;
