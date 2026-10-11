import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from "@angular/core";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneCopyButtonComponent } from "@surface-one/angular/copy-button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";

import {
  type Lang,
  CURRENT,
  NAV,
  SECTIONS,
  CODE,
  RETRIES,
  EVENTS,
} from "./data/documentation";

@Component({
  selector: "docs-documentation-template",
  imports: [
    ...SONE_ALERT_PARTS,
    ...SONE_INPUT_GROUP_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneCopyButtonComponent,
    SoneIconComponent,
    SoneSegmentedComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="documentation">
      <header class="topbar">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true">D</span>
          Driftbox <span class="brand-docs">Docs</span>
        </span>
        <span soneBadge variant="outline">v3.4</span>
        <button
          soneBtn
          variant="outline"
          size="sm"
          type="button"
          class="menu-toggle"
          aria-controls="doc-nav"
          [attr.aria-expanded]="navOpen()"
          (click)="navOpen.set(!navOpen())"
        >
          <sone-icon icon="sidebar" /> Menu
        </button>
      </header>

      <div class="layout">
        <nav
          id="doc-nav"
          class="nav"
          aria-label="Documentation"
          [attr.data-open]="navOpen() ? '' : null"
        >
          <div soneInputGroup class="nav-search">
            <span soneInputGroupAddon><sone-icon icon="search" /></span>
            <input
              soneInputGroupInput
              type="search"
              autocomplete="off"
              placeholder="Search docs"
              aria-label="Search docs"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
          </div>
          @for (g of groups(); track g.id) {
            <div class="nav-group">
              <p class="nav-label" [id]="'doc-nav-' + g.id">{{ g.label }}</p>
              <ul [attr.aria-labelledby]="'doc-nav-' + g.id">
                @for (p of g.pages; track p.id) {
                  <li>
                    <a
                      class="nav-link"
                      [href]="'#' + p.id"
                      [attr.aria-current]="p.id === current ? 'page' : null"
                      (click)="$event.preventDefault()"
                    >
                      {{ p.label }}
                      @if (p.badge) {
                        <span soneBadge variant="secondary">{{ p.badge }}</span>
                      }
                    </a>
                  </li>
                }
              </ul>
            </div>
          } @empty {
            <p class="nav-empty" role="status">
              No pages match “{{ query() }}”.
            </p>
          }
        </nav>

        <nav class="outline" aria-labelledby="doc-outline-title">
          <p class="outline-title" id="doc-outline-title">On this page</p>
          <button
            type="button"
            class="outline-toggle"
            aria-controls="doc-outline-list"
            [attr.aria-expanded]="outlineOpen()"
            (click)="outlineOpen.set(!outlineOpen())"
          >
            On this page
            <sone-icon icon="chevron-right" size="sm" class="outline-caret" />
          </button>
          <ol
            id="doc-outline-list"
            class="outline-list"
            [attr.data-open]="outlineOpen() ? '' : null"
          >
            @for (s of sections; track s.id) {
              <li>
                <a
                  class="outline-link"
                  [href]="'#' + s.id"
                  [attr.aria-current]="active() === s.id ? 'location' : null"
                  (click)="jump(s.id, $event)"
                  >{{ s.label }}</a
                >
              </li>
            }
          </ol>
        </nav>

        <article class="article" aria-labelledby="doc-title">
          <p class="crumbs">
            <span>Guides</span>
            <sone-icon icon="chevron-right" size="xs" />
            <span>Webhooks</span>
          </p>
          <h2 id="doc-title" class="title">Webhooks</h2>
          <p class="lead">
            Get a request on your server the moment something changes in a
            Driftbox workspace — a file syncs, a folder is shared or storage
            runs low — instead of polling the API.
          </p>
          <p class="meta">
            <sone-icon icon="clock" size="xs" /> 6 min read
            <span aria-hidden="true">·</span> Updated Oct 2, 2026
          </p>

          <section aria-labelledby="doc-how">
            <h3 id="doc-how" tabindex="-1">How webhooks work</h3>
            <p>
              A webhook is an HTTPS endpoint on your server. When an event
              happens, Driftbox sends it a <code>POST</code> request with a JSON
              body describing the event. Your endpoint answers with any
              <code>2xx</code> status within 10 seconds to confirm delivery.
            </p>
            <p>
              Every request carries a <code>Driftbox-Signature</code> header, so
              you can check that it really came from Driftbox before you act on
              it.
            </p>
          </section>

          <section aria-labelledby="doc-create">
            <h3 id="doc-create" tabindex="-1">Create an endpoint</h3>
            <ol class="steps">
              <li>
                <strong>Add a route.</strong> Accept <code>POST</code> requests
                and keep the raw body — the signature is computed over the exact
                bytes.
              </li>
              <li>
                <strong>Register the URL.</strong> In
                <em>Settings → Developers → Webhooks</em>, add the URL and pick
                the events you need.
              </li>
              <li>
                <strong>Store the secret.</strong> Copy the signing secret into
                an environment variable such as <code>DRIFTBOX_SECRET</code>.
              </li>
            </ol>

            <figure class="code">
              <figcaption class="code-head">
                <sone-segmented
                  size="sm"
                  ariaLabel="Language"
                  [options]="langs"
                  [value]="lang()"
                  (valueChange)="setLang($event)"
                />
                <span class="code-file">{{ code().file }}</span>
                <sone-copy-button
                  iconOnly
                  variant="ghost"
                  label="Copy code"
                  [value]="code().source"
                />
              </figcaption>
              <pre
                class="code-body"
                tabindex="0"
                [attr.aria-label]="'Code sample, ' + code().file"
              ><code>{{ code().source }}</code></pre>
            </figure>
          </section>

          <section aria-labelledby="doc-verify">
            <h3 id="doc-verify" tabindex="-1">Verify the signature</h3>
            <p>
              The signature is an HMAC-SHA256 of the timestamp and the raw body,
              keyed with your signing secret. The SDKs do the check for you and
              throw when it fails or when the timestamp is older than five
              minutes.
            </p>
            <div soneAlert variant="info" role="note">
              <sone-icon icon="alert-circle" />
              <p soneAlertTitle>Never skip verification</p>
              <p soneAlertDescription>
                Anyone can send a request to a public URL. Reject a request
                whose signature does not match with a <code>400</code> and do
                nothing else.
              </p>
            </div>
          </section>

          <section aria-labelledby="doc-retries">
            <h3 id="doc-retries" tabindex="-1">Retries and timeouts</h3>
            <p>
              When your endpoint times out or answers with an error, Driftbox
              retries with a growing delay. After the fifth failed retry the
              event is marked as failed and you can replay it from the
              dashboard.
            </p>
            <div class="table-wrap">
              <table class="table">
                <caption class="sr-only">
                  Retry schedule
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Attempt</th>
                    <th scope="col">Delay after the previous one</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of retries; track r.attempt) {
                    <tr>
                      <td>{{ r.attempt }}</td>
                      <td>{{ r.delay }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="doc-events">
            <h3 id="doc-events" tabindex="-1">Event types</h3>
            <p>
              Subscribe only to the events you handle. The most common ones:
            </p>
            <dl class="events">
              @for (e of events; track e.name) {
                <div>
                  <dt>
                    <code>{{ e.name }}</code>
                  </dt>
                  <dd>{{ e.description }}</dd>
                </div>
              }
            </dl>
          </section>

          <div class="feedback">
            <p id="doc-feedback">Was this page helpful?</p>
            <div
              class="feedback-actions"
              role="group"
              aria-labelledby="doc-feedback"
            >
              <button
                soneBtn
                variant="outline"
                size="sm"
                type="button"
                [attr.aria-pressed]="vote() === 'yes'"
                (click)="vote.set('yes')"
              >
                <sone-icon icon="check" /> Yes
              </button>
              <button
                soneBtn
                variant="outline"
                size="sm"
                type="button"
                [attr.aria-pressed]="vote() === 'no'"
                (click)="vote.set('no')"
              >
                <sone-icon icon="close" /> No
              </button>
            </div>
            <p class="feedback-thanks" role="status">
              @if (vote()) {
                Thanks — your feedback helps us improve the docs.
              }
            </p>
          </div>

          <nav class="pager" aria-label="Previous and next page">
            <a
              class="pager-link"
              href="#uploads"
              (click)="$event.preventDefault()"
            >
              <span class="pager-hint">
                <sone-icon icon="arrow-right" size="xs" class="flip" /> Previous
              </span>
              <span class="pager-title">Uploading files</span>
            </a>
            <a
              class="pager-link pager-next"
              href="#rate-limits"
              (click)="$event.preventDefault()"
            >
              <span class="pager-hint">
                Next <sone-icon icon="arrow-right" size="xs" />
              </span>
              <span class="pager-title">Rate limits</span>
            </a>
          </nav>
        </article>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  styleUrl: "./styles/documentation.css",
})
export default class Template {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly current = CURRENT;
  protected readonly sections = SECTIONS;
  protected readonly retries = RETRIES;
  protected readonly events = EVENTS;
  protected readonly langs: readonly SegmentOption[] = [
    { value: "node", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "curl", label: "cURL" },
  ];

  protected readonly query = signal("");
  protected readonly navOpen = signal(false);
  protected readonly outlineOpen = signal(false);
  protected readonly lang = signal<Lang>("node");
  protected readonly active = signal(SECTIONS[0].id);
  protected readonly vote = signal<"yes" | "no" | null>(null);

  protected readonly code = computed(() => CODE[this.lang()]);

  /** The navigation filtered by the search field; empty groups drop out. */
  protected readonly groups = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return NAV;
    return NAV.map((g) => ({
      ...g,
      pages: g.pages.filter((p) => p.label.toLowerCase().includes(q)),
    })).filter((g) => g.pages.length > 0);
  });

  constructor() {
    // Browser only: highlight the outline entry of the section being read.
    afterNextRender(() => {
      if (typeof IntersectionObserver === "undefined") return;
      const headings = SECTIONS.map((s) =>
        this.host.nativeElement.querySelector<HTMLElement>(`#${s.id}`),
      ).filter((h): h is HTMLElement => h !== null);
      const observer = new IntersectionObserver(
        (entries) => {
          const hit = entries.find((e) => e.isIntersecting);
          if (hit) this.active.set(hit.target.id);
        },
        { rootMargin: "0px 0px -70% 0px" },
      );
      headings.forEach((h) => observer.observe(h));
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected setLang(value: string): void {
    this.lang.set(value as Lang);
  }

  /** Scrolls to a section and moves focus to its heading. */
  protected jump(id: string, event: Event): void {
    event.preventDefault();
    const heading = this.host.nativeElement.querySelector<HTMLElement>(
      `#${id}`,
    );
    if (!heading) return;
    const reduce = heading.ownerDocument.defaultView?.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    heading.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    heading.focus({ preventScroll: true });
    this.active.set(id);
    this.outlineOpen.set(false);
  }
}
