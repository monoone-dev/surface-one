import { NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import {
  TEMPLATE_SLUGS,
  type LoadedTemplate,
  type TemplateSlug,
} from "../../templates/registry";
import { ThemeService } from "../../theme/theme.service";

/** What the embed posts to the template page that frames it. */
export interface TemplateFrameMessage {
  readonly type: "sone-template-height";
  readonly slug: string;
  readonly height: number;
}

/**
 * One template alone, without the site header and footer: the template page loads it
 * in an iframe sized like a tablet or a phone, so the template's own media queries
 * apply. It reports its height to the parent so the frame grows with it, and follows
 * appearance changes made in the parent (they arrive as `storage` events).
 */
@Component({
  selector: "docs-template-embed-page",
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (template(); as t) {
      <h1 class="sr-only">{{ title() }}</h1>
      <ng-container *ngComponentOutlet="t.component" />
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: var(--surface-base);
    }
  `,
})
export default class TemplateEmbedPage {
  private readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  private readonly theme = inject(ThemeService);
  readonly slug = input.required<string>();
  readonly template = input<LoadedTemplate | null>(null);

  protected readonly title = computed(() =>
    (TEMPLATE_SLUGS as readonly string[]).includes(this.slug())
      ? this.i18n.m().templates.items[this.slug() as TemplateSlug].title
      : "",
  );

  constructor() {
    effect(() => {
      const title = this.title();
      if (!title) return;
      this.seo.set({
        title: `${title} — ${this.i18n.m().templates.title}`,
        description: title,
        path: `/templates/${this.slug()}/embed`,
        noindex: true,
      });
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const post = () => {
        if (window.parent === window) return;
        window.parent.postMessage(
          {
            type: "sone-template-height",
            slug: this.slug(),
            height: Math.ceil(document.body.scrollHeight),
          } satisfies TemplateFrameMessage,
          location.origin,
        );
      };
      const resize = new ResizeObserver(post);
      resize.observe(document.body);
      const onStorage = () => this.theme.sync();
      window.addEventListener("storage", onStorage);
      post();
      destroyRef.onDestroy(() => {
        resize.disconnect();
        window.removeEventListener("storage", onStorage);
      });
    });
  }
}
