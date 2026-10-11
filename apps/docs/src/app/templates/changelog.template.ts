import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
} from "@angular/core";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import {
  type BadgeVariant,
  SoneBadgeDirective,
} from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneCopyButtonComponent } from "@surface-one/angular/copy-button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";

import { type Kind, type Filter, PAGE } from "./data/changelog";

interface Release {
  readonly version: string;
  /** ISO date for `<time datetime>`. */
  readonly date: string;
  readonly dateLabel: string;
  readonly title: string;
  readonly summary: string;
  /** A breaking change, shown as a warning above the lists. */
  readonly breaking?: string;
  readonly changes: Readonly<Partial<Record<Kind, readonly string[]>>>;
}

const KINDS: readonly {
  id: Kind;
  label: string;
  variant: BadgeVariant;
}[] = [
  { id: "added", label: "Added", variant: "success" },
  { id: "improved", label: "Improved", variant: "accent" },
  { id: "fixed", label: "Fixed", variant: "warning" },
];

const RELEASES: readonly Release[] = [
  {
    version: "3.4.0",
    date: "2026-10-07",
    dateLabel: "Oct 7, 2026",
    title: "Webhook replay and a faster sync engine",
    summary:
      "Failed webhook deliveries can now be replayed from the dashboard, and large folders sync up to twice as fast.",
    changes: {
      added: [
        "Replay a failed webhook delivery from Settings → Developers.",
        "A quota.warning event when a workspace passes 90% of its storage.",
      ],
      improved: [
        "Folders with more than 10,000 files sync up to 2× faster.",
        "The activity log loads in pages of 100 instead of all at once.",
      ],
      fixed: ["Renaming a file twice in a row no longer creates a duplicate."],
    },
  },
  {
    version: "3.3.2",
    date: "2026-09-24",
    dateLabel: "Sep 24, 2026",
    title: "Patch release",
    summary: "Small fixes for shared links and the Windows app.",
    changes: {
      fixed: [
        "Shared links with an expiry date showed the wrong time zone.",
        "The Windows app could stall on files with very long paths.",
        "Search ignored accented letters such as “é” and “ł”.",
      ],
    },
  },
  {
    version: "3.3.0",
    date: "2026-09-10",
    dateLabel: "Sep 10, 2026",
    title: "Shared links that expire",
    summary:
      "Give a link an expiry date and a password, and see who opened it.",
    changes: {
      added: [
        "Expiry dates and passwords for shared links.",
        "A “Viewed by” list on every shared link.",
      ],
      improved: ["Link previews now show the file size and type."],
    },
  },
  {
    version: "3.2.0",
    date: "2026-08-20",
    dateLabel: "Aug 20, 2026",
    title: "Folder-level permissions",
    summary:
      "Set who can view, edit or share each folder, instead of the whole workspace.",
    changes: {
      added: [
        "View, edit and share roles per folder.",
        "An audit log entry for every permission change.",
      ],
      improved: ["The member picker searches by name and email."],
      fixed: ["Guests could see the names of folders they had no access to."],
    },
  },
  {
    version: "3.1.1",
    date: "2026-08-06",
    dateLabel: "Aug 6, 2026",
    title: "Patch release",
    summary: "Fixes for uploads on slow connections.",
    changes: {
      fixed: [
        "Uploads over 2 GB restarted after a dropped connection.",
        "The progress bar stopped at 99% on some uploads.",
      ],
    },
  },
  {
    version: "3.1.0",
    date: "2026-07-16",
    dateLabel: "Jul 16, 2026",
    title: "Python SDK 1.0",
    summary: "The Python SDK is stable, with typed models and async support.",
    changes: {
      added: ["driftbox for Python 1.0 with sync and async clients."],
      improved: ["Error messages now include the request ID."],
    },
  },
  {
    version: "3.0.0",
    date: "2026-06-25",
    dateLabel: "Jun 25, 2026",
    title: "Driftbox 3",
    summary:
      "A new sync engine, a redesigned web app and version 3 of the REST API.",
    breaking:
      "API v1 is retired. Move your integration to /v3 before December 1, 2026.",
    changes: {
      added: [
        "A new sync engine with block-level transfers.",
        "Version 3 of the REST API with cursor pagination.",
      ],
      improved: ["A redesigned web app with dark mode."],
    },
  },
];

