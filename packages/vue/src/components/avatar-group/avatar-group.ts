import { cloneVNode, defineComponent, h, type PropType, type VNode } from "vue";

import {
  avatarGroupSplit,
  soneInitials,
  type AvatarGroupPerson,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { flatten } from "../../utils/vnodes";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneAvatarImage,
  type AvatarSize,
} from "../avatar/avatar";

export { soneInitials, type AvatarGroupPerson } from "@surface-one/core";

/**
 * `<sone-avatar-group>` — overlapping avatars with a "+N" one for the rest, as one
 * labelled group (the web twin of the React Native `SoneAvatarGroup`). Give `people`
 * or `SoneAvatar` children (their `size` is set to the group's); at most `max` show.
 * Name the group with `ariaLabel`; the overflow avatar is named by `overflowLabel`.
 */
export const SoneAvatarGroup = defineComponent({
  name: "SoneAvatarGroup",
  props: {
    /** People to draw as avatars (image, then initials); or pass `SoneAvatar` children. */
    people: {
      type: Array as PropType<readonly AvatarGroupPerson[] | null>,
      default: null,
    },
    /** How many avatars show before the "+N" one. */
    max: { type: Number, default: 4 },
    size: { type: String as PropType<AvatarSize>, default: "default" },
    /** Names the group. */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** The overflow avatar's accessible name (default: the "N more" message). */
    overflowLabel: {
      type: Function as PropType<((hidden: number) => string) | null>,
      default: null,
    },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    return () => {
      const people = props.people ?? [];
      const children = flatten(slots.default?.()).filter(
        (node) => node.type === SoneAvatar,
      );
      const { shown, hidden } = avatarGroupSplit(
        people.length + children.length,
        props.max,
      );
      const avatars: VNode[] = [
        ...people.map((person, i) =>
          h(
            SoneAvatar,
            {
              key: person.key ?? `person-${i}`,
              size: props.size,
              role: person.name ? "img" : undefined,
              "aria-label": person.name ?? undefined,
            },
            () => [
              person.src
                ? h(SoneAvatarImage, { src: person.src, alt: "" })
                : null,
              h(SoneAvatarFallback, { "aria-hidden": "true" }, () =>
                soneInitials(person.name),
              ),
            ],
          ),
        ),
        ...children.map((child) => cloneVNode(child, { size: props.size })),
      ].slice(0, shown);
      const label = props.overflowLabel ?? messages.value.avatarGroupOverflow;
      return h(
        "sone-avatar-group",
        {
          class: "avatar-group",
          "data-slot": "avatar-group",
          role: "group",
          "data-size": props.size,
          "aria-label": props.ariaLabel ?? undefined,
        },
        [
          ...avatars,
          hidden > 0
            ? h(
                SoneAvatar,
                {
                  class: "avatar-group-overflow",
                  "data-slot": "avatar-group-overflow",
                  role: "img",
                  size: props.size,
                  "aria-label": label(hidden),
                },
                () =>
                  h(
                    SoneAvatarFallback,
                    { "aria-hidden": "true" },
                    () => `+${hidden}`,
                  ),
              )
            : null,
        ],
      );
    };
  },
});
