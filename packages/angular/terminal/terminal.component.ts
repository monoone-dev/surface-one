import { ChangeDetectionStrategy, Component, Directive } from "@angular/core";
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

/**
 * `<sone-terminal>` — the frame of an agent conversation shown as a terminal: a monospace log
 * (`<sone-terminal-log>`), the agent's live status (`<sone-terminal-status>`) and the prompt
 * (`<sone-terminal-prompt>`). `<sone-agent-chat>` takes the very same parts as a chat.
 */
@Component({
  selector: "sone-terminal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "terminal" },
  template: "<ng-content />",
})
export class SoneTerminalComponent {}

/** `<sone-terminal-log>` — the scrolling `role="log"`: follows the newest line, offers “Jump to newest”. */
@Component({
  selector: "sone-terminal-log",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  host: { "data-slot": "terminal-log" },
  templateUrl: "./terminal-log.component.html",
})
export class SoneTerminalLogComponent extends SoneAgentLogBase {
  protected readonly defaultLabel = $localize`:A terminal's log of an agent conversation:Terminal`;
}

/**
 * `<sone-terminal-line>` — one entry: time, speaker (`You → Lead`), glyph and text. The person's
 * lines stand out (a tinted row, an accent bar, the `❯` prompt); `kind="activity"` is a quiet,
 * one-line record of tool work. `[soneTerminalLineMeta]` sits at the end of the line,
 * `[soneTerminalLineDetail]` under it (an expanded body, a command's output).
 */
@Component({
  selector: "sone-terminal-line",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "terminal-line" },
  templateUrl: "./terminal-line.component.html",
})
export class SoneTerminalLineComponent extends SoneAgentEntryBase {}

/** Trailing content of a line: a metric, a badge, a “show more” toggle. */
@Directive({
  selector: "[soneTerminalLineMeta]",
  host: { "data-slot": "terminal-line-meta-item" },
})
export class SoneTerminalLineMetaDirective {}

/** Content under a line: its expanded body or a command's output. */
@Directive({
  selector: "[soneTerminalLineDetail]",
  host: { "data-slot": "terminal-line-detail-item" },
})
export class SoneTerminalLineDetailDirective {}

/** `<sone-terminal-divider>` — a run boundary or a turn summary across the log. */
@Component({
  selector: "sone-terminal-divider",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "terminal-divider" },
  templateUrl: "./terminal-divider.component.html",
})
export class SoneTerminalDividerComponent extends SoneAgentDividerBase {}

/**
 * `<sone-terminal-status>` — what the agent is doing right now: an animated mark, the sentence
 * (“Lead is working”), the running time and a slot for actions (`[soneTerminalStatusActions]`,
 * e.g. Interrupt). While the agent is busy the whole terminal shows a sweeping line.
 */
@Component({
  selector: "sone-terminal-status",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "terminal-status" },
  templateUrl: "./terminal-status.component.html",
})
export class SoneTerminalStatusComponent extends SoneAgentStatusBase {}

/** Actions at the end of the status line (Interrupt, Stop). */
@Directive({
  selector: "[soneTerminalStatusActions]",
  host: { "data-slot": "terminal-status-action" },
})
export class SoneTerminalStatusActionsDirective {}

/** `<sone-terminal-prompt>` — the `❯` prompt around a `textarea[soneTerminalPromptInput]`. */
@Component({
  selector: "sone-terminal-prompt",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "terminal-prompt" },
  templateUrl: "./terminal-prompt.component.html",
})
export class SoneTerminalPromptComponent extends SoneAgentPromptBase {}

/** The prompt's field: Enter sends, Shift+Enter breaks the line. */
@Directive({
  selector: "textarea[soneTerminalPromptInput]",
  host: { "data-slot": "terminal-prompt-input" },
})
export class SoneTerminalPromptInputDirective extends SoneAgentPromptInputBase {}

/** Buttons and selects at the end of the prompt (model, send). */
@Directive({
  selector: "[soneTerminalPromptActions]",
  host: { "data-slot": "terminal-prompt-action" },
})
export class SoneTerminalPromptActionsDirective {}

export const SONE_TERMINAL_PARTS = [
  SoneTerminalComponent,
  SoneTerminalLogComponent,
  SoneTerminalLineComponent,
  SoneTerminalLineMetaDirective,
  SoneTerminalLineDetailDirective,
  SoneTerminalDividerComponent,
  SoneTerminalStatusComponent,
  SoneTerminalStatusActionsDirective,
  SoneTerminalPromptComponent,
  SoneTerminalPromptInputDirective,
  SoneTerminalPromptActionsDirective,
] as const;
