import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { type MarkdownBlock, renderBlocks } from "./markdown-render";

export type MarkdownSize = "default" | "sm";

@Component({
  selector: "sone-markdown",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./markdown.component.html",
  host: {
    class: "markdown",
    "data-slot": "markdown",
    "[attr.data-size]": "size()",
  },
})
export class SoneMarkdownComponent {
  readonly source = input<string | null | undefined>("");
  readonly size = input<MarkdownSize>("default");
  readonly breaks = input(true, { transform: booleanAttribute });

  private readonly cache = new Map<string, string>();

  protected readonly blocks = computed<MarkdownBlock[]>(() =>
    renderBlocks(this.source() ?? "", { breaks: this.breaks() }, this.cache),
  );
}
