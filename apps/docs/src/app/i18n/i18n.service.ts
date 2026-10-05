import { DOCUMENT } from "@angular/common";
import { Injectable, computed, inject, signal } from "@angular/core";

import { MESSAGE_LOADERS } from "./load";
import {
  LOCALES,
  type Locale,
  type LocaleCode,
  localeOf,
  localizePath,
} from "./locales";
import { en, type Messages } from "./messages/en";

/**
 * The active locale and its messages. The locale comes from the URL (a route
 * resolver calls `use()` before any page renders), so prerendered HTML and the
 * hydrated app always agree.
 */
@Injectable({ providedIn: "root" })
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly loaded = new Map<LocaleCode, Messages>([["en", en]]);

  readonly locale = signal<Locale>(LOCALES[0]);
  readonly m = signal<Messages>(en);
  readonly code = computed(() => this.locale().code);

  async use(code: string | undefined): Promise<void> {
    const locale = localeOf(code);
    let messages = this.loaded.get(locale.code);
    if (!messages) {
      messages = await MESSAGE_LOADERS[locale.code]();
      this.loaded.set(locale.code, messages);
    }
    this.locale.set(locale);
    this.m.set(messages);
    this.document.documentElement.lang = locale.tag;
    this.document.documentElement.dir = "ltr";
  }

  /** A site path in the active locale: `link('/components')` → `/pl/components`. */
  link(path: string): string {
    return localizePath(path, this.code());
  }

  /** `{name}` placeholders. */
  format(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (_, k: string) =>
      k in params ? String(params[k]) : `{${k}}`,
    );
  }
}
