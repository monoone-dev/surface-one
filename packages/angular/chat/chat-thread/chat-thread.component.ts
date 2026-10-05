import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
} from "@angular/core";

@Component({
  selector: "sone-chat-thread",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "chat-thread",
    role: "log",
    "aria-live": "polite",
    "[attr.aria-label]": "label()",
  },
  templateUrl: "./chat-thread.component.html",
})
export class SoneChatThreadComponent {
  readonly label = input($localize`Conversation`);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  scrollToEnd(): void {
    const el = this.host.nativeElement;
    el.scrollTop = el.scrollHeight;
  }
}
