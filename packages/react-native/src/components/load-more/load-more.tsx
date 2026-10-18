import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { SoneText, useForeground } from "../../theme/foreground";
import { SoneSpinner } from "../spinner/spinner";
import { SoneButton } from "../button/button";

export type LoadMoreAlign = "start" | "center";

export interface SoneLoadMoreProps extends Omit<ViewProps, "children"> {
  /** The next page is loading. */
  readonly busy?: boolean;
  /** How many items are left; shown in the label, and `0` hides the control. `null` = unknown. */
  readonly remaining?: number | null;
  /** Why the last load failed; shown above a retry button. */
  readonly error?: string | null;
  /** Default: the "Show more" message. */
  readonly label?: string | null;
  /** Default: the "Loading…" message. */
  readonly busyLabel?: string | null;
  /** Default: the "Try again" message. */
  readonly retryLabel?: string | null;
  readonly align?: LoadMoreAlign;
  /** Load the next page (or retry the failed one). Never called while `busy`. */
  readonly onLoad?: () => void;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-load-more>` — the "Show more" button at the end of a paged list (or under a
 * `FlatList` as its footer). It calls `onLoad`; the owner fetches the next page and sets
 * `busy` meanwhile (the button shows a spinner with `busyLabel`). `remaining` adds the
 * count left — "Show more (12)" — and hides the whole thing at 0. When the last page
 * failed, set `error`: the message is announced and the button becomes `retryLabel`.
 */
export function SoneLoadMore({
  busy = false,
  remaining = null,
  error = null,
  label = null,
  busyLabel = null,
  retryLabel = null,
  align = "center",
  onLoad,
  style,
  ...rest
}: SoneLoadMoreProps) {
  const { tokens: t } = useSoneTheme();
  const messages = useSoneMessages();
  if (remaining === 0 && !error && !busy) return null;
  let text: string;
  if (busy) text = busyLabel ?? messages.showMoreBusy;
  else if (error) text = retryLabel ?? messages.showMoreRetry;
  else {
    const base = label ?? messages.showMore;
    text = remaining === null ? base : `${base} (${remaining})`;
  }
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "column",
          alignItems: align === "start" ? "flex-start" : "center",
          gap: t.space1,
          paddingVertical: t.space2,
        },
        style,
      ]}
    >
      {error ? (
        <SoneText
          role="alert"
          aria-live="assertive"
          style={{
            color: t.dangerText,
            fontSize: t.fontSizeSm,
            lineHeight: Math.round(t.fontSizeSm * t.leadingNormal),
          }}
        >
          {error}
        </SoneText>
      ) : null}
      <SoneButton
        variant="ghost"
        size="sm"
        disabled={busy}
        aria-busy={busy || undefined}
        onPress={() => {
          if (!busy) onLoad?.();
        }}
      >
        {busy ? <SoneSpinner label={null} /> : null}
        {text}
      </SoneButton>
    </View>
  );
}
