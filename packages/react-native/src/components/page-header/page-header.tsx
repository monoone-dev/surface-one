import type { ReactElement } from "react";
import { View, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";
import {
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { em, textTransform, weight } from "../../theme/style";

// `.page-header-content { flex: 1 1 20rem }`.
const CONTENT_BASIS = 320;

/** `[sonePageHeader]` — the title block of a screen, with its actions beside it (they wrap below when narrow). */
export function SonePageHeader({ style, ...rest }: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          rowGap: t.space3,
          columnGap: t.space5,
          marginBottom: t.space5,
        },
        style,
      ]}
    />
  );
}

/** `[sonePageHeaderContent]` — the eyebrow, title and description. */
export function SonePageHeaderContent({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: CONTENT_BASIS,
          gap: t.space1,
          minWidth: 0,
        },
        style,
      ]}
    >
      {textChildren(children)}
    </View>
  );
}

/** `[sonePageHeaderEyebrow]` — a small section label above the title. */
export function SonePageHeaderEyebrow({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize: t.sectionLabelSize,
          fontWeight: weight(t.sectionLabelWeight),
          letterSpacing: em(t.sectionLabelTracking, t.sectionLabelSize),
          lineHeight: Math.round(t.sectionLabelSize * t.leadingSm),
          textTransform: textTransform(t.sectionLabelTransform),
        },
        style,
      ]}
    />
  );
}

/** `[sonePageHeaderTitle]` — the screen's heading. */
export function SonePageHeaderTitle({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  const fontSize = t.pageHeaderTitleSize;
  return (
    <SoneText
      role="heading"
      {...rest}
      style={[
        {
          color: t.textPrimary,
          fontSize,
          fontWeight: weight(t.fontWeightSemibold),
          letterSpacing: em(t.trackingHeading, fontSize),
          lineHeight: Math.round(fontSize * t.pageHeaderTitleLeading),
        },
        style,
      ]}
    />
  );
}

/** `[sonePageHeaderDescription]` */
export function SonePageHeaderDescription({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
        },
        style,
      ]}
    />
  );
}

/** `[sonePageHeaderActions]` — the buttons of the header. */
export function SonePageHeaderActions({
  style,
  ...rest
}: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexShrink: 0,
          flexWrap: "wrap",
          alignItems: "center",
          gap: t.space2,
        },
        style,
      ]}
    />
  );
}
