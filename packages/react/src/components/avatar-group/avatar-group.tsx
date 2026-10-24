"use client";

import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  avatarGroupSplit,
  soneInitials,
  type AvatarGroupPerson,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneAvatarImage,
  type AvatarSize,
  type SoneAvatarProps,
} from "../avatar/avatar";

export { soneInitials, type AvatarGroupPerson } from "@surface-one/core";

export interface SoneAvatarGroupProps extends HTMLAttributes<HTMLElement> {
  /** People to draw as avatars (image, then initials); or pass `SoneAvatar` children. */
  readonly people?: readonly AvatarGroupPerson[] | null;
  /** How many avatars show before the "+N" one. */
  readonly max?: number;
  readonly size?: AvatarSize;
  /** Names the group. */
  readonly ariaLabel?: string | null;
  /** The overflow avatar's accessible name (default: the "N more" message). */
  readonly overflowLabel?: ((hidden: number) => string) | null;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-avatar-group>` — overlapping avatars with a "+N" one for the rest, as one
 * labelled group (the web twin of the React Native `SoneAvatarGroup`). Give `people`
 * or `SoneAvatar` children (their `size` is set to the group's); at most `max` show.
 * Name the group with `ariaLabel`; the overflow avatar is named by `overflowLabel`.
 */
export function SoneAvatarGroup({
  people,
  max = 4,
  size = "default",
  ariaLabel = null,
  overflowLabel = null,
  className,
  children,
  ...rest
}: SoneAvatarGroupProps): ReactElement {
  const messages = useSoneMessages();
  const list = people ?? [];
  const kids = Children.toArray(children).filter(
    (c): c is ReactElement<SoneAvatarProps> =>
      isValidElement(c) && c.type === SoneAvatar,
  );
  const { shown, hidden } = avatarGroupSplit(list.length + kids.length, max);
  const avatars = [
    ...list.map((person, i) => (
      <SoneAvatar
        key={person.key ?? `person-${i}`}
        size={size}
        role={person.name ? "img" : undefined}
        aria-label={person.name ?? undefined}
      >
        {person.src ? <SoneAvatarImage src={person.src} alt="" /> : null}
        <SoneAvatarFallback aria-hidden="true">
          {soneInitials(person.name)}
        </SoneAvatarFallback>
      </SoneAvatar>
    )),
    ...kids.map((child) => cloneElement(child, { size })),
  ].slice(0, shown);
  const label = overflowLabel ?? messages.avatarGroupOverflow;
  return createElement(
    "sone-avatar-group",
    {
      "data-slot": "avatar-group",
      role: "group",
      "data-size": size,
      "aria-label": ariaLabel ?? undefined,
      ...rest,
      className: ["avatar-group", className].filter(Boolean).join(" "),
    },
    avatars,
    hidden > 0 ? (
      <SoneAvatar
        className="avatar-group-overflow"
        data-slot="avatar-group-overflow"
        role="img"
        size={size}
        aria-label={label(hidden)}
      >
        <SoneAvatarFallback aria-hidden="true">{`+${hidden}`}</SoneAvatarFallback>
      </SoneAvatar>
    ) : null,
  );
}
