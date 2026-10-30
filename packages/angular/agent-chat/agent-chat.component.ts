import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  contentChild,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SoneAgentDividerBase,
  SoneAgentEntryBase,
  SoneAgentLogBase,
  SoneAgentPromptBase,
  SoneAgentPromptInputBase,
  SoneAgentStatusBase,
} from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneAgentChatQuestionComponent } from "./agent-chat-question.component";
import { SoneAgentChatThoughtComponent } from "./agent-chat-thought.component";

/**
 * `<sone-agent-chat>` — the frame of an agent conversation shown as a chat: the thread
 * (`<sone-agent-chat-log>`), the agent's live status (`<sone-agent-chat-status>`) and the composer
 * (`<sone-agent-chat-composer>`). Every part takes the same inputs as its `<sone-terminal>` twin,
 * so an app switches between the two views without touching its data.
 */
@Component({
  selector: "sone-agent-chat",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "agent-chat" },
  template: "<ng-content />",
})
export class SoneAgentChatComponent {}

/** `<sone-agent-chat-log>` — the scrolling `role="log"`: follows the newest message, offers “Jump to newest”. */
@Component({
  selector: "sone-agent-chat-log",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  host: { "data-slot": "agent-chat-log" },
  templateUrl: "./agent-chat-log.component.html",
})
export class SoneAgentChatLogComponent extends SoneAgentLogBase {
  protected readonly defaultLabel = $localize`:The thread of an agent conversation:Conversation`;
}

/** What stands in a message's avatar instead of the speaker's initials, such as the mark of the app that spoke. */
@Directive({
  selector: "[soneAgentChatMessageAvatar]",
  host: { "data-slot": "agent-chat-message-avatar-item" },
})
export class SoneAgentChatMessageAvatarDirective {}

/**
 * `<sone-agent-chat-message>` — one entry. The person's messages are accent bubbles on the right;
 * an agent's sit on the left under its avatar, name and time; `kind="activity"` is a quiet line
 * of tool work with no bubble. `[soneAgentChatMessageMeta]` sits at the end of the bubble,
 * `[soneAgentChatMessageDetail]` under it (an expanded body, a command's output), and
 * `[soneAgentChatMessageAvatar]` replaces the initials in the avatar.
 */
@Component({
  selector: "sone-agent-chat-message",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "agent-chat-message" },
  templateUrl: "./agent-chat-message.component.html",
})
export class SoneAgentChatMessageComponent extends SoneAgentEntryBase {
  protected readonly customAvatar = contentChild(
    SoneAgentChatMessageAvatarDirective,
  );
  protected readonly activityMark = computed(() =>
    this.kind() === "activity" ? this.mark() : null,
  );
}

/** Trailing content of a message: a metric, a badge, a “show more” toggle. */
@Directive({
  selector: "[soneAgentChatMessageMeta]",
  host: { "data-slot": "agent-chat-message-meta-item" },
})
export class SoneAgentChatMessageMetaDirective {}

/** Content under a message: its expanded body or a command's output. */
@Directive({
  selector: "[soneAgentChatMessageDetail]",
  host: { "data-slot": "agent-chat-message-detail-item" },
})
export class SoneAgentChatMessageDetailDirective {}

/** `<sone-agent-chat-divider>` — a run boundary or a turn summary across the thread. */
@Component({
  selector: "sone-agent-chat-divider",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "agent-chat-divider" },
  templateUrl: "./agent-chat-divider.component.html",
})
export class SoneAgentChatDividerComponent extends SoneAgentDividerBase {}

/**
 * `<sone-agent-chat-status>` — what the agent is doing right now, under the thread: its avatar
 * (ringed while busy), an animated mark, the sentence (“Lead is working”), the running time and
 * a slot for actions (`[soneAgentChatStatusActions]`, e.g. Interrupt).
 */
@Component({
  selector: "sone-agent-chat-status",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent],
  host: { "data-slot": "agent-chat-status" },
  templateUrl: "./agent-chat-status.component.html",
})
export class SoneAgentChatStatusComponent extends SoneAgentStatusBase {}

/** Actions next to the status (Interrupt, Stop). */
@Directive({
  selector: "[soneAgentChatStatusActions]",
  host: { "data-slot": "agent-chat-status-action" },
})
export class SoneAgentChatStatusActionsDirective {}

/** `<sone-agent-chat-composer>` — the message box around a `textarea[soneAgentChatComposerInput]`. */
@Component({
  selector: "sone-agent-chat-composer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "agent-chat-composer" },
  templateUrl: "./agent-chat-composer.component.html",
})
export class SoneAgentChatComposerComponent extends SoneAgentPromptBase {}

/** The composer's field: Enter sends, Shift+Enter breaks the line. */
@Directive({
  selector: "textarea[soneAgentChatComposerInput]",
  host: { "data-slot": "agent-chat-composer-input" },
})
export class SoneAgentChatComposerInputDirective extends SoneAgentPromptInputBase {}

/** Buttons and selects at the end of the composer (model, send). */
@Directive({
  selector: "[soneAgentChatComposerActions]",
  host: { "data-slot": "agent-chat-composer-action" },
})
export class SoneAgentChatComposerActionsDirective {}

export const SONE_AGENT_CHAT_PARTS = [
  SoneAgentChatComponent,
  SoneAgentChatLogComponent,
  SoneAgentChatMessageComponent,
  SoneAgentChatMessageAvatarDirective,
  SoneAgentChatMessageMetaDirective,
  SoneAgentChatMessageDetailDirective,
  SoneAgentChatDividerComponent,
  SoneAgentChatStatusComponent,
  SoneAgentChatStatusActionsDirective,
  SoneAgentChatComposerComponent,
  SoneAgentChatComposerInputDirective,
  SoneAgentChatComposerActionsDirective,
  SoneAgentChatQuestionComponent,
  SoneAgentChatThoughtComponent,
] as const;
