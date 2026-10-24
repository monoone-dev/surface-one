import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  input,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  pageLinkRel,
  pageLinkVariant,
  soneId,
  toHeadingLevel,
  type HeadingLevel,
  type PageLink,
} from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

export type PageHeroOrientation = "vertical" | "horizontal";

/**
 * `<sone-page-hero>` — the opening block of a landing page (Nuxt UI PageHero): a
 * headline, the title as a real heading (`level`, default 1), a description and call-to-
 * action `links`, with optional media (the projected content). `vertical` (the default)
 * centres it all; `horizontal` puts the copy beside the media once the block is wide
 * enough (a container query), `reverse` swaps the sides. It is a `section` named by its
 * title. `[sonePageHeroLinks]` adds your own actions after the links.
 */
@Component({
  selector: "sone-page-hero",
  imports: [SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./page-hero.component.html",
  styleUrl: "./page-hero.component.scss",
  host: {
    "data-slot": "page-hero",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-reverse]": "reverse() ? '' : null",
    // `title` is an input here, not the native tooltip attribute.
    "[attr.title]": "null",
  },
})
export class SonePageHeroComponent {
  readonly title = input.required<string>();
  /** A short line above the title. */
  readonly headline = input<string | null>(null);
  readonly description = input<string | null>(null);
  /** Calls to action, drawn as buttons (the first `default`, the rest `outline`). */
  readonly links = input<readonly PageLink[]>([]);
  readonly orientation = input<PageHeroOrientation>("vertical");
  /** Puts the media first (horizontal). */
  readonly reverse = input(false, { transform: booleanAttribute });
  /** The title's heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(1, {
    transform: (v: unknown) => toHeadingLevel(v, 1),
  });

  protected readonly titleId = `${soneId("sone-page-hero")}-title`;
  protected readonly variant = pageLinkVariant;
  protected readonly rel = pageLinkRel;
}

/** `[sonePageHeroLinks]` — your own actions after the hero's links. */
@Directive({
  selector: "[sonePageHeroLinks]",
  host: { "data-slot": "page-hero-actions" },
})
export class SonePageHeroLinksDirective {}

export const SONE_PAGE_HERO_PARTS = [
  SonePageHeroComponent,
  SonePageHeroLinksDirective,
] as const;
