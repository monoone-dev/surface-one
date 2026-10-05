import { Directive, input } from "@angular/core";

export type MessageAlign = "start" | "end";

@Directive({
  selector: "[soneMessage]",
  host: { "data-slot": "message", "[attr.data-align]": "align()" },
})
export class SoneMessageDirective {
  readonly align = input<MessageAlign>("start");
}

@Directive({
  selector: "[soneMessageAvatar]",
  host: { "data-slot": "message-avatar" },
})
export class SoneMessageAvatarDirective {}

@Directive({
  selector: "[soneMessageContent]",
  host: { "data-slot": "message-content" },
})
export class SoneMessageContentDirective {}

@Directive({
  selector: "[soneMessageHeader]",
  host: { "data-slot": "message-header" },
})
export class SoneMessageHeaderDirective {}

@Directive({
  selector: "[soneMessageFooter]",
  host: { "data-slot": "message-footer" },
})
export class SoneMessageFooterDirective {}

@Directive({
  selector: "[soneMessageGroup]",
  host: { "data-slot": "message-group" },
})
export class SoneMessageGroupDirective {}

export const SONE_MESSAGE_PARTS = [
  SoneMessageDirective,
  SoneMessageAvatarDirective,
  SoneMessageContentDirective,
  SoneMessageHeaderDirective,
  SoneMessageFooterDirective,
  SoneMessageGroupDirective,
] as const;
