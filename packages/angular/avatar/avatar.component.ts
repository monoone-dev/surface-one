import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  contentChild,
  input,
  signal,
} from "@angular/core";

export type AvatarSize = "sm" | "default" | "lg";

@Directive({
  selector: "img[soneAvatarImage]",
  host: {
    class: "avatar-image",
    "data-slot": "avatar-image",
    "(load)": "status.set('loaded')",
    "(error)": "status.set('error')",
  },
})
export class SoneAvatarImageDirective {
  readonly status = signal<"loading" | "loaded" | "error">("loading");
}

@Directive({
  selector: "[soneAvatarFallback]",
  host: { class: "avatar-fallback", "data-slot": "avatar-fallback" },
})
export class SoneAvatarFallbackDirective {}

@Component({
  selector: "sone-avatar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "avatar",
    "data-slot": "avatar",
    "[attr.data-size]": "size()",
  },
  templateUrl: "./avatar.component.html",
})
export class SoneAvatarComponent {
  readonly size = input<AvatarSize>("default");
  private readonly image = contentChild(SoneAvatarImageDirective);
  private readonly fallback = contentChild(SoneAvatarFallbackDirective);
  protected readonly showImage = computed(
    () => this.image()?.status() === "loaded",
  );
  protected readonly showPlaceholder = computed(
    () => !this.showImage() && !this.fallback(),
  );
}

export const SONE_AVATAR_PARTS = [
  SoneAvatarComponent,
  SoneAvatarImageDirective,
  SoneAvatarFallbackDirective,
] as const;
