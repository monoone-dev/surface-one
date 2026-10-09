import { DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { I18n } from "./i18n/i18n.service";
import { FooterComponent } from "./layout/footer.component";
import { HeaderComponent } from "./layout/header.component";
import { ThemeService } from "./theme/theme.service";

@Component({
  selector: "docs-root",
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (embed) {
      <!-- /templates/<slug>/embed: a template alone, framed by the template page. -->
      <main id="main"><router-outlet /></main>
    } @else {
      <a class="skip-link" href="#main">{{ i18n.m().a11y.skipToContent }}</a>
      <docs-header />
      <main id="main" tabindex="-1">
        <router-outlet />
      </main>
      <docs-footer />
    }
  `,
})
export class App {
  protected readonly i18n = inject(I18n);
  // Instantiated at boot so the stored appearance is restored on every page.
  private readonly theme = inject(ThemeService);
  /** Decided once from the loaded URL: the embed is only ever opened by an iframe. */
  protected readonly embed = /\/templates\/[a-z-]+\/embed\/?$/.test(
    inject(DOCUMENT).location?.pathname ?? "",
  );
}
