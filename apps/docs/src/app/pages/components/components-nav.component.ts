import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { CATEGORIES, entriesIn } from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";

/** The left rail of the component pages: every category and its entries. */
@Component({
  selector: "docs-components-nav",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "section-nav" },
  template: `
    <nav [attr.aria-label]="i18n.m().nav.components">
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
    </nav>
  `,
})
export class ComponentsNavComponent {
  protected readonly i18n = inject(I18n);
  protected readonly categories = CATEGORIES;
  protected readonly entriesIn = entriesIn;
  readonly active = input<string>("");
}
