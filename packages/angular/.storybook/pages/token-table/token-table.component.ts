import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";

import {
  type CssTokenGroup,
  type TokenPreview,
  parseCssTokens,
  previewKind,
} from "./css-tokens";

interface TokenRow {
  readonly name: string;
  readonly value: string;
  readonly note: string;
  readonly live: string;
  readonly preview: TokenPreview;
  readonly paint: string;
}

interface SectionView {
  readonly key: string;
  readonly title: string;
  readonly rows: readonly TokenRow[];
}

interface GroupView {
  readonly context: string;
  readonly isBase: boolean;
  readonly sections: readonly SectionView[];
  readonly count: number;
}

@Component({
  selector: "app-token-table",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./token-table.component.html",
  styleUrl: "./token-table.component.scss",
})
export class TokenTableComponent {
  readonly source = input.required<string>();
  /** Forces a re-read: `getComputedStyle` isn't reactive, so this input's change is the trigger. */
  readonly revision = input<unknown>(null);

  readonly query = signal("");

  private readonly groups = computed<readonly CssTokenGroup[]>(() =>
    parseCssTokens(this.source()),
  );

  readonly total = computed(() =>
    this.groups().reduce(
      (sum, g) => sum + g.sections.reduce((n, s) => n + s.tokens.length, 0),
      0,
    ),
  );

  readonly views = computed<readonly GroupView[]>(() => {
    this.revision();
    const q = this.query().trim().toLowerCase();
    const style = getComputedStyle(document.documentElement);
    return this.groups()
      .map((group) => {
        const isBase = group.context === ":root";
        const sections = group.sections
          .map((section, i) => ({
            key: `${i}:${section.title}`,
            title: section.title,
            rows: section.tokens
              .filter(
                (t) =>
                  !q ||
                  t.name.includes(q) ||
                  t.value.toLowerCase().includes(q) ||
                  t.note.toLowerCase().includes(q),
              )
              .map((t) => {
                const live = style.getPropertyValue(t.name).trim();
                const paint = isBase ? `var(${t.name})` : t.value;
                return {
                  ...t,
                  live,
                  paint,
                  preview: previewKind(t.name, isBase ? live : t.value),
                };
              }),
          }))
          .filter((s) => s.rows.length > 0);
        return {
          context: group.context,
          isBase,
          sections,
          count: sections.reduce((n, s) => n + s.rows.length, 0),
        };
      })
      .filter((g) => g.count > 0);
  });

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
