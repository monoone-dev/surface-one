import { definePart } from "../../utils/part";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SoneSeparatorOwnProps {
  readonly orientation?: SeparatorOrientation;
  /** A purely visual rule (`role="none"`, the default); `false` makes it a semantic separator. */
  readonly decorative?: boolean;
}

/** `[soneSeparator]` */
export const SoneSeparator = definePart<"div", SoneSeparatorOwnProps>({
  name: "SoneSeparator",
  tag: "div",
  className: "separator",
  slot: "separator",
  props: ["orientation", "decorative"],
  attrs: ({ orientation = "horizontal", decorative = true }) => ({
    "data-orientation": orientation,
    role: decorative ? "none" : "separator",
    "aria-orientation": decorative ? undefined : orientation,
  }),
});
