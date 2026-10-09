import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { SectionNavComponent } from "../../shared/section-nav.component";

import { CATEGORIES, entriesIn, entryBySlug } from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";

/** The left rail of the component pages: every category and its entries. */
@Component({
  selector: "docs-components-nav",
  imports: [RouterLink, SectionNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-section-nav
      [label]="i18n.m().nav.components"
      [current]="currentName()"
    >
      @for (c of categories; track c) {
        <h2 [id]="'nav-' + c">{{ i18n.m().components.categories[c].name }}</h2>
        <ul [attr.aria-labelledby]="'nav-' + c">
          @for (e of entriesIn(c); track e.slug) {
            <li>
              <a
                [routerLink]="i18n.link('/components/' + e.slug)"
                [attr.aria-current]="e.slug === active() ? 'page' : null"
                >{{ e.name }}</a
              >
            </li>
          }
        </ul>
      }
    </docs-section-nav>
  `,
})
export class ComponentsNavComponent {
  protected readonly i18n = inject(I18n);
  protected readonly categories = CATEGORIES;
  protected readonly entriesIn = entriesIn;
  readonly active = input<string>("");
  protected readonly currentName = computed(
    () => entryBySlug(this.active())?.name ?? "",
  );
}
