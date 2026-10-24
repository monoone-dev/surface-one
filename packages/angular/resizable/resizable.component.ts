import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
  untracked,
} from "@angular/core";
import { soneId } from "@surface-one/angular/core";

import {
  createResizable,
  resizableInitialSizes,
  resizableParse,
  resizableStorageKey,
  type ResizableDirection,
  type ResizablePanelLimits,
  type ResizableStorage,
} from "./resizable-layout";

const numberOrNull = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : Number(v);

/** Keeps document order (a panel added before another by `@if`), once in the page. */
function inOrder<T extends { readonly element: HTMLElement }>(
  list: readonly T[],
): T[] {
  const next = [...list];
  if (next.every((i) => i.element.isConnected))
    next.sort((a, b) =>
      a.element.compareDocumentPosition(b.element) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );
  return next;
}

/**
 * `sone-resizable-group` — resizable panels (shadcn/ui Resizable, spartan/ui Resizable):
 * `sone-resizable-panel`s side by side (`direction="horizontal"`) or stacked
 * (`vertical`), with a `sone-resizable-handle` between each pair. Sizes are percentages
 * of the group, two-way as `[(sizes)]` (one per panel); each panel's `defaultSize`,
 * `minSize`, `maxSize` and `collapsible` set the rest. A handle is a WAI-ARIA window
 * splitter: drag it, or focus it and use the arrow keys, Home / End and Enter (collapse
 * or restore a collapsible panel). Give `autoSaveId` and a `storage` (`localStorage`,
 * or your own `getItem` / `setItem`) to keep the sizes between visits; the library never
 * touches storage by itself.
 */
@Component({
  selector: "sone-resizable-group",
  exportAs: "soneResizableGroup",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "resizable-group",
    "data-slot": "resizable-group",
    "[attr.data-direction]": "direction()",
    "[attr.data-dragging]": "dragging() === null ? null : ''",
  },
  template: `<ng-content />`,
})
export class SoneResizableGroupComponent {
  readonly direction = input<ResizableDirection>("horizontal");
  /** The panels' sizes in percent, two-way: `[(sizes)]`. Empty: their defaults. */
  readonly sizes = model<readonly number[]>([]);
  /** Keep the sizes in `storage` under this id. */
  readonly autoSaveId = input<string | null>(null);
  /** Where `autoSaveId` keeps them — pass `localStorage`, or your own. */
  readonly storage = input<ResizableStorage | null>(null);

  /** @internal */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** @internal */
  readonly panels = signal<readonly SoneResizablePanelComponent[]>([]);
  /** @internal */
  readonly handles = signal<readonly SoneResizableHandleComponent[]>([]);
  /** @internal The handle being dragged. */
  readonly dragging = signal<number | null>(null);

  private readonly limits = computed(() =>
    this.panels().map((p) => p.limits()),
  );
  /** @internal The sizes in effect: bound or stored, else the panels' defaults. */
  readonly layout = computed(() => {
    const sizes = this.sizes();
    const limits = this.limits();
    return sizes.length === limits.length
      ? sizes
      : resizableInitialSizes(limits);
  });

  /** @internal */
  readonly resizable = createResizable({
    direction: () => this.direction(),
    panels: () => this.limits(),
    sizes: () => this.layout(),
    group: () => this.element,
    setSizes: (next, done) => {
      this.sizes.set(next);
      const id = this.autoSaveId();
      const storage = this.storage();
      if (done && id && storage)
        storage.setItem(resizableStorageKey(id), JSON.stringify(next));
    },
    dragging: (index) => this.dragging.set(index),
  });

  constructor() {
    afterNextRender(() => {
      const id = this.autoSaveId();
      const storage = this.storage();
      if (!id || !storage) return;
      const stored = resizableParse(
        storage.getItem(resizableStorageKey(id)),
        untracked(this.panels).length,
      );
      if (stored) this.sizes.set(stored);
    });
  }

  /** @internal */
  registerPanel(panel: SoneResizablePanelComponent): () => void {
    this.panels.update((list) => inOrder([...list, panel]));
    return () => this.panels.update((list) => list.filter((p) => p !== panel));
  }

  /** @internal */
  registerHandle(handle: SoneResizableHandleComponent): () => void {
    this.handles.update((list) => inOrder([...list, handle]));
    return () =>
      this.handles.update((list) => list.filter((h) => h !== handle));
  }
}

