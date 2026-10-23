import type { ReactElement } from "react";
import { View, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SoneSeparatorProps extends ViewProps {
  readonly orientation?: SeparatorOrientation;
  /** A purely visual rule (`role="none"`, the default); `false` makes it a semantic separator. */
  readonly decorative?: boolean;
}

/** `[soneSeparator]` — a hairline across (or, `vertical`, down) its container. */
export function SoneSeparator({
  orientation = "horizontal",
  decorative = true,
  style,
  ...rest
}: SoneSeparatorProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      role={decorative ? "none" : "separator"}
      aria-hidden={decorative || undefined}
      {...rest}
      style={[
        { flexShrink: 0, backgroundColor: t.border },
        orientation === "horizontal"
          ? { height: t.borderWidthThin, width: "100%" }
          : { width: t.borderWidthThin, alignSelf: "stretch" },
        style,
      ]}
    />
  );
}
