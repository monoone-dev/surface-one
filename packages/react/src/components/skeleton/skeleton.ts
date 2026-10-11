import { definePart } from "../../utils/part";

/** `[soneSkeleton]` */
export const SoneSkeleton = definePart({
  name: "SoneSkeleton",
  tag: "div",
  className: "skeleton",
  slot: "skeleton",
  static: { "aria-hidden": "true" },
});
