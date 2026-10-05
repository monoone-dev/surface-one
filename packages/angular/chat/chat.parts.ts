import { SONE_MARKER_PARTS } from "@surface-one/angular/marker";
import { SONE_CHAT_PANE_PARTS } from "./chat-pane.directive";
import { SoneChatComposerSubmitComponent } from "./chat-composer-submit/chat-composer-submit.component";
import {
  SoneChatComposerComponent,
  SoneChatComposerInputDirective,
  SoneChatComposerToolsDirective,
} from "./chat-composer/chat-composer.component";
import {
  SoneChatMessageComponent,
  SoneChatMessageContentDirective,
} from "./chat-message/chat-message.component";
import { SoneChatThreadComponent } from "./chat-thread/chat-thread.component";
import { SoneSuggestionChipsComponent } from "./suggestion-chips/suggestion-chips.component";
import { SoneTypingIndicatorComponent } from "./typing-indicator/typing-indicator.component";

export {
  SoneChatPaneActionsDirective,
  SoneChatPaneDescriptionDirective,
  SoneChatPaneDirective,
  SoneChatPaneHeaderDirective,
  SoneChatPaneHeadingDirective,
  SoneChatPaneTitleDirective,
} from "./chat-pane.directive";
export {
  SoneMarkerContentDirective,
  SoneMarkerDirective,
  SoneMarkerIconDirective,
} from "@surface-one/angular/marker";
export {
  SoneChatComposerComponent,
  SoneChatComposerInputDirective,
  SoneChatComposerSubmitComponent,
  SoneChatComposerToolsDirective,
  SoneChatMessageComponent,
  SoneChatMessageContentDirective,
  SoneChatThreadComponent,
  SoneSuggestionChipsComponent,
  SoneTypingIndicatorComponent,
};

export const SONE_CHAT_PARTS = [
  ...SONE_CHAT_PANE_PARTS,
  SoneChatThreadComponent,
  SoneChatMessageComponent,
  SoneChatMessageContentDirective,
  SoneTypingIndicatorComponent,
  ...SONE_MARKER_PARTS,
  SoneChatComposerComponent,
  SoneChatComposerInputDirective,
  SoneChatComposerSubmitComponent,
  SoneChatComposerToolsDirective,
  SoneSuggestionChipsComponent,
] as const;
