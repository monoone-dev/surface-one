import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";

import {
  listNavigationIndex,
  normalizeSearchText,
} from "@surface-one/angular/core";

let nextCommandId = 0;

/** Decides whether an item matches the search; `keywords` are the item's extra search terms. */
export type SoneCommandFilter = (
  value: string,
  search: string,
  keywords: readonly string[],
) => boolean;

/**
 * The built-in filter: every word of the search must appear (case- and
 * accent-insensitively) in the item's value or one of its keywords.
 */
export const soneCommandFilter: SoneCommandFilter = (
  value,
  search,
  keywords,
) => {
  const words = normalizeSearchText(search).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeSearchText([value, ...keywords].join(" "));
  return words.every((word) => haystack.includes(word));
};

/**
 * `<sone-command>` — a filterable command list (shadcn/ui Command, spartan/ui
 * brn-command): a combobox input over a listbox. The input keeps focus; the
 * highlighted option is announced through `aria-activedescendant`. Arrow keys,
 * Home / End and PageUp / PageDown move the highlight, Enter selects it.
 *
 * Filtering is built in (case- and accent-insensitive, item `value` + `keywords`);
 * set `shouldFilter` to `false` when the list already comes filtered from a server.
 */
@Component({
  selector: "sone-command",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "command",
    "data-slot": "command",
    "(keydown)": "handleKeydown($event)",
  },
  template: "<ng-content />",
})
export class SoneCommandComponent {
  /** The search text — `[(search)]`; the `soneCommandInput` writes it. */
  readonly search = model("");
  /** Filter the items by `search`. Turn off for server-side search. */
  readonly shouldFilter = input(true, { transform: booleanAttribute });
  /** A custom match function (default `soneCommandFilter`). */
  readonly filter = input<SoneCommandFilter>(soneCommandFilter);
  /** Arrow keys wrap from the last option to the first. */
  readonly loop = input(false, { transform: booleanAttribute });
  /** The highlighted option's value — `[(active)]`. */
  readonly active = model<string | null>(null);

  private readonly items = signal<readonly SoneCommandItemDirective[]>([]);
  private readonly list = signal<SoneCommandListDirective | null>(null);
  /** @internal The listbox id (for the input's `aria-controls`). */
  readonly listId = computed(() => this.list()?.id() ?? null);

  /** The options that match the search, in document order. */
  readonly visibleItems = computed(() => {
    const items = this.items().filter((item) => this.matches(item));
    return [...items].sort((a, b) =>
      a.element.compareDocumentPosition(b.element) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );
  });

  /** The option the highlight is on: the `active` one while it is visible and enabled, else the first enabled one. */
  readonly activeItem = computed(() => {
    const visible = this.visibleItems().filter((item) => !item.disabled());
    const value = this.active();
    return (
      visible.find((item) => item.itemValue() === value) ?? visible[0] ?? null
    );
  });

  /** @internal */
  register(item: SoneCommandItemDirective): () => void {
    this.items.update((items) => [...items, item]);
    return () => this.items.update((items) => items.filter((i) => i !== item));
  }

  /** @internal */
  registerList(list: SoneCommandListDirective): () => void {
    this.list.set(list);
    return () => {
      if (this.list() === list) this.list.set(null);
    };
  }

  /** @internal Whether `item` passes the search. */
  matches(item: SoneCommandItemDirective): boolean {
    if (!this.shouldFilter()) return true;
    const search = this.search();
    if (!search.trim()) return true;
    return this.filter()(item.itemValue(), search, item.keywords());
  }

  /**
   * The command's keyboard handling. It listens on its own host; call it from an
   * input that lives elsewhere (a textarea driving a slash menu) to forward keys.
   */
  handleKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.isComposing) return;
    const enabled = this.visibleItems().filter((item) => !item.disabled());
    if (event.key === "Enter") {
      const item = this.activeItem();
      if (item) {
        event.preventDefault();
        item.choose();
      }
      return;
    }
    const current = enabled.indexOf(this.activeItem()!);
    const next = listNavigationIndex(event.key, current, enabled.length, {
      wrap: this.loop(),
    });
    if (next === null) return;
    event.preventDefault();
    const item = enabled[next];
    this.active.set(item.itemValue());
    item.element.scrollIntoView?.({ block: "nearest" });
  }
}

/** `input[soneCommandInput]` — the combobox that searches the command list and keeps focus. */
@Directive({
  selector: "input[soneCommandInput]",
  host: {
    class: "command-input",
    "data-slot": "command-input",
    role: "combobox",
    type: "text",
    autocomplete: "off",
    autocorrect: "off",
    spellcheck: "false",
    "aria-autocomplete": "list",
    "aria-expanded": "true",
    "[attr.aria-controls]": "command.listId()",
    "[attr.aria-activedescendant]": "command.activeItem()?.id() ?? null",
    "[value]": "command.search()",
    "(input)": "onInput($event)",
  },
})
export class SoneCommandInputDirective {
  protected readonly command = inject(SoneCommandComponent);

