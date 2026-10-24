import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { PageLink } from "@surface-one/angular/core";
import {
  SONE_PAGE_SECTION_PARTS,
  type PageFeatureItem,
} from "@surface-one/angular/page-section";

const TEMPLATE = `<sone-page-section
  headline="Features"
  title="Everything a meeting needs"
  description="From the first word to the last follow-up, without leaving the app."
  [level]="3"
  [features]="features"
  [links]="links"
/>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-page-section-demo",
  imports: [...SONE_PAGE_SECTION_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PageSectionDemo {
  readonly features: PageFeatureItem[] = [
    {
      icon: "sparkles",
      title: "Summaries",
      description: "Every meeting ends with its decisions and follow-ups.",
    },
    {
      icon: "search",
      title: "Search",
      description: "Find what was said, by whom and when.",
    },
    {
      icon: "lock",
      title: "Private",
      description: "Your notes stay on your own devices.",
    },
  ];
  readonly links: PageLink[] = [
    { label: "Explore all features", href: "#features", variant: "outline" },
  ];
}
