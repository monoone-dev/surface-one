import { definePart } from "../../utils/part";

export const SoneSkeleton = definePart({
  name: "SoneSkeleton",
  tag: "div",
  className: "skeleton",
  slot: "skeleton",
  static: { "aria-hidden": "true" },
});
