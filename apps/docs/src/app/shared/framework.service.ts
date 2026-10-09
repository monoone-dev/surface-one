import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject, signal } from "@angular/core";

export type Framework = "angular" | "vue";

export const FRAMEWORKS: readonly { value: Framework; label: string }[] = [
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue / Nuxt" },
];

const STORAGE_KEY = "sone-docs-framework";

const isFramework = (value: unknown): value is Framework =>
  value === "angular" || value === "vue";

/**
 * The framework the component pages show code for, shared by every page and kept in
 * localStorage. Prerendered HTML is always Angular: `restore()` runs after hydration
 * (from `afterNextRender`) and only then switches, so the server and client markup agree.
 * A `?framework=vue` (or `angular`) query parameter wins over the stored choice.
 */
@Injectable({ providedIn: "root" })
export class FrameworkService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private restored = false;

  readonly framework = signal<Framework>("angular");

  /** Applies the query parameter or the stored choice, once per session. */
  restore(): void {
    if (!this.browser || this.restored) return;
    this.restored = true;
    const fromQuery = this.fromQuery();
    if (fromQuery) {
      this.set(fromQuery);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isFramework(stored)) this.framework.set(stored);
    } catch {
      // Blocked storage: Angular until the reader picks another framework.
    }
  }

  set(framework: Framework): void {
    this.framework.set(framework);
    if (!this.browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, framework);
    } catch {
      // Private mode or blocked storage: the choice lasts for this visit only.
    }
  }

  private fromQuery(): Framework | null {
    try {
      const value = new URL(this.document.location.href).searchParams.get(
        "framework",
      );
      return isFramework(value) ? value : null;
    } catch {
      return null;
    }
  }
}
