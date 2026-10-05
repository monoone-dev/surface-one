import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneBannerComponent } from "@surface-one/angular/banner";

const TEMPLATE = `<div class="demo-stack" style="max-width: 34rem">
  <sone-banner kind="info">The model download resumes when you’re back online.</sone-banner>
  <sone-banner kind="success">Exported to your notes folder.</sone-banner>
  <sone-banner kind="warning">
    <strong>Live captions stopped.</strong> Recording continues and the full transcript runs after Stop.
  </sone-banner>
  <sone-banner kind="danger">Couldn’t reach the server. Your transcript is safe.</sone-banner>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-banner-demo",
  imports: [SoneBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BannerDemo {}
