import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneLogoComponent } from "@surface-one/angular/logo";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: flex-end">
    <sone-logo size="xs" />
    <sone-logo size="sm" />
    <sone-logo />
    <sone-logo size="lg" label="Surface One" />
  </div>
  <div class="demo-row" style="align-items: center">
    <!-- kind="mark": the bare mark without the app tile -->
    <sone-logo kind="mark" size="sm" />
    <sone-logo kind="mark" />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-logo-demo",
  imports: [SoneLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class LogoDemo {}