  protected onInput(event: Event): void {
    this.command.search.set((event.target as HTMLInputElement).value);
    // A new search starts from the first match.
    this.command.active.set(null);
  }
}

/** `[soneCommandList]` — the listbox; it scrolls when the options overflow. */
@Directive({
  selector: "[soneCommandList]",
  host: {
    class: "command-list",
    "data-slot": "command-list",
    role: "listbox",
    "[attr.id]": "id()",
  },
})
export class SoneCommandListDirective {
  readonly id = input(`sone-command-list-${++nextCommandId}`);

  constructor() {
    inject(DestroyRef).onDestroy(
      inject(SoneCommandComponent).registerList(this),
    );
  }
}

/** `[soneCommandGroup]` — a labelled group of options; it hides when none of them match. */
@Component({
  selector: "[soneCommandGroup]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "command-group",
    "data-slot": "command-group",
    role: "group",
    "[attr.aria-labelledby]": "heading() ? headingId : null",
    "[attr.hidden]": "hasVisible() ? null : ''",
  },
  template: `@if (heading(); as text) {
      <div
        class="command-group-heading"
        data-slot="command-group-heading"
        [id]="headingId"
        aria-hidden="true"
      >
        {{ text }}
      </div>
    }
    <ng-content />`,
})
export class SoneCommandGroupComponent {
  readonly heading = input<string | null>(null);
  protected readonly headingId = `sone-command-group-${++nextCommandId}`;
  private readonly command = inject(SoneCommandComponent);
  private readonly items = signal<readonly SoneCommandItemDirective[]>([]);
  protected readonly hasVisible = computed(() =>
    this.items().some((item) => this.command.matches(item)),
  );

  /** @internal */
  register(item: SoneCommandItemDirective): () => void {
    this.items.update((items) => [...items, item]);
    return () => this.items.update((items) => items.filter((i) => i !== item));
  }
}

/**
 * `[soneCommandItem]` — one option. `value` is what the search matches (default:
 * the text content) and what `select` emits; `keywords` match too.
 */
@Directive({
  selector: "[soneCommandItem]",
  host: {
    class: "menu-item command-item",
    "data-slot": "command-item",
    role: "option",
    "[attr.id]": "id()",
    "[attr.aria-selected]": "isActive() ? 'true' : 'false'",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "[attr.data-selected]": "isActive() ? '' : null",
    "[attr.data-disabled]": "disabled() ? '' : null",
    "[attr.hidden]": "visible() ? null : ''",
    "(click)": "choose()",
    "(pointermove)": "onPointerMove()",
    "(mousedown)": "$event.preventDefault()",
  },
})
export class SoneCommandItemDirective {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly command = inject(SoneCommandComponent);

  readonly value = input<string | null>(null);
  readonly keywords = input<readonly string[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input(`sone-command-item-${++nextCommandId}`);
  /** Chosen with a click or Enter; emits the item's value. */
  readonly select = output<string>();

  /**
   * The value used for matching and emitted on select: `value`, else the text
   * content. Read fresh each time — the text is not a signal, and a memoized read
   * taken before the first render would stay empty.
   */
  itemValue(): string {
    return this.value() ?? (this.element.textContent ?? "").trim();
  }

  protected readonly visible = computed(() => this.command.matches(this));
  protected readonly isActive = computed(
    () => this.command.activeItem() === this,
  );

  constructor() {
    const unregister = this.command.register(this);
    const group = inject(SoneCommandGroupComponent, { optional: true });
    const leaveGroup = group?.register(this);
    inject(DestroyRef).onDestroy(() => {
      unregister();
      leaveGroup?.();
    });
  }

  /** Selects this option (as a click or Enter does). */
  choose(): void {
    if (this.disabled()) return;
    this.command.active.set(this.itemValue());
    this.select.emit(this.itemValue());
  }

  protected onPointerMove(): void {
    if (!this.disabled() && !this.isActive()) {
      this.command.active.set(this.itemValue());
    }
  }
}

/** `[soneCommandEmpty]` — shown only when no option matches. */
@Directive({
  selector: "[soneCommandEmpty]",
  host: {
    class: "command-empty",
    "data-slot": "command-empty",
    role: "presentation",
    "[attr.hidden]": "command.visibleItems().length === 0 ? null : ''",
  },
})
export class SoneCommandEmptyDirective {
  protected readonly command = inject(SoneCommandComponent);
}

/** `[soneCommandSeparator]` — a divider between groups; hidden while searching. */
@Directive({
  selector: "[soneCommandSeparator]",
  host: {
    class: "command-separator",
    "data-slot": "command-separator",
    role: "presentation",
    "aria-hidden": "true",
    "[attr.hidden]": "command.search().trim() ? '' : null",
  },
})
export class SoneCommandSeparatorDirective {
  protected readonly command = inject(SoneCommandComponent);
}

export const SONE_COMMAND_PARTS = [
  SoneCommandComponent,
  SoneCommandInputDirective,
  SoneCommandListDirective,
  SoneCommandGroupComponent,
  SoneCommandItemDirective,
  SoneCommandEmptyDirective,
  SoneCommandSeparatorDirective,
] as const;
