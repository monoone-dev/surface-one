import { LocationStrategy, NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";
import { DomSanitizer } from "@angular/platform-browser";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import { CodeBlockComponent } from "../../shared/code-block.component";
import {
  FRAMEWORKS,
  FrameworkService,
  type Framework,
} from "../../shared/framework.service";
import { SITE } from "../../site.config";
import type { TemplateFrameMessage } from "./template-embed.page";
import {
  TEMPLATE_SLUGS,
  type LoadedTemplate,
  type TemplateSlug,
} from "../../templates/registry";

type Device = "desktop" | "tablet" | "phone";

/** Tablet and phone render in an iframe, so the template's own media queries apply. */
const DEVICES: readonly { id: Device; width: number | null; icon: string }[] = [
  {
    id: "desktop",
    width: null,
    icon: "M3 4.5h18v11.5H3zM8 20h8M12 16v4",
  },
  {
    id: "tablet",
    width: 768,
    icon: "M5.5 2.5h13a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1zM11 18.5h2",
  },
  {
    id: "phone",
    width: 375,
    icon: "M8 2.5h8a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5zM11 18.5h2",
  },
];

@Component({
  selector: "docs-template-page",
  imports: [
    NgComponentOutlet,
    RouterLink,
    SoneButtonDirective,
    SoneSelectComponent,
    SoneTooltipDirective,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (copy(); as c) {
        <nav class="breadcrumb" [attr.aria-label]="i18n.m().a11y.breadcrumb">
          <ol>
            <li>
              <a [routerLink]="i18n.link('/templates')">{{
                i18n.m().templates.title
              }}</a>
            </li>
            <li aria-current="page">{{ c.title }}</li>
          </ol>
        </nav>
        <h1 class="page-title">{{ c.title }}</h1>
        <p class="page-lead">{{ c.description }}</p>
        <div class="template-actions">
          <a
            soneBtn
            variant="outline"
            size="sm"
            [routerLink]="i18n.link('/templates')"
            >← {{ i18n.m().templates.back }}</a
          >
          <a
            soneBtn
            variant="ghost"
            size="sm"
            [href]="source()"
            target="_blank"
            rel="noopener"
          >
            {{ i18n.m().components.page.viewSource
            }}<span class="sr-only"> {{ i18n.m().a11y.externalLink }}</span>
          </a>
        </div>
        @if (template(); as t) {
          <div class="usage-bar">
            <div class="bar-start">
              <div class="tabs" role="tablist" [attr.aria-label]="c.title">
                <button
                  type="button"
                  role="tab"
                  id="tab-preview"
                  aria-controls="panel-preview"
                  [attr.aria-selected]="tab() === 'preview'"
                  [attr.tabindex]="tab() === 'preview' ? 0 : -1"
                  (click)="tab.set('preview')"
                  (keydown.arrowRight)="
                    tab.set('code');
                    $any($event.target).nextElementSibling?.focus()
                  "
                >
                  {{ i18n.m().components.page.preview }}
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-code"
                  aria-controls="panel-code"
                  [attr.aria-selected]="tab() === 'code'"
                  [attr.tabindex]="tab() === 'code' ? 0 : -1"
                  (click)="tab.set('code')"
                  (keydown.arrowLeft)="
                    tab.set('preview');
                    $any($event.target).previousElementSibling?.focus()
                  "
                >
                  {{ i18n.m().components.page.code }}
                </button>
              </div>
              @if (tab() === "preview") {
                <div
                  class="devices"
                  role="group"
                  [attr.aria-label]="i18n.m().templates.viewport"
                >
                  @for (d of devices; track d.id) {
                    <button
                      soneBtn
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      class="needs-js"
                      [attr.aria-label]="i18n.m().templates.devices[d.id]"
                      [attr.aria-pressed]="device() === d.id"
                      [soneTooltip]="
                        i18n.m().templates.devices[d.id] +
                        (d.width ? ' · ' + d.width + 'px' : '')
                      "
                      (click)="device.set(d.id)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path [attr.d]="d.icon" />
                      </svg>
                    </button>
                  }
                </div>
              }
            </div>
            <sone-select
              class="framework-select"
              size="sm"
              selectId="framework"
              [ariaLabel]="i18n.m().components.page.framework"
              [value]="framework()"
              (selectionChange)="setFramework($event)"
            >
              @for (f of frameworkOptions; track f.value) {
                <option [value]="f.value">{{ f.label }}</option>
              }
            </sone-select>
          </div>
          <section
            id="panel-preview"
            role="tabpanel"
            aria-labelledby="tab-preview"
            [class.template-frame]="!frameWidth()"
            [class.template-stage]="!!frameWidth()"
            [hidden]="tab() !== 'preview'"
          >
            @if (frameWidth(); as w) {
              <iframe
                class="device-frame"
                [title]="i18n.m().a11y.preview + ': ' + c.title"
                [src]="embedUrl()"
                [style.width.px]="w"
                [style.height.px]="frameHeight()"
              ></iframe>
            } @else {
              <ng-container *ngComponentOutlet="t.component" />
            }
          </section>
          <div
            id="panel-code"
            role="tabpanel"
            aria-labelledby="tab-code"
            [hidden]="tab() !== 'code'"
          >
            @if (framework() === "angular") {
              <docs-code [code]="t.angular" lang="ts" />
            } @else if (t.vue; as v) {
              <!-- Bound, not a static attribute: lang="vue" would be an invalid HTML lang. -->
              <docs-code [code]="v" [lang]="'vue'" />
            } @else {
              <p class="framework-note" role="note">
                {{ i18n.m().templates.vueMissing }}
              </p>
            }
          </div>
        }
      }
    </div>
  `,
  styles: `
    .template-actions {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }
    .usage-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2) var(--space-3);
      margin-bottom: var(--space-3);
    }
    .bar-start {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }
    .devices {
      display: inline-flex;
      gap: 2px;
    }
    .devices svg {
      width: 1rem;
      height: 1rem;
    }
    .devices [aria-pressed="true"] {
      background: var(--surface-hover);
      color: var(--text-primary);
    }
    .tabs {
      display: inline-flex;
      gap: 2px;
      padding: 3px;
      border-radius: var(--radius-control);
      background: var(--surface-hover);
    }
    .tabs button {
      padding: 4px var(--space-3);
      border: 0;
      border-radius: calc(var(--radius-control) - 2px);
      background: transparent;
      color: var(--text-secondary);
      font: inherit;
      font-size: var(--font-size-sm);
      cursor: pointer;
    }
    .tabs button[aria-selected="true"] {
      background: var(--surface-raised);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }
    .framework-select {
      min-width: 0;
      max-width: 100%;
    }
    .framework-note {
      margin: var(--space-3) 0;
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface-raised);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .template-frame {
      /* Its own stacking context, like .demo-frame: the templates' sidebars and the
         docked editor toolbar sit on --z-sticky and must stay under the site header. */
      isolation: isolate;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface-base);
      box-shadow: var(--shadow-md);
    }
    .template-stage {
      display: flex;
      justify-content: center;
      padding: var(--space-6) var(--space-4);
      overflow-x: auto;
      border: 1px dashed var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface-hover);
    }
    .device-frame {
      display: block;
      flex: none;
      max-width: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface-base);
      box-shadow: var(--shadow-md);
      transition: width var(--transition);
    }
    @media (prefers-reduced-motion: reduce) {
      .device-frame {
        transition: none;
      }
    }
    /* [hidden] must win over the frame's display. */
    [hidden] {
      display: none !important;
    }
  `,
})
export default class TemplatePage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  private readonly frameworks = inject(FrameworkService);
  private readonly destroyRef = inject(DestroyRef);
  readonly slug = input.required<string>();
  readonly template = input<LoadedTemplate | null>(null);

  private readonly location = inject(LocationStrategy);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly tab = signal<"preview" | "code">("preview");
  protected readonly devices = DEVICES;
  protected readonly device = signal<Device>("desktop");
  protected readonly frameHeight = signal(720);
  protected readonly frameWidth = computed(
    () => DEVICES.find((d) => d.id === this.device())?.width ?? null,
  );
  /** Always English: the embed is only prerendered once per template. */
  protected readonly embedUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      this.location.prepareExternalUrl(`/templates/${this.slug()}/embed`),
    ),
  );
  protected readonly frameworkOptions = FRAMEWORKS;
  protected readonly framework = this.frameworks.framework;

  protected readonly copy = computed(() =>
    (TEMPLATE_SLUGS as readonly string[]).includes(this.slug())
      ? this.i18n.m().templates.items[this.slug() as TemplateSlug]
      : null,
  );
  protected readonly source = computed(() =>
    this.framework() === "vue" && this.template()?.vue
      ? `${SITE.repository}/blob/main/apps/docs/src/app/templates/vue/${this.slug()}.vue`
      : `${SITE.repository}/blob/main/apps/docs/src/app/templates/${this.slug()}.template.ts`,
  );

  constructor() {
    // After hydration, so the prerendered (Angular) markup and the first client render agree.
    afterNextRender(() => this.frameworks.restore());
    effect(() => {
      const m = this.i18n.m();
      const c = this.copy();
      if (!c) return;
      this.seo.set({
        title: `${c.title} — ${m.templates.title}`,
        description: c.description,
        path: `/templates/${this.slug()}`,
        breadcrumbs: [
          { name: m.nav.home, path: "/" },
          { name: m.templates.title, path: "/templates" },
          { name: c.title, path: `/templates/${this.slug()}` },
        ],
      });
    });
    effect(() => {
      this.slug();
      this.tab.set("preview");
      this.device.set("desktop");
    });
    // The framed embed reports its content height, so the iframe never scrolls inside.
    afterNextRender(() => {
      const onMessage = (event: MessageEvent<TemplateFrameMessage>) => {
        if (event.origin !== location.origin) return;
        const data = event.data;
        if (data?.type !== "sone-template-height" || data.slug !== this.slug())
          return;
        this.frameHeight.set(Math.max(320, data.height));
      };
      window.addEventListener("message", onMessage);
      this.destroyRef.onDestroy(() =>
        window.removeEventListener("message", onMessage),
      );
    });
  }

  protected setFramework(value: string): void {
    if (value === "angular" || value === "vue") {
      this.frameworks.set(value satisfies Framework);
    }
  }
}
