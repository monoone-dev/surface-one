import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  untracked,
} from "@angular/core";

import {
  type ButtonSize,
  type ButtonVariant,
} from "@surface-one/angular/button";
import { soneId } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  createCarousel,
  type CarouselOrientation,
} from "./carousel-controller";

/**
 * `sone-carousel` — a carousel (WAI-ARIA carousel pattern; shadcn/ui and spartan/ui
 * Carousel) with no dependency: the slides (`soneCarouselItem`) sit in a CSS scroll-snap
 * track (`soneCarouselContent`), so swiping, the trackpad and the wheel are the
 * browser's own. `soneCarouselPrevious` / `soneCarouselNext` and `sone-carousel-dots`
 * step it, ArrowLeft / ArrowRight (ArrowUp / ArrowDown when `vertical`) step it while
 * focus is inside, and `[(index)]` is the current slide. `loop` wraps at the ends. It is
 * a `region` with `aria-roledescription="carousel"` (name it with `aria-label`), each
 * slide a `group` named "N of M". Nothing moves on its own unless `autoplay` (ms) is set:
 * then it advances, holds while the pointer rests on it or focus is inside, starts
 * stopped under reduced motion, and shows a rotation control to stop and restart it.
 */
@Component({
  selector: "sone-carousel",
  exportAs: "soneCarousel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent],
  host: {
    class: "carousel",
    "data-slot": "carousel",
    role: "region",
    "[attr.aria-roledescription]": "roleDescription()",
    "[attr.data-orientation]": "orientation()",
    "(keydown)": "onKeydown($event)",
    "(pointerenter)": "onPointer($event, true)",
    "(pointerleave)": "onPointer($event, false)",
    "(focusin)": "onFocusIn($event)",
    "(focusout)": "onFocusOut($event)",
  },
  template: `
    @if (autoplay() > 0) {
      <button
        type="button"
        class="btn carousel-rotation"
        data-slot="carousel-rotation"
        data-variant="outline"
        data-size="icon-sm"
        [attr.aria-label]="stopped() ? startLabel() : stopLabel()"
        [attr.aria-controls]="trackId"
        (click)="carousel.toggleRotation()"
      >
        <sone-icon [icon]="stopped() ? 'play' : 'pause'" />
      </button>
    }
    <ng-content />
  `,
})
export class SoneCarouselComponent {
  /** The current slide, two-way: `[(index)]`. */
  readonly index = model(0);
  readonly orientation = input<CarouselOrientation>("horizontal");
  /** Wrap from the last slide to the first and back. */
  readonly loop = input(false, { transform: booleanAttribute });
  /** ms between automatic steps; 0 (the default) never moves on its own. */
  readonly autoplay = input(0, { transform: numberAttribute });
  readonly roleDescription = input(
    $localize`:Role description of a carousel region:carousel`,
  );
  readonly slideRoleDescription = input(
    $localize`:Role description of one slide of a carousel:slide`,
  );
  readonly stopLabel = input(
    $localize`:Stops a carousel's automatic rotation:Stop automatic slide show`,
  );
  readonly startLabel = input(
    $localize`:Starts a carousel's automatic rotation:Start automatic slide show`,
  );

  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** @internal */
  readonly trackId = `${soneId("sone-carousel")}-content`;
  /** @internal The slides, in order. */
  readonly items = signal<readonly SoneCarouselItemDirective[]>([]);
  /** @internal Set by `soneCarouselContent`. */
  readonly track = signal<HTMLElement | null>(null);
  private readonly version = signal(0);

  /** @internal */
  readonly carousel = createCarousel({
    index: () => this.index(),
    setIndex: (i) => this.index.set(i),
    count: () => this.items().length,
    loop: () => this.loop(),
    orientation: () => this.orientation(),
    autoplay: () => this.autoplay(),
    track: () => this.track(),
    slides: () => this.items().map((i) => i.element),
    changed: () => this.version.update((v) => v + 1),
  });

