import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import {
  agentClock,
  agentElapsed,
  agentGlyph,
  agentHue,
  agentInitials,
  agentIsoTime,
  agentStateIsActive,
  agentStateIsBusy,
  durationLabel,
  followLog,
  type AgentEntryKind,
  type AgentFrom,
  type AgentState,
  type AgentTime,
  type AgentTone,
  type LogFollower,
} from "@surface-one/angular/format";

// The shared behaviour of the two agent conversation views — `@surface-one/angular/terminal`
// and `@surface-one/angular/agent-chat`. Both families extend these bases, so their inputs and
// outputs are the same by construction and an app swaps one view for the other part by part.

/** The localised sentence an agent status says for `state`. */
export function agentStatusSentence(
  state: AgentState,
  speaker: string | null,
): string {
  const s = speaker ?? "";
  switch (state) {
    case "working":
      return s
        ? $localize`:Agent status, busy:${s}:speaker: is working`
        : $localize`:Agent status, busy (no name):Working`;
    case "thinking":
      return s
        ? $localize`:Agent status, reasoning:${s}:speaker: is thinking`
        : $localize`:Agent status, reasoning (no name):Thinking`;
    case "waiting":
      return s
        ? $localize`:Agent status, needs the person:${s}:speaker: is waiting for you`
        : $localize`:Agent status, needs the person (no name):Waiting for you`;
    case "done":
      return s
        ? $localize`:Agent status, finished:${s}:speaker: is done`
        : $localize`:Agent status, finished (no name):Done`;
    case "error":
      return s
        ? $localize`:Agent status, failed:${s}:speaker: stopped with an error`
        : $localize`:Agent status, failed (no name):Stopped with an error`;
    default:
      return s
        ? $localize`:Agent status, idle:${s}:speaker: is ready`
        : $localize`:Agent status, idle (no name):Ready`;
  }
}

/** One entry of a conversation: the inputs of `sone-terminal-line` and `sone-agent-chat-message`. */
@Directive({
  host: {
    "[attr.data-from]": "from()",
    "[attr.data-kind]": "kind()",
    "[attr.data-tone]": "tone() === 'default' ? null : tone()",
    "[style.--agent-hue]": "hueColor()",
  },
})
export abstract class SoneAgentEntryBase {
  /** Who wrote it: the person (`user`), an `agent`, or the `system`. */
  readonly from = input<AgentFrom>("agent");
  /** `message` is something said; `activity` is a quiet line of tool work. */
  readonly kind = input<AgentEntryKind>("message");
  /** The speaker's name; the person's defaults to “You”. */
  readonly speaker = input<string | null>(null);
  /** Who the person (or an agent) spoke to: “You → Lead”. */
  readonly to = input<string | null>(null);
  /** When it was said: a `Date`, epoch milliseconds or an ISO string. */
  readonly time = input<AgentTime | null>(null);
  /** `danger` for a failed command, `success` / `warning` for an outcome. */
  readonly tone = input<AgentTone>("default");
  /** The mark in front of the text; `❯` for the person, `›` for activity. `""` hides it. */
  readonly glyph = input<string | null>(null);
  /** A speaker colour, `1`–`8` (the chart hues), so each agent keeps its own. */
  readonly hue = input<number | null>(null);

  protected readonly who = computed(
    () =>
      this.speaker() ??
      (this.from() === "user"
        ? $localize`:The person in an agent conversation:You`
        : null),
  );
  protected readonly toLabel = $localize`:Before the recipient of a message (You → Lead):to`;
  protected readonly clock = computed(() => agentClock(this.time()));
  protected readonly iso = computed(() => agentIsoTime(this.time()));
  protected readonly mark = computed(() =>
    agentGlyph(this.from(), this.kind(), this.glyph()),
  );
  protected readonly hueColor = computed(() => agentHue(this.hue()));
  protected readonly initials = computed(() => agentInitials(this.who()));
}

/** A run boundary or a turn summary: `Run started · 14:47`, `Done · 32 turns · 3m 45s`. */
@Directive({
  host: {
    "[attr.data-tone]": "tone() === 'default' ? null : tone()",
  },
})
export abstract class SoneAgentDividerBase {
  readonly time = input<AgentTime | null>(null);
  readonly tone = input<AgentTone>("default");

