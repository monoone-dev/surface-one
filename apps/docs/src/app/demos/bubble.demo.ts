import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  type BubbleVariant,
  SONE_BUBBLE_PARTS,
} from "@surface-one/angular/bubble";

const TEMPLATE = `<div class="demo-stack" style="max-width: 480px; width: 100%">
  <div soneBubbleGroup>
    @for (variant of variants; track variant) {
      <div soneBubble [variant]="variant">
        <div soneBubbleContent>{{ variant }} — the agenda is in the shared doc.</div>
      </div>
    }
  </div>
  <div soneBubble align="end">
    <div soneBubbleContent>Aligned to the end, for the current user.</div>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-bubble-demo",
  imports: [...SONE_BUBBLE_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BubbleDemo {
  readonly variants: readonly BubbleVariant[] = [
    "default",
    "secondary",
    "muted",
    "tinted",
    "outline",
    "ghost",
    "destructive",
  ];
}
