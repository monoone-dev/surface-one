import { h, type VNode } from "vue";

import { pageLinkRel, pageLinkVariant, type PageLink } from "@surface-one/core";

import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

/** The page blocks' calls to action: links drawn as buttons, as in Angular. */
export function renderPageLinks(
  links: readonly PageLink[],
  size: "sm" | "default" | "lg",
): VNode[] {
  return links.map((link, i) =>
    h(
      SoneButton,
      {
        key: i,
        as: "a",
        variant: pageLinkVariant(link, i),
        size: link.size ?? size,
        href: link.href,
        target: link.target,
        rel: pageLinkRel(link) ?? undefined,
      },
      () => [
        link.icon ? h(SoneIcon, { icon: link.icon }) : null,
        link.label,
        link.trailingIcon ? h(SoneIcon, { icon: link.trailingIcon }) : null,
      ],
    ),
  );
}
