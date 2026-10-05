import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneDownloadProgressComponent } from "@surface-one/angular/download-progress";

const TEMPLATE = `<div class="demo-stack" style="max-width: 26rem">
  @if (cancelled()) {
    <div class="demo-row">
      <span style="color: var(--text-secondary)">Download cancelled.</span>
      <button soneBtn type="button" size="sm" variant="outline" (click)="cancelled.set(false)">Retry</button>
    </div>
  } @else {
    <sone-download-progress
      [frac]="0.42"
      cancellable
      ariaLabel="Example model download"
      (cancelRequested)="cancelled.set(true)"
    />
  }
  <sone-download-progress [frac]="null" label="Preparing…" ariaLabel="Preparing files" />
  <sone-download-progress label="Example-3B" separator=" · " [frac]="0.63" ariaLabel="Example-3B download" />
  <sone-download-progress size="md" [frac]="0.7" ariaLabel="Setup progress" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-download-progress-demo",
  imports: [SoneDownloadProgressComponent, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DownloadProgressDemo {
  readonly cancelled = signal(false);
}
