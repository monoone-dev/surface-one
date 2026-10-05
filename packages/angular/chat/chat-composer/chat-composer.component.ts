import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  input,
  output,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";

export type ChatComposerLayout = "inline" | "block";

@Component({
  selector: "sone-chat-composer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...SONE_INPUT_GROUP_PARTS, NgTemplateOutlet],
  host: {
    "data-slot": "chat-composer",
    "[attr.data-layout]": "layout()",
  },
  templateUrl: "./chat-composer.component.html",
})
export class SoneChatComposerComponent {
  readonly layout = input<ChatComposerLayout>("inline");
  readonly submitted = output<void>();

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit();
  }
}

@Directive({
  selector: "textarea[soneChatComposerInput]",
  host: {
    "data-slot": "input-group-control",
    "(input)": "onInput($event)",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneChatComposerInputDirective {
  readonly draftInput = output<string>();

  private readonly composer = inject(SoneChatComposerComponent);

  protected onInput(event: Event): void {
    this.draftInput.emit((event.target as HTMLTextAreaElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.composer.submitted.emit();
    }
  }
}

@Directive({
  selector: "[soneChatComposerTools]",
  host: { "data-slot": "chat-composer-tool" },
})
export class SoneChatComposerToolsDirective {}
