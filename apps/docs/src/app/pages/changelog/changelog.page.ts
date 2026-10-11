import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import {
  type BadgeVariant,
  SoneBadgeDirective,
} from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  type SegmentOption,
  SoneSegmentedComponent,
} from "@surface-one/angular/segmented";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import { SITE } from "../../site.config";
// Built from CHANGELOG.md by scripts/build-changelog.mjs (release-please writes CHANGELOG.md).
import CHANGELOG from "./changelog.generated.json";

type Kind = "features" | "fixes" | "docs" | "breaking" | "other";
type Filter = "all" | "features" | "fixes" | "docs";

const VARIANTS: Readonly<Record<Kind, BadgeVariant>> = {
  features: "success",
  fixes: "warning",
  docs: "secondary",
  breaking: "warning",
  other: "outline",
};

/**
 * The changelog, laid out like the Changelog template: a sticky list of versions on the
 * left to jump straight to a release, a filter by kind of change and every version on a
 * timeline. Release notes are English only.
 */
@Component({
  selector: "docs-changelog-page",
  imports: [
    ...SONE_ALERT_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneSegmentedComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./changelog.page.html",
  styleUrl: "./changelog.page.scss",
})
export default class ChangelogPage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly npmUrl = `https://www.npmjs.com/org/${SITE.npmScope.slice(1)}`;
  protected readonly releasesUrl = `${SITE.repository}/releases`;

  protected readonly filter = signal<Filter>("all");
  /** The release being read, highlighted in the versions list. */
  protected readonly active = signal(`v${CHANGELOG[0].version}`);
  /** Set while a jump scrolls, so the releases passed on the way are not highlighted. */
  private jumping = false;

  protected readonly filters = computed<readonly SegmentOption[]>(() => {
    const m = this.i18n.m().changelog;
    return [
      { value: "all", label: m.all },
      { value: "features", label: m.features },
      { value: "fixes", label: m.fixes },
      { value: "docs", label: m.docs },
    ];
  });

  protected readonly versions = computed(() => {
    const fmt = new Intl.DateTimeFormat(this.i18n.locale().tag, {
      dateStyle: "medium",
      timeZone: "UTC",
    });
    return CHANGELOG.map((v, i) => ({
      ...v,
      id: `v${v.version}`,
      latest: i === 0,
      dateLabel: fmt.format(new Date(`${v.date}T00:00:00Z`)),
      sections: v.sections.map((s) => ({
        ...s,
        kind: s.kind as Kind,
        variant: VARIANTS[s.kind as Kind],
      })),
    }));
  });

  /** Versions with at least one change of the chosen kind. */
  protected readonly visible = computed(() => {
    const f = this.filter();
    return f === "all"
      ? this.versions()
      : this.versions().filter((v) => v.sections.some((s) => s.kind === f));
  });

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.changelog.title,
        description: m.changelog.description,
        path: "/changelog",
      });
    });

    // Browser only: follow the scroll, again whenever the shown versions change.
    afterRenderEffect((onCleanup) => {
      this.visible();
      if (typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(
        (entries) => {
          const hit = entries.find((e) => e.isIntersecting);
          const id = (hit?.target as HTMLElement | undefined)?.dataset["id"];
          if (id && !this.jumping) this.active.set(id);
        },
        { rootMargin: "0px 0px -70% 0px" },
      );
      this.host.nativeElement
        .querySelectorAll(".release")
        .forEach((el) => observer.observe(el));
      onCleanup(() => observer.disconnect());
    });
  }

  protected setFilter(value: string): void {
    this.filter.set(value as Filter);
  }

  /** The sections a version shows under the active filter. */
  protected shows(kind: Kind): boolean {
    const f = this.filter();
    return f === "all" || f === kind;
  }

  /** Scrolls to a version and moves focus to its heading. */
  protected jump(id: string, event: Event): void {
    event.preventDefault();
    const heading = this.host.nativeElement.querySelector<HTMLElement>(
      `[id="${id}"]`,
    );
    if (!heading) return;
    const view = heading.ownerDocument.defaultView;
    const reduce = view?.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    heading.focus({ preventScroll: true });
    // The full path: a bare `#id` would resolve against <base href>.
    if (view) {
      const { pathname, search } = view.location;
      view.history.replaceState(
        view.history.state,
        "",
        `${pathname}${search}#${id}`,
      );
    }
    this.active.set(id);
    this.jumping = true;
    const done = () => (this.jumping = false);
    heading.ownerDocument.addEventListener("scrollend", done, {
      once: true,
      capture: true,
    });
    setTimeout(done, 1000);
  }
}
