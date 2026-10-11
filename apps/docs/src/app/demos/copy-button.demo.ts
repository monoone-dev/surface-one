import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneCopyButtonComponent } from "@surface-one/angular/copy-button";

const TEMPLATE = `<div class="demo-row" style="align-items: center">
  <sone-copy-button value="npm install @surface-one/angular" />
  <sone-copy-button value="mtg_01J9ZK3Q7R4M2" label="Copy meeting ID" iconOnly variant="ghost" />
  <sone-copy-button value="{ &quot;mcpServers&quot;: {} }" label="Copy config" variant="secondary" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-copy-button-demo",
  imports: [SoneCopyButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CopyButtonDemo {}
