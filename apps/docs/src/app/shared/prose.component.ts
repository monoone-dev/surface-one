import { Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";

import { I18n } from "../i18n/i18n.service";
import { inlineMarkup } from "../i18n/inline";
import type { GuideBlock } from "../i18n/messages/en";
import { SNIPPETS } from "../i18n/snippets";
import { CodeBlockComponent } from "./code-block.component";

type View =
  | { kind: "h2"; id: string; html: string }
  | { kind: "p" | "note"; html: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; code: string; lang: string };

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Renders guide blocks; internal links navigate through the router. */
@Component({
  selector: "docs-prose",
  imports: [CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "prose", "(click)": "onClick($event)" },
  template: `
    @for (b of view(); track $index) {
      @switch (b.kind) {
        @case ("h2") {
          <h2 [id]="b.id" [innerHTML]="b.html"></h2>
        }
        @case ("p") {
          <p [innerHTML]="b.html"></p>
        }
        @case ("note") {
          <p class="callout" [innerHTML]="b.html"></p>
        }
        @case ("list") {
          <ul>
            @for (item of b.items; track $index) {
              <li [innerHTML]="item"></li>
            }
          </ul>
        }
        @case ("code") {
          <docs-code [code]="b.code" [lang]="b.lang" />
        }
      }
    }
  `,
})
export class ProseComponent {
  private readonly i18n = inject(I18n);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly blocks = input.required<readonly GuideBlock[]>();

  protected readonly view = computed<View[]>(() => {
    const code = this.i18n.code();
    const md = (t: string) => inlineMarkup(t, code);
    return this.blocks().map((b): View => {
      if ("h2" in b) return { kind: "h2", id: slugify(b.h2), html: md(b.h2) };
      if ("p" in b) return { kind: "p", html: md(b.p) };
      if ("note" in b) return { kind: "note", html: md(b.note) };
      if ("list" in b) return { kind: "list", items: b.list.map(md) };
      const s = SNIPPETS[b.code];
      return { kind: "code", code: s?.code ?? "", lang: s?.lang ?? "" };
    });
  });

  protected onClick(event: MouseEvent): void {
    const a = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      "a.internal",
    );
    if (
      !a ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    // The href is relative to the <base href>; the router wants the path without it.
    const url = new URL(a.href);
    void this.router.navigateByUrl(
      this.location.normalize(url.pathname) + url.search + url.hash,
    );
  }
}
