import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  computed,
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
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";

import {
  SonePageFeatureComponent,
  SonePageFeaturesComponent,
} from "./page-feature.component";
import {
  pageFeatureLevel,
  type PageFeatureItem,
  type PageSectionOrientation,
} from "./page-feature-item";

/**
 * `<sone-page-section>` — a section of a landing page (Nuxt UI PageSection): an icon, a
 * headline, the title as a real heading (`level`, default 2), a description, a grid of
 * `features` (their headings one level deeper) and call-to-action `links`, with the
 * projected content as media or body. `vertical` (the default) stacks and centres the
 * header; `horizontal` puts the copy beside the media once the block is wide enough,
 * `reverse` swaps the sides. It is a `section` named by its title.
 */
@Component({
  selector: "sone-page-section",
  imports: [SoneButtonDirective, SoneIconComponent, SonePageFeaturesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./page-section.component.html",
  styleUrl: "./page-section.component.scss",
  host: {
    "data-slot": "page-section",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-reverse]": "reverse() ? '' : null",
    "[attr.title]": "null",
  },
})
export class SonePageSectionComponent {
  readonly title = input<string | null>(null);
  /** A short line above the title. */
  readonly headline = input<string | null>(null);
  readonly description = input<string | null>(null);
  /** A SurfaceOne glyph in a tile above the headline. */
  readonly icon = input<ShellIcon | null>(null);
  /** Calls to action, drawn as buttons (the first `default`, the rest `outline`). */
  readonly links = input<readonly PageLink[]>([]);
  /** The features grid under the copy. */
  readonly features = input<readonly PageFeatureItem[]>([]);
  readonly orientation = input<PageSectionOrientation>("vertical");
  /** Puts the media first (horizontal). */
  readonly reverse = input(false, { transform: booleanAttribute });
  /** The title's heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(2, {
    transform: (v: unknown) => toHeadingLevel(v, 2),
  });

  protected readonly titleId = `${soneId("sone-page-section")}-title`;
  protected readonly featureLevel = computed(() =>
    pageFeatureLevel(this.level()),
  );
  protected readonly variant = pageLinkVariant;
  protected readonly rel = pageLinkRel;
}

/** `[sonePageSectionLinks]` — your own actions after the section's links. */
@Directive({
  selector: "[sonePageSectionLinks]",
  host: { "data-slot": "page-section-actions" },
})
export class SonePageSectionLinksDirective {}

export const SONE_PAGE_SECTION_PARTS = [
  SonePageSectionComponent,
  SonePageSectionLinksDirective,
  SonePageFeaturesComponent,
  SonePageFeatureComponent,
] as const;
