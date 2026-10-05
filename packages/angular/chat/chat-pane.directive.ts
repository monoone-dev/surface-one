import { Directive, booleanAttribute, input } from "@angular/core";

@Directive({
  selector: "[soneChatPane]",
  host: {
    "data-slot": "chat-pane",
    "[class.card]": "!bare()",
    "[attr.data-bare]": "bare() ? '' : null",
  },
})
export class SoneChatPaneDirective {
  readonly bare = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "[soneChatPaneHeader]",
  host: { "data-slot": "chat-pane-header" },
})
export class SoneChatPaneHeaderDirective {}

@Directive({
  selector: "[soneChatPaneHeading]",
  host: { "data-slot": "chat-pane-heading" },
})
export class SoneChatPaneHeadingDirective {}

@Directive({
  selector: "[soneChatPaneTitle]",
  host: { "data-slot": "chat-pane-title" },
})
export class SoneChatPaneTitleDirective {}

@Directive({
  selector: "[soneChatPaneDescription]",
  host: { "data-slot": "chat-pane-description" },
})
export class SoneChatPaneDescriptionDirective {}

@Directive({
  selector: "[soneChatPaneActions]",
  host: { "data-slot": "chat-pane-actions" },
})
export class SoneChatPaneActionsDirective {}

export const SONE_CHAT_PANE_PARTS = [
  SoneChatPaneDirective,
  SoneChatPaneHeaderDirective,
  SoneChatPaneHeadingDirective,
  SoneChatPaneTitleDirective,
  SoneChatPaneDescriptionDirective,
  SoneChatPaneActionsDirective,
] as const;
