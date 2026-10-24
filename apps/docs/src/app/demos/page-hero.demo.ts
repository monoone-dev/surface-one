import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { PageLink } from "@surface-one/angular/core";
import { SONE_PAGE_HERO_PARTS } from "@surface-one/angular/page-hero";

const TEMPLATE = `<sone-page-hero
  headline="New: offline notes"
  title="Every meeting, written down"
  description="Record, transcribe and share the notes of every meeting — searchable, private and in your language."
  orientation="horizontal"
  [level]="3"
  [links]="links"
>
  <div
    role="img"
    aria-label="A meeting summary on a laptop"
    style="aspect-ratio: 4 / 3; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-xl); background: var(--surface-hover)"
  ></div>
</sone-page-hero>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-page-hero-demo",
  imports: [...SONE_PAGE_HERO_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PageHeroDemo {
  readonly links: PageLink[] = [
    { label: "Start for free", href: "#start", trailingIcon: "arrow-right" },
    { label: "See pricing", href: "#pricing" },
  ];
}
