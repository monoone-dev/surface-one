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
/** `circle` (the default) or `square` — a rounded square for a team, a workspace or an app. */
export type AvatarShape = "circle" | "square";

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
    "[attr.data-shape]": "shape() === 'square' ? 'square' : null",
  },
  templateUrl: "./avatar.component.html",
})
export class SoneAvatarComponent {
  readonly size = input<AvatarSize>("default");
  /** `square`: a rounded square (a team, a workspace, an app) instead of a circle. */
  readonly shape = input<AvatarShape>("circle");
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
