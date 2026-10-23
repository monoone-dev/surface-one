import type { ReactNode, ReactElement } from "react";
import { View, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";
import { SoneText } from "../../theme/foreground";
import { em, weight } from "../../theme/style";
import { SoneBadge } from "../badge/badge";

export type SectionHeadingLevel = 2 | 3 | 4;

export interface SoneSectionHeadingProps extends ViewProps {
  readonly title: string;
  /** A count in a secondary badge after the title; `null` hides it. */
  readonly count?: number | string | null;
  /** The heading level: 2, 3 or 4 (the size; native headings have no level). */
  readonly level?: SectionHeadingLevel | `${SectionHeadingLevel}`;
  /** The end of the row. */
  readonly actions?: ReactNode;
}

/**
 * `<sone-section-heading>` — the heading row of a page section: a heading named by its
 * `title` alone, an optional `count` in a secondary badge after it (read after the
 * name), and `actions` at the end of the row.
 */
export function SoneSectionHeading({
  title,
  count = null,
  level: levelProp = 2,
  actions,
  style,
  ...rest
}: SoneSectionHeadingProps): ReactElement {
  const t = useSoneTheme().tokens;
  const level = Number(levelProp);
  const fontSize =
    level === 3 ? t.fontSizeMd : level === 4 ? t.fontSizeSm : t.fontSizeLg;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          rowGap: t.space2,
          columnGap: t.space3,
          minWidth: 0,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: t.space2,
          minWidth: 0,
        }}
      >
        <SoneText
          role="heading"
          numberOfLines={1}
          style={{
            flexShrink: 1,
            color: t.textPrimary,
            fontSize,
            fontWeight: weight(t.fontWeightSemibold),
            letterSpacing: em(t.trackingHeading, fontSize),
            lineHeight: Math.round(fontSize * t.leadingTight),
          }}
        >
          {title}
        </SoneText>
        {count !== null && (
          <SoneBadge variant="secondary">{String(count)}</SoneBadge>
        )}
      </View>
      {actions != null && actions !== false && (
        <View
          style={{
            flexDirection: "row",
            flexShrink: 0,
            alignItems: "center",
            gap: t.space2,
            marginLeft: "auto",
          }}
        >
          {actions}
        </View>
      )}
    </View>
  );
}
