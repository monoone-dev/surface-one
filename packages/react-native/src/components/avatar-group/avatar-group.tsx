import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { View, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneAvatarImage,
  type AvatarSize,
  type SoneAvatarProps,
} from "../avatar/avatar";
import { SoneText } from "../../theme/foreground";

/** The initials of a name or an email: "Ada Lovelace" → "AL", "ada@x.io" → "A"; "?" when empty. */
export function soneInitials(name: string | null | undefined, max = 2): string {
  const words = (name ?? "")
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+/u, ""))
    .filter(Boolean);
  if (!words.length) return "?";
  const picked =
    words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
  return picked
    .slice(0, max)
    .map((w) => Array.from(w)[0] ?? "")
    .join("")
    .toLocaleUpperCase();
}

export interface AvatarGroupPerson {
  readonly key?: string;
  /** Names the avatar and gives its initials. */
  readonly name?: string;
  /** The image uri. */
  readonly src?: string;
}

export interface SoneAvatarGroupProps extends ViewProps {
  /** People to draw as avatars (image, then initials); or pass `SoneAvatar` children. */
  readonly people?: readonly AvatarGroupPerson[];
  /** How many avatars show before the "+N" one. */
  readonly max?: number;
  readonly size?: AvatarSize;
  /** The overflow avatar's accessible name: default "+N". */
  readonly overflowLabel?: (hidden: number) => string;
}

/**
 * `<sone-avatar-group>` — overlapping avatars with a "+N" for the rest, as one labelled
 * group. Give `people`, or `SoneAvatar` children (their `size` is set to the group's).
 */
export function SoneAvatarGroup({
  people,
  max = 4,
  size = "default",
  overflowLabel = (n) => `+${n}`,
  style,
  children,
  ...rest
}: SoneAvatarGroupProps): ReactElement {
  const t = useSoneTheme().tokens;
  const avatars: ReactNode[] = people
    ? people.map((p, i) => (
        <SoneAvatar
          key={p.key ?? `${p.name ?? ""}-${i}`}
          size={size}
          aria-label={p.name}
          role="img"
        >
          {p.src ? <SoneAvatarImage source={{ uri: p.src }} /> : null}
          <SoneAvatarFallback>{soneInitials(p.name)}</SoneAvatarFallback>
        </SoneAvatar>
      ))
    : Children.toArray(children).map((c) =>
        isValidElement(c) && c.type === SoneAvatar
          ? cloneElement(c as ReactElement<SoneAvatarProps>, { size })
          : c,
      );
  const shown = avatars.slice(0, max);
  const hidden = avatars.length - shown.length;
  // `.avatar` sizes are fixed; the overlap is a third of the avatar.
  const px = { sm: 24, default: 32, lg: 40 }[size];
  const ring = {
    borderWidth: t.borderWidthThick,
    borderColor: t.surfaceBase,
    borderRadius: t.radiusPill,
  } as const;
  const wrap = (node: ReactNode, i: number) => (
    <View key={i} style={[ring, i > 0 && { marginLeft: -Math.round(px / 3) }]}>
      {node}
    </View>
  );
  return (
    <View
      role="group"
      {...rest}
      style={[{ flexDirection: "row", alignItems: "center" }, style]}
    >
      {shown.map(wrap)}
      {hidden > 0
        ? wrap(
            <SoneAvatar
              size={size}
              role="img"
              aria-label={overflowLabel(hidden)}
            >
              <SoneAvatarFallback>
                <SoneText aria-hidden>{`+${hidden}`}</SoneText>
              </SoneAvatarFallback>
            </SoneAvatar>,
            shown.length,
          )
        : null}
    </View>
  );
}
