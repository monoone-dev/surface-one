import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

import { I18n } from "../i18n/i18n.service";
import { highlight } from "./highlight";

/** A code sample with a language label and a copy button (announced politely). */
@Component({
  selector: "docs-code",
  imports: [SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code">
      <div class="code-bar">
        <span class="code-lang">{{ lang() }}</span>
        <button
          soneBtn
          type="button"
          variant="ghost"
          size="icon-xs"
          class="needs-js"
          [attr.aria-label]="i18n.m().a11y.copyCode"
          (click)="copy()"
        >
          <sone-icon [icon]="copied() ? 'check' : 'copy'" size="xs" />
        </button>
        <span class="sr-only" aria-live="polite">{{
          copied() ? i18n.m().a11y.copied : ""
        }}</span>
      </div>
      <pre
        tabindex="0"
        [attr.aria-label]="lang() + ' code'"
      >@if (html(); as h) {<code class="hljs" [innerHTML]="h"></code>} @else {<code>{{ code() }}</code>}</pre>
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin: var(--space-4) 0;
    }
    .code {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface-raised);
    }
    .code-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px var(--space-2) 2px var(--space-3);
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: var(--font-size-xs);
    }
    pre {
      margin: 0;
      padding: var(--space-3) var(--space-4);
      overflow-x: auto;
      font-size: var(--font-size-sm);
      line-height: 1.6;
    }
    pre:focus-visible {
      outline-offset: -2px;
    }
  `,
})
export class CodeBlockComponent {
  protected readonly i18n = inject(I18n);
  readonly code = input.required<string>();
  readonly lang = input("ts");
  protected readonly copied = signal(false);
  protected readonly html = computed(() => highlight(this.code(), this.lang()));

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    } catch {
      // Clipboard blocked: the code stays selectable.
    }
  }
}