  /** @internal */
  readonly canPrev = computed(() => {
    this.version();
    this.index();
    this.items();
    return this.carousel.canPrev();
  });
  /** @internal */
  readonly canNext = computed(() => {
    this.version();
    this.index();
    this.items();
    return this.carousel.canNext();
  });
  /** @internal Auto-rotation is running (the slides' live region goes quiet). */
  readonly playing = computed(() => {
    this.version();
    this.autoplay();
    return this.carousel.playing();
  });
  protected readonly stopped = computed(() => {
    this.version();
    return this.carousel.stopped();
  });

  constructor() {
    const injector = inject(Injector);
    let disconnect: (() => void) | null = null;
    afterNextRender(() => (disconnect = this.carousel.connect()), {
      injector,
    });
    effect(() => {
      this.index();
      this.autoplay();
      untracked(() => this.carousel.sync());
    });
    inject(DestroyRef).onDestroy(() => disconnect?.());
  }

  /** @internal */
  register(item: SoneCarouselItemDirective): () => void {
    this.items.update((list) => {
      const next = [...list, item];
      // In the browser, keep document order (a slide added before another by `@for`).
      if (next.every((i) => i.element.isConnected))
        next.sort((a, b) =>
          a.element.compareDocumentPosition(b.element) &
          Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
        );
      return next;
    });
    return () => this.items.update((list) => list.filter((i) => i !== item));
  }

  /** Steps back one slide. */
  prev(): void {
    this.carousel.prev();
  }

  /** Steps on one slide. */
  next(): void {
    this.carousel.next();
  }

  /** Scrolls to slide `index`. */
  goTo(index: number): void {
    this.carousel.goTo(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.carousel.keyDown(event);
  }

  protected onPointer(event: PointerEvent, on: boolean): void {
    if (event.pointerType === "touch") return;
    this.carousel.hover(on);
  }

  protected onFocusIn(event: FocusEvent): void {
    // The rotation control itself does not hold the rotation it controls.
    const target = event.target as Element | null;
    this.carousel.focus(!target?.closest('[data-slot="carousel-rotation"]'));
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.element.contains(next)) this.carousel.focus(false);
  }
}

/**
 * `[soneCarouselContent]` — the scroll-snap track of the slides. It is focusable (the
 * arrow keys step the carousel from it) and a polite live region while nothing rotates.
 */
@Directive({
  selector: "[soneCarouselContent]",
  host: {
    class: "carousel-content",
    "data-slot": "carousel-content",
    tabindex: "0",
    "[id]": "carousel.trackId",
    "[attr.data-orientation]": "carousel.orientation()",
    "[attr.aria-live]": "carousel.playing() ? 'off' : 'polite'",
    "(scroll)": "carousel.carousel.scrolled()",
  },
})
export class SoneCarouselContentDirective {
  protected readonly carousel = inject(SoneCarouselComponent);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.carousel.track.set(el);
    inject(DestroyRef).onDestroy(() => {
      if (this.carousel.track() === el) this.carousel.track.set(null);
    });
  }
}

/** `[soneCarouselItem]` — one slide: a `group` with `aria-roledescription="slide"`, named "N of M". */
@Directive({
  selector: "[soneCarouselItem]",
  host: {
    class: "carousel-item",
    "data-slot": "carousel-item",
    role: "group",
    "[attr.aria-roledescription]": "carousel.slideRoleDescription()",
    "[attr.aria-label]": "label() ?? staticLabel ?? position()",
    "[attr.data-current]": "current() ? '' : null",
  },
})
export class SoneCarouselItemDirective {
  /** The slide's name (default: a static `aria-label`, else its position, "2 of 5"). */
  readonly label = input<string | null>(null);
  protected readonly staticLabel = inject(
    new HostAttributeToken("aria-label"),
    {
      optional: true,
    },
  );
  protected readonly carousel = inject(SoneCarouselComponent);
  /** @internal */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly at = computed(() => this.carousel.items().indexOf(this));
  protected readonly current = computed(
    () => this.at() === this.carousel.index(),
  );
  protected readonly position = computed(
    () =>
      $localize`:The position of a carousel slide, as in 2 of 5:${this.at() + 1}:index: of ${this.carousel.items().length}:count:`,
  );