/** `sone-resizable-panel` — one panel; its size is a percentage of the group. */
@Component({
  selector: "sone-resizable-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "resizable-panel",
    "data-slot": "resizable-panel",
    "[id]": "panelId",
    "[style.flex]": "flex()",
    "[attr.data-size]": "size()",
    "[attr.data-collapsed]": "collapsed() ? '' : null",
  },
  template: `<ng-content />`,
})
export class SoneResizablePanelComponent {
  /** Its size before any is bound or stored (percent); left out, it shares the rest. */
  readonly defaultSize = input(null, { transform: numberOrNull });
  readonly minSize = input(0, { transform: Number });
  readonly maxSize = input(100, { transform: Number });
  /** It collapses to `collapsedSize` when dragged well past `minSize`, or on Enter. */
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly collapsedSize = input(0, { transform: Number });
  readonly id = input<string | null>(null);

  private readonly group = inject(SoneResizableGroupComponent);
  /** @internal */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly fallbackId = soneId("sone-resizable-panel");
  /** @internal */
  get panelId(): string {
    return this.id() ?? this.fallbackId;
  }
  /** @internal */
  readonly limits = computed<ResizablePanelLimits>(() => ({
    defaultSize: this.defaultSize(),
    minSize: this.minSize(),
    maxSize: this.maxSize(),
    collapsible: this.collapsible(),
    collapsedSize: this.collapsedSize(),
  }));
  private readonly index = computed(() => this.group.panels().indexOf(this));
  /** @internal */
  readonly size = computed(() => this.group.layout()[this.index()] ?? null);
  protected readonly flex = computed(() => {
    const size = this.size();
    return size === null ? null : `${size} 1 0px`;
  });
  protected readonly collapsed = computed(() => {
    const size = this.size();
    return (
      this.collapsible() &&
      size !== null &&
      size <= this.collapsedSize() &&
      size < this.minSize()
    );
  });

  constructor() {
    inject(DestroyRef).onDestroy(this.group.registerPanel(this));
  }
}

/**
 * `sone-resizable-handle` — the window splitter between two panels (`role="separator"`,
 * its value the size of the panel before it). `withHandle` draws a grip.
 */
@Component({
  selector: "sone-resizable-handle",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "resizable-handle",
    "data-slot": "resizable-handle",
    role: "separator",
    "[attr.tabindex]": "disabled() ? null : 0",
    "[attr.aria-label]": "label()",
    "[attr.aria-orientation]":
      "group.direction() === 'horizontal' ? 'vertical' : 'horizontal'",
    "[attr.aria-valuenow]": "valueNow()",
    "[attr.aria-valuemin]": "before()?.minSize() ?? 0",
    "[attr.aria-valuemax]": "before()?.maxSize() ?? 100",
    "[attr.aria-controls]": "before()?.panelId ?? null",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "[attr.data-direction]": "group.direction()",
    "[attr.data-dragging]": "group.dragging() === index() ? '' : null",
    "(keydown)": "onKeydown($event)",
    "(pointerdown)": "onPointerDown($event)",
  },
  template: `
    @if (withHandle()) {
      <div class="resizable-grip" data-slot="resizable-grip"></div>
    }
  `,
})
export class SoneResizableHandleComponent {
  /** Draw a grip on the handle. */
  readonly withHandle = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input(
    $localize`:Names the splitter between two resizable panels:Resize panels`,
  );

  protected readonly group = inject(SoneResizableGroupComponent);
  /** @internal */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly index = computed(() => this.group.handles().indexOf(this));
  protected readonly before = computed(
    () => this.group.panels()[this.index()] ?? null,
  );
  protected readonly valueNow = computed(() => {
    const size = this.before()?.size();
    return size === null || size === undefined ? null : Math.round(size);
  });

  constructor() {
    inject(DestroyRef).onDestroy(this.group.registerHandle(this));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    this.group.resizable.keyDown(this.index(), event);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled()) return;
    this.group.resizable.pointerDown(this.index(), event, this.element);
  }
}

export const SONE_RESIZABLE_PARTS = [
  SoneResizableGroupComponent,
  SoneResizablePanelComponent,
  SoneResizableHandleComponent,
] as const;
