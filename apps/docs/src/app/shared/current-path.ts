import { inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map, startWith } from "rxjs";

import { stripLocale } from "../i18n/locales";

/** The current route as a locale-neutral path (`/pl/theme` → `/theme`). */
export function currentPath() {
  const router = inject(Router);
  return toSignal(
    router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => stripLocale(e.urlAfterRedirects)),
      startWith(stripLocale(router.url)),
    ),
    { initialValue: "/" },
  );
}
