import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  input,
  numberAttribute,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { SoneBadgeDirective } from "@surface-one/angular/badge";

export type SectionHeadingLevel = 2 | 3 | 4;

function toLevel(v: unknown): SectionHeadingLevel {
  const n = numberAttribute(v, 2);
  return n === 3 || n === 4 ? n : 2;
}

/**
 * `<sone-section-heading>` — the heading row of a page section: a real `h2`–`h4`
 * (`level`, default 2) with the `title`, an optional `count` in a secondary badge
 * after it, and controls in `[soneSectionHeadingActions]` at the end of the row.
 */
@Component({
  selector: "sone-section-heading",
  imports: [NgTemplateOutlet, SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./section-heading.component.html",
  styleUrl: "./section-heading.component.scss",
  host: {
    "data-slot": "section-heading",
    "[attr.data-level]": "level()",
    // `title` is an input here, not the native tooltip attribute.
    "[attr.title]": "null",
  },
})
export class SoneSectionHeadingComponent {
  readonly title = input.required<string>();
  /** A count in a secondary badge after the title; `null` hides it. */
  readonly count = input<number | string | null>(null);
  /** The heading level: 2, 3 or 4. */
  readonly level = input<SectionHeadingLevel, unknown>(2, {
    transform: toLevel,
  });
}

/** `[soneSectionHeadingActions]` — controls at the end of the heading row. */
@Directive({
  selector: "[soneSectionHeadingActions]",
  host: { "data-slot": "section-heading-actions" },
})
export class SoneSectionHeadingActionsDirective {}

export const SONE_SECTION_HEADING_PARTS = [
  SoneSectionHeadingComponent,
  SoneSectionHeadingActionsDirective,
] as const;
