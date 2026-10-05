import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  contentChild,
  inject,
  input,
} from "@angular/core";
import {
  SoneBubbleContentDirective,
  SoneBubbleDirective,
  type BubbleVariant,
} from "@surface-one/angular/bubble";
import { SoneMessageContentDirective } from "@surface-one/angular/message";

export type ChatMessageFrom = "user" | "assistant";

@Directive({
  selector: "[soneChatMessageContent]",
  hostDirectives: [SoneBubbleContentDirective],
  host: { "[attr.aria-label]": "ariaLabel()" },
})
export class SoneChatMessageContentDirective {
  readonly label = input<string | undefined>(undefined);

  private readonly message = inject(SoneChatMessageComponent, {
    optional: true,
  });

  protected readonly ariaLabel = computed(
    () =>
      this.label() ??
      (this.message?.from() === "user"
        ? $localize`You said`
        : $localize`Assistant said`),
  );
}

@Component({
  selector: "sone-chat-message",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneMessageContentDirective, SoneBubbleDirective],
  host: {
    "data-slot": "message",
    "[attr.data-align]": "align()",
    "[attr.data-from]": "from()",
    "[class.is-user]": "from() === 'user'",
    "[class.is-assistant]": "from() === 'assistant'",
  },
  templateUrl: "./chat-message.component.html",
})
export class SoneChatMessageComponent {
  readonly from = input.required<ChatMessageFrom>();
  readonly variant = input<BubbleVariant | null>(null);

  protected readonly align = computed(() =>
    this.from() === "user" ? "end" : "start",
  );
  protected readonly bubbleVariant = computed<BubbleVariant>(
    () => this.variant() ?? (this.from() === "user" ? "default" : "ghost"),
  );
  protected readonly hasText = computed(() => !!this.text());
  private readonly text = contentChild(SoneChatMessageContentDirective);
}