  protected readonly clock = computed(() => agentClock(this.time()));
  protected readonly iso = computed(() => agentIsoTime(this.time()));
}

/**
 * The scrolling log: a polite live region that follows the newest line while the reader is at
 * the bottom and lets go when they scroll up, offering “Jump to newest”.
 */
@Directive()
export abstract class SoneAgentLogBase {
  /** The log's accessible name. */
  readonly label = input<string | null>(null);
  /** Stay pinned to the newest line while the reader is there. */
  readonly follow = input(true, { transform: booleanAttribute });

  protected readonly jumpLabel = $localize`:Scrolls an agent log back to its newest line:Jump to newest`;
  protected readonly atEnd = signal(true);
  protected readonly viewport =
    viewChild.required<ElementRef<HTMLElement>>("viewport");

  private follower: LogFollower | null = null;

  constructor() {
    afterNextRender(() => {
      this.follower = followLog(
        this.viewport().nativeElement,
        (atEnd) => this.atEnd.set(atEnd),
        () => this.follow(),
      );
    });
    inject(DestroyRef).onDestroy(() => this.follower?.destroy());
  }

  /** Scroll to the newest line and follow it again. */
  scrollToEnd(smooth = true): void {
    this.follower?.jump(smooth);
  }
}

/**
 * What the agent is doing right now — the line that answers “is it working?”. Its sentence is a
 * polite `role="status"`; the running time is a separate `role="timer"`, so a screen reader is
 * told when the state changes, never on every tick.
 */
@Directive({
  host: {
    "[attr.data-state]": "state()",
    "[attr.data-active]": "active() ? '' : null",
    "[attr.data-busy]": "busy() ? '' : null",
    "[style.--agent-hue]": "hueColor()",
  },
})
export abstract class SoneAgentStatusBase {
  readonly state = input<AgentState>("idle");
  /** Who it is about: “Lead is working”. */
  readonly speaker = input<string | null>(null);
  /** When the current state began; a running time is shown while the agent is active. */
  readonly since = input<AgentTime | null>(null);
  /** Replaces the built-in sentence. */
  readonly label = input<string | null>(null);
  /** The speaker colour, `1`–`8`. */
  readonly hue = input<number | null>(null);

  // Starts at null: the server and the first client render show no time, so hydration
  // matches; the browser ticks once a second from then on.
  private readonly now = signal<number | null>(null);

  protected readonly active = computed(() => agentStateIsActive(this.state()));
  protected readonly busy = computed(() => agentStateIsBusy(this.state()));
  protected readonly sentence = computed(
    () => this.label() ?? agentStatusSentence(this.state(), this.speaker()),
  );
  protected readonly seconds = computed(() =>
    this.active() ? agentElapsed(this.since(), this.now()) : null,
  );
  protected readonly elapsed = computed(() => {
    const s = this.seconds();
    return s === null ? null : durationLabel(s);
  });
  protected readonly elapsedIso = computed(() => {
    const s = this.seconds();
    return s === null ? null : `PT${s}S`;
  });
  protected readonly timerLabel = $localize`:The running time of an agent's current state:Time in this state`;
  protected readonly hueColor = computed(() => agentHue(this.hue()));
  protected readonly initials = computed(() => agentInitials(this.speaker()));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.now.set(Date.now());
      const tick = setInterval(() => this.now.set(Date.now()), 1000);
      destroyRef.onDestroy(() => clearInterval(tick));
    });
  }
}

/** The prompt box: a form around a projected textarea; `submitted` fires on Enter or the send button. */
@Directive()
export abstract class SoneAgentPromptBase {
  /** Fires when the person sends (Enter, or a submit button inside). */
  readonly submitted = output<void>();

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit();
  }
}

/** The prompt's textarea: Enter sends, Shift+Enter breaks the line, IME composition is left alone. */
@Directive({
  host: {
    rows: "1",
    "[attr.aria-label]": "ariaLabel()",
    "(keydown)": "onKeydown($event)",
  },
})
export abstract class SoneAgentPromptInputBase {
  /** The field's accessible name (it has no visible label). */
  readonly ariaLabel = input<string | null>(
    $localize`:The prompt field of an agent conversation:Message`,
  );

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    (event.target as HTMLTextAreaElement).form?.requestSubmit();
  }
}
