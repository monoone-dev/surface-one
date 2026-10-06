import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import { SITE } from "../../site.config";
// Built from CHANGELOG.md by scripts/build-changelog.mjs (release-please writes CHANGELOG.md).
import CHANGELOG from "./changelog.generated.json";

/**
 * The changelog, laid out like the IndexOne landing page's: a sticky intro on the
 * left, every version on a timeline on the right. Release notes are English only.
 */
@Component({
  selector: "docs-changelog-page",
  imports: [SoneBadgeDirective, SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./changelog.page.html",
  styleUrl: "./changelog.page.scss",
})
export default class ChangelogPage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly site = SITE;
  protected readonly npmUrl = `https://www.npmjs.com/org/${SITE.npmScope.slice(1)}`;
  protected readonly releasesUrl = `${SITE.repository}/releases`;

  private readonly timeline = viewChild<ElementRef<HTMLElement>>("timeline");
  /** How far the reader has scrolled through the timeline, 0–100. */
  protected readonly progress = signal(0);

  protected readonly versions = computed(() => {
    const fmt = new Intl.DateTimeFormat(this.i18n.locale().tag, {
      dateStyle: "medium",
      timeZone: "UTC",
    });
    return CHANGELOG.map((v) => ({
      ...v,
      id: `v${v.version}`,
      dateLabel: fmt.format(new Date(`${v.date}T00:00:00Z`)),
    }));
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

    afterNextRender(() => {
      let frame = 0;
      const update = () => {
        frame = 0;
        const el = this.timeline()?.nativeElement;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const passed = window.innerHeight / 2 - rect.top;
        this.progress.set(
          Math.round(Math.min(1, Math.max(0, passed / rect.height)) * 1000) /
            10,
        );
      };
      const onScroll = () => {
        frame ||= requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      });
    });
  }
}