  constructor() {
    inject(DestroyRef).onDestroy(this.carousel.register(this));
  }
}

@Directive()
abstract class SoneCarouselStepBase {
  readonly variant = input<ButtonVariant>("outline");
  readonly size = input<ButtonSize>("icon-sm");
  protected readonly carousel = inject(SoneCarouselComponent);
  protected readonly staticLabel = inject(
    new HostAttributeToken("aria-label"),
    {
      optional: true,
    },
  );
  protected readonly vertical = computed(
    () => this.carousel.orientation() === "vertical",
  );
}

/** `button[soneCarouselPrevious]` — steps back one slide; disabled on the first unless `loop`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute component on the element it styles (as spartan/ui)
  selector: "button[soneCarouselPrevious]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent],
  host: {
    class: "btn carousel-previous",
    "data-slot": "carousel-previous",
    type: "button",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.aria-label]": "staticLabel ?? label()",
    "[attr.aria-controls]": "carousel.trackId",
    "[disabled]": "!carousel.canPrev()",
    "(click)": "carousel.prev()",
  },
  template: `<sone-icon
      [icon]="vertical() ? 'chevron-up' : 'chevron-left'"
    /><ng-content />`,
})
export class SoneCarouselPreviousComponent extends SoneCarouselStepBase {
  /** The button's name, when no static `aria-label` gives one. */
  readonly label = input(
    $localize`:Shows the previous carousel slide:Previous slide`,
  );
}

/** `button[soneCarouselNext]` — steps on one slide; disabled on the last unless `loop`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute component on the element it styles (as spartan/ui)
  selector: "button[soneCarouselNext]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent],
  host: {
    class: "btn carousel-next",
    "data-slot": "carousel-next",
    type: "button",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.aria-label]": "staticLabel ?? label()",
    "[attr.aria-controls]": "carousel.trackId",
    "[disabled]": "!carousel.canNext()",
    "(click)": "carousel.next()",
  },
  template: `<sone-icon
      [icon]="vertical() ? 'chevron-down' : 'chevron-right'"
    /><ng-content />`,
})
export class SoneCarouselNextComponent extends SoneCarouselStepBase {
  /** The button's name, when no static `aria-label` gives one. */
  readonly label = input($localize`:Shows the next carousel slide:Next slide`);
}

/** `sone-carousel-dots` — one button per slide; the current one is `aria-current`. */
@Component({
  selector: "sone-carousel-dots",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "carousel-dots",
    "data-slot": "carousel-dots",
    role: "group",
    "[attr.aria-label]": "staticLabel ?? label()",
  },
  template: `
    @for (item of carousel.items(); track item; let i = $index) {
      <button
        type="button"
        class="carousel-dot"
        data-slot="carousel-dot"
        [attr.aria-label]="goTo(i + 1)"
        [attr.aria-controls]="carousel.trackId"
        [attr.aria-current]="i === carousel.index() ? 'true' : null"
        (click)="carousel.goTo(i)"
      ></button>
    }
  `,
})
export class SoneCarouselDotsComponent {
  /** The group's name, when no static `aria-label` gives one. */
  readonly label = input(
    $localize`:The group of a carousel's slide buttons:Choose slide`,
  );
  protected readonly staticLabel = inject(
    new HostAttributeToken("aria-label"),
    {
      optional: true,
    },
  );
  protected readonly carousel = inject(SoneCarouselComponent);

  protected goTo(n: number): string {
    return $localize`:Shows carousel slide N:Go to slide ${n}:index:`;
  }
}

export const SONE_CAROUSEL_PARTS = [
  SoneCarouselComponent,
  SoneCarouselContentDirective,
  SoneCarouselItemDirective,
  SoneCarouselPreviousComponent,
  SoneCarouselNextComponent,
  SoneCarouselDotsComponent,
] as const;
