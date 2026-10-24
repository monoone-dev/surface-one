import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { toHeadingLevel, type HeadingLevel } from "@surface-one/angular/core";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";

import type {
  PageFeatureItem,
  PageFeatureOrientation,
} from "./page-feature-item";

/**
 * `<sone-page-feature>` — one feature of a page section (Nuxt UI PageFeature): an icon in
 * a tile, the title as a heading (`level`, default 3) and a description; `href` makes the
 * whole feature a link. It is a list item of `sone-page-features`.
 */
@Component({
  selector: "sone-page-feature",
  imports: [NgTemplateOutlet, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./page-feature.component.html",
  styleUrl: "./page-feature.component.scss",
  host: {
    "data-slot": "page-feature",
    role: "listitem",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-link]": "href() ? '' : null",
    "[attr.title]": "null",
  },
})
export class SonePageFeatureComponent {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly icon = input<ShellIcon | null>(null);
  /** Makes the whole feature a link. */
  readonly href = input<string | null>(null);
  /** `vertical` puts the icon above the copy, `horizontal` beside it. */
  readonly orientation = input<PageFeatureOrientation>("vertical");
  /** The title's heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(3, {
    transform: (v: unknown) => toHeadingLevel(v, 3),
  });
}

/**
 * `<sone-page-features>` — the grid of a section's features: a list of `features`
 * (`{ icon, title, description, href }`) or projected `sone-page-feature`s, as many
 * columns as fit.
 */
@Component({
  selector: "sone-page-features",
  imports: [SonePageFeatureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (feature of features(); track $index) {
      <sone-page-feature
        [title]="feature.title"
        [description]="feature.description ?? null"
        [icon]="feature.icon ?? null"
        [href]="feature.href ?? null"
        [orientation]="orientation()"
        [level]="level()"
      />
    }
    <ng-content />
  `,
  styleUrl: "./page-features.component.scss",
  host: { "data-slot": "page-features", role: "list" },
})
export class SonePageFeaturesComponent {
  readonly features = input<readonly PageFeatureItem[]>([]);
  readonly orientation = input<PageFeatureOrientation>("vertical");
  /** The features' heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(3, {
    transform: (v: unknown) => toHeadingLevel(v, 3),
  });
}