@Component({
  selector: "docs-changelog-template",
  imports: [
    ...SONE_ALERT_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneCopyButtonComponent,
    SoneIconComponent,
    SoneSegmentedComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <nav class="versions" aria-labelledby="versions-title">
        <p class="versions-title" id="versions-title">Versions</p>
        <ol class="versions-list">
          @for (r of matching(); track r.version) {
            <li>
              <a
                class="version-link"
                [href]="'#rel-' + r.version"
                [attr.aria-current]="active() === r.version ? 'location' : null"
                (click)="jump(r.version, $event)"
              >
                <span class="version-num">v{{ r.version }}</span>
                <time class="version-date" [attr.datetime]="r.date">{{
                  r.dateLabel
                }}</time>
              </a>
            </li>
          }
        </ol>
      </nav>

      <div class="main">
        <header class="head">
          <p class="eyebrow">Driftbox</p>
          <h2 class="title">Changelog</h2>
          <p class="lead">
            New features, improvements and fixes. We ship every two weeks.
          </p>
          <div class="head-actions">
            <button
              soneBtn
              [variant]="subscribed() ? 'outline' : 'default'"
              size="sm"
              type="button"
              [attr.aria-pressed]="subscribed()"
              (click)="subscribed.set(!subscribed())"
            >
              <sone-icon [icon]="subscribed() ? 'check' : 'bell-plus'" />
              {{ subscribed() ? "Subscribed" : "Subscribe to updates" }}
            </button>
            <sone-copy-button
              variant="ghost"
              label="Copy RSS link"
              copiedLabel="RSS link copied"
              value="https://driftbox.dev/changelog.rss"
            />
          </div>
        </header>

        <div class="toolbar">
          <sone-segmented
            size="sm"
            ariaLabel="Show changes"
            [options]="filters"
            [value]="filter()"
            (valueChange)="setFilter($event)"
          />
          <p class="count" role="status">
            {{ visible().length }}
            {{ visible().length === 1 ? "release" : "releases" }}
          </p>
        </div>

        <ol class="timeline">
          @for (r of visible(); track r.version) {
            <li
              class="release"
              [attr.data-version]="r.version"
              [attr.data-latest]="r === latest ? '' : null"
            >
              <div class="when">
                <span class="version">v{{ r.version }}</span>
                <time [attr.datetime]="r.date">{{ r.dateLabel }}</time>
                @if (r === latest) {
                  <span soneBadge variant="secondary">Latest</span>
                }
              </div>
              <span class="dot" aria-hidden="true"></span>
              <article class="body" [attr.aria-labelledby]="'rel-' + r.version">
                <h3
                  class="release-title"
                  tabindex="-1"
                  [id]="'rel-' + r.version"
                >
                  <span class="sr-only">v{{ r.version }}: </span>{{ r.title }}
                </h3>
                <p class="summary">{{ r.summary }}</p>
                @if (r.breaking && filter() === "all") {
                  <div soneAlert variant="warning" role="note">
                    <sone-icon icon="alert-circle" />
                    <p soneAlertTitle>Breaking change</p>
                    <p soneAlertDescription>{{ r.breaking }}</p>
                  </div>
                }
                @for (k of kinds; track k.id) {
                  @if (shows(k.id) && r.changes[k.id]; as items) {
                    <div class="group">
                      <h4 class="group-title">
                        <span soneBadge [variant]="k.variant">{{
                          k.label
                        }}</span>
                      </h4>
                      <ul class="changes">
                        @for (c of items; track c) {
                          <li>{{ c }}</li>
                        }
                      </ul>
                    </div>
                  }
                }
              </article>
            </li>
          } @empty {
            <li class="empty">No releases with this kind of change.</li>
          }
        </ol>

        @if (hasMore()) {
          <div class="more">
            <button
              soneBtn
              variant="outline"
              size="sm"
              type="button"
              (click)="showAll.set(true)"
            >
              <sone-icon icon="chevrons-down" /> Show older releases
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      container-type: inline-size;
      padding: var(--space-8) var(--space-6);
      color: var(--text-primary);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    /* Layout: versions | releases */
    .layout {
      display: grid;
      grid-template-columns: 10rem minmax(0, 1fr);
      align-items: start;
      gap: var(--space-8);
      max-width: 64rem;
      margin-inline: auto;
    }
    .main {
      min-width: 0;
    }

    /* Versions: jump to a release without scrolling */
    .versions {
      position: sticky;
      top: var(--space-4);
      display: grid;
      gap: var(--space-2);
      max-height: calc(100vh - var(--space-8));
      overflow-y: auto;
    }
    .versions-title {
      margin: 0;
      padding-left: var(--space-3);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }
    .versions-list {
      display: grid;
      margin: 0;
      padding: 0;
      border-left: var(--border-width-thin) solid var(--border-subtle);
      list-style: none;
    }
    .version-link {
      display: grid;
      margin-left: calc(var(--space-px) * -1);
      padding: var(--space-1) var(--space-3);
      border-left: 2px solid transparent;
      color: var(--text-secondary);
      text-decoration: none;
    }
    .version-link:hover {
      color: var(--text-primary);
    }
    .version-link[aria-current="location"] {
      border-left-color: var(--accent);
      color: var(--accent-text);
    }
    .version-num {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .version-date {
      color: var(--text-tertiary);
      font-size: var(--font-size-xs);
    }

    /* Header */
    .head {
      display: grid;
      justify-items: start;
      gap: var(--space-2);
      padding-left: calc(10rem + var(--space-8));
    }
    .eyebrow {
      margin: 0;
      color: var(--accent-text);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }
    .title {
      margin: 0;
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      letter-spacing: var(--tracking-heading);
      line-height: var(--leading-tight);
    }
    .lead {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-lg);
      line-height: var(--leading-relaxed);
    }
    .head-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    /* Filter */
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-top: var(--space-6);
      margin-bottom: var(--space-6);
      padding: var(--space-3) 0 var(--space-3) calc(10rem + var(--space-8));
      border-top: var(--border-width-thin) solid var(--border-subtle);
      border-bottom: var(--border-width-thin) solid var(--border-subtle);
    }
    .count {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      font-variant-numeric: tabular-nums;
    }

    /* Timeline: date | rail | notes */
    .timeline {
      margin-top: 0;
      margin-bottom: 0;
      padding: 0;
      list-style: none;
    }
    .release {
      position: relative;
      display: grid;
      grid-template-columns: 10rem var(--space-8) minmax(0, 1fr);
      padding-bottom: var(--space-8);
    }
    /* The rail: a line through every dot, stopping at the last one. */
    .release::before {
      content: "";
      position: absolute;
      top: var(--space-2);
      bottom: 0;
      left: calc(10rem + var(--space-4) - 0.5px);
      width: 1px;
      background: var(--border);
    }
    .release:last-child::before {
      display: none;
    }
    .when {
      display: grid;
      justify-items: end;
      align-content: start;
      gap: var(--space-1);
      padding-top: var(--space-px);
      text-align: right;
    }
    .version {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }
    time {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .dot {
      position: relative;
      justify-self: center;
      width: 0.75rem;
      height: 0.75rem;
      margin-top: var(--space-1);
      border: 2px solid var(--border-strong);
      border-radius: var(--radius-pill);
      background: var(--surface-base);
    }
    .release[data-latest] .dot {
      border-color: var(--accent);
      background: var(--accent);
      box-shadow: 0 0 0 4px var(--accent-soft);
    }
    .body {
      display: grid;
      gap: var(--space-4);
      min-width: 0;
    }
    .release-title {
      margin: 0;
      scroll-margin-top: var(--space-6);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--tracking-heading);
      line-height: var(--leading-snug);
    }
    .release-title:focus {
      outline: none;
    }
    .summary {
      margin: calc(var(--space-2) * -1) 0 0;
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
    }
    .group {
      display: grid;
      gap: var(--space-2);
    }
    .group-title {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
    }
    .changes {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding-left: var(--space-5);
      line-height: var(--leading-relaxed);
    }
    .changes li::marker {
      color: var(--text-tertiary);
    }
    .empty {
      padding: var(--space-6) 0 var(--space-6) calc(10rem + var(--space-8));
      color: var(--text-secondary);
    }
    .more {
      display: flex;
      padding-left: calc(10rem + var(--space-8));
    }

    /* Medium: the versions become a scrollable row above the releases. */
    @container (max-width: 960px) {
      .layout {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--space-6);
      }
      .versions {
        position: static;
        max-height: none;
        order: 1;
      }
      .main {
        display: contents;
      }
      .head {
        order: 0;
      }
      .toolbar,
      .timeline,
      .more {
        order: 2;
      }
      .versions-title {
        padding-left: 0;
      }
      .versions-list {
        display: flex;
        gap: var(--space-1);
        overflow-x: auto;
        border-left: 0;
        border-bottom: var(--border-width-thin) solid var(--border-subtle);
      }
      .version-link {
        margin: 0 0 calc(var(--space-px) * -1);
        border-bottom: 2px solid transparent;
        border-left: 0;
        white-space: nowrap;
      }
      .version-link[aria-current="location"] {
        border-bottom-color: var(--accent);
      }
    }

    /* Narrow: version and date move above each release, the rail to the edge. */
    @container (max-width: 640px) {
      .head,
      .toolbar,
      .empty,
      .more {
        padding-left: 0;
      }
      .title {
        font-size: var(--font-size-2xl);
      }
      .release {
        grid-template-columns: var(--space-6) minmax(0, 1fr);
        grid-template-areas:
          "dot when"
          ". body";
        row-gap: var(--space-2);
      }
      .release::before {
        left: calc(var(--space-3) - 0.5px);
      }
      .when {
        grid-area: when;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-2);
        text-align: left;
      }
      .dot {
        grid-area: dot;
        justify-self: start;
        margin-top: var(--space-1);
        margin-left: calc(var(--space-3) - 0.375rem);
      }
      .body {
        grid-area: body;
      }
    }
    @media (max-width: 640px) {
      :host {
        padding: var(--space-6) var(--space-4);
      }
    }
  `,
})
export default class Template {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly kinds = KINDS;
  protected readonly latest = RELEASES[0];
  protected readonly filters: readonly SegmentOption[] = [
    { value: "all", label: "All" },
    { value: "added", label: "Features" },
    { value: "improved", label: "Improvements" },
    { value: "fixed", label: "Fixes" },
  ];

  protected readonly filter = signal<Filter>("all");
  protected readonly subscribed = signal(false);
  protected readonly showAll = signal(false);

  /** Releases with at least one change of the chosen kind. */
  protected readonly matching = computed(() => {
    const f = this.filter();
    return f === "all"
      ? RELEASES
      : RELEASES.filter((r) => (r.changes[f]?.length ?? 0) > 0);
  });

  protected readonly visible = computed(() =>
    this.showAll() ? this.matching() : this.matching().slice(0, PAGE),
  );
  protected readonly hasMore = computed(
    () => !this.showAll() && this.matching().length > PAGE,
  );

  /** The release being read, highlighted in the versions list. */
  protected readonly active = signal(RELEASES[0].version);
  /** Set while a jump scrolls, so the releases passed on the way are not highlighted. */
  private jumping = false;

  constructor() {
    // Browser only: follow the scroll, again whenever the shown releases change.
    afterRenderEffect((onCleanup) => {
      this.visible();
      if (typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(
        (entries) => {
          const hit = entries.find((e) => e.isIntersecting);
          const version = (hit?.target as HTMLElement | undefined)?.dataset[
            "version"
          ];
          if (version && !this.jumping) this.active.set(version);
        },
        { rootMargin: "0px 0px -70% 0px" },
      );
      this.host.nativeElement
        .querySelectorAll(".release")
        .forEach((el) => observer.observe(el));
      onCleanup(() => observer.disconnect());
    });
  }

  /** Scrolls to a release, showing older ones first if it is hidden. */
  protected jump(version: string, event: Event): void {
    event.preventDefault();
    if (this.visible().some((r) => r.version === version)) {
      this.scrollTo(version);
      return;
    }
    this.showAll.set(true);
    afterNextRender(() => this.scrollTo(version), { injector: this.injector });
  }

  private scrollTo(version: string): void {
    const heading = this.host.nativeElement.querySelector<HTMLElement>(
      `[id="rel-${version}"]`,
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
    this.active.set(version);
    this.jumping = true;
    const done = () => (this.jumping = false);
    heading.ownerDocument.addEventListener("scrollend", done, {
      once: true,
      capture: true,
    });
    setTimeout(done, 1000);
  }

  protected setFilter(value: string): void {
    this.filter.set(value as Filter);
  }

  protected shows(kind: Kind): boolean {
    const f = this.filter();
    return f === "all" || f === kind;
  }
}
