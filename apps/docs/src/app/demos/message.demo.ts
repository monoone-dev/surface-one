import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SONE_BUBBLE_PARTS } from "@surface-one/angular/bubble";
import { SONE_MESSAGE_PARTS } from "@surface-one/angular/message";

const TEMPLATE = `<div soneMessageGroup style="max-width: 520px; width: 100%">
  <div soneMessage>
    <sone-avatar soneMessageAvatar size="sm"><span soneAvatarFallback>AP</span></sone-avatar>
    <div soneMessageContent>
      <div soneMessageHeader>Ada Park · 10:04</div>
      <div soneBubble variant="muted">
        <div soneBubbleContent>Can we move the beta invite to next sprint?</div>
      </div>
    </div>
  </div>
  <div soneMessage align="end">
    <sone-avatar soneMessageAvatar size="sm"><span soneAvatarFallback>LR</span></sone-avatar>
    <div soneMessageContent>
      <div soneBubble align="end">
        <div soneBubbleContent>Yes, if the invite copy lands by Friday.</div>
      </div>
      <div soneMessageFooter>Read</div>
    </div>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-message-demo",
  imports: [...SONE_MESSAGE_PARTS, ...SONE_BUBBLE_PARTS, ...SONE_AVATAR_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MessageDemo {}
