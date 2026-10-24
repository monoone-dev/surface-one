import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  numberAttribute,
} from "@angular/core";
import {
  SONE_AVATAR_PARTS,
  SoneAvatarComponent,
  type AvatarSize,
} from "@surface-one/angular/avatar";

import {
  avatarGroupSplit,
  soneInitials,
  type AvatarGroupPerson,
} from "./avatar-group-people";

/**
 * `<sone-avatar-group>` — overlapping avatars with a "+N" one for the rest, as one
 * labelled group (the web twin of the React Native `SoneAvatarGroup`). Give `people`
 * (each an image with initials as its fallback, named by `name`), or project
 * `sone-avatar` children; at most `max` show and the group's `size` applies to all.
 * Name the group with `ariaLabel`; the overflow avatar is named by `overflowLabel`
 * ("3 more").
 */
@Component({
  selector: "sone-avatar-group",
  imports: [...SONE_AVATAR_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./avatar-group.component.html",
  host: {
    class: "avatar-group",
    "data-slot": "avatar-group",
    role: "group",
    "[attr.data-size]": "size()",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class SoneAvatarGroupComponent {
  /** People to draw as avatars (image, then initials); or project `sone-avatar` children. */
  readonly people = input<readonly AvatarGroupPerson[] | null>(null);
  /** How many avatars show before the "+N" one. */
  readonly max = input(4, { transform: (v: unknown) => numberAttribute(v, 4) });
  readonly size = input<AvatarSize>("default");
  /** Names the group ("Project members"). */
  readonly ariaLabel = input<string | null>(null);
  /** The overflow avatar's accessible name. */
  readonly overflowLabel = input<(hidden: number) => string>(
    (n) =>
      $localize`:The avatars an avatar group does not show:${n}:count: more`,
  );

  private readonly children = contentChildren(SoneAvatarComponent, {
    read: ElementRef,
  });
  private readonly renderer = inject(Renderer2);

  private readonly split = computed(() =>
    avatarGroupSplit(
      (this.people()?.length ?? 0) + this.children().length,
      this.max(),
    ),
  );
  protected readonly shownPeople = computed(() =>
    (this.people() ?? []).slice(0, this.split().shown),
  );
  protected readonly hidden = computed(() => this.split().hidden);
  protected readonly initials = soneInitials;

  constructor() {
    // Projected avatars past `max` stay in the DOM (they are the caller's), hidden.
    effect(() => {
      const room = this.split().shown - this.shownPeople().length;
      this.children().forEach((ref, i) => {
        const el = ref.nativeElement as HTMLElement;
        if (i < room) this.renderer.removeAttribute(el, "hidden");
        else this.renderer.setAttribute(el, "hidden", "");
      });
    });
  }
}
