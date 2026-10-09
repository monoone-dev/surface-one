import { definePart } from "../../utils/part";

export const SonePageHeader = definePart({
  name: "SonePageHeader",
  tag: "header",
  className: "page-header",
  slot: "page-header",
});

export const SonePageHeaderContent = definePart({
  name: "SonePageHeaderContent",
  tag: "div",
  className: "page-header-content",
  slot: "page-header-content",
});

export const SonePageHeaderEyebrow = definePart({
  name: "SonePageHeaderEyebrow",
  tag: "p",
  className: "page-header-eyebrow section-label",
  slot: "page-header-eyebrow",
});

export const SonePageHeaderTitle = definePart({
  name: "SonePageHeaderTitle",
  tag: "h1",
  className: "page-header-title",
  slot: "page-header-title",
});

export const SonePageHeaderDescription = definePart({
  name: "SonePageHeaderDescription",
  tag: "p",
  className: "page-header-description",
  slot: "page-header-description",
});

export const SonePageHeaderActions = definePart({
  name: "SonePageHeaderActions",
  tag: "div",
  className: "page-header-actions",
  slot: "page-header-actions",
});
