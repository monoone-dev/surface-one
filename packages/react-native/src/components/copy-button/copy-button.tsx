import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import {
  SoneButton,
  type ButtonSize,
  type ButtonVariant,
} from "../button/button";
import { SoneIcon } from "../icon/icon";

/** The browser's clipboard (react-native-web); a device has none built in. */
async function webClipboard(value: string): Promise<void> {
  const clipboard = (
    globalThis as {
      navigator?: { clipboard?: { writeText?(v: string): Promise<void> } };
    }
  ).navigator?.clipboard;
  if (!clipboard?.writeText)
    throw new Error("SoneCopyButton needs a `copy` function on this platform");
  await clipboard.writeText(value);
}

export interface SoneCopyButtonProps extends Omit<ViewProps, "children"> {
  /** The text to copy. */
  readonly value: string;
  /**
   * Writes it to the clipboard — React Native has none built in:
   * `copy={(text) => Clipboard.setStringAsync(text)}` (expo-clipboard) or
   * `@react-native-clipboard/clipboard`. On the web the browser's is the default.
   */
  readonly copy?: (text: string) => void | Promise<void>;
  /** Default: the "Copy" message. */
  readonly label?: string | null;
  /** Default: the "Copied" message. */
  readonly copiedLabel?: string | null;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize | null;
  readonly iconOnly?: boolean;
  readonly disabled?: boolean;
  /** How long "Copied" shows, in ms. */
  readonly resetAfter?: number;
  /** The value was copied. */
  readonly onCopied?: (value: string) => void;
  /** The clipboard refused. */
  readonly onCopyError?: (error: unknown) => void;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-copy-button>` — copies `value` on press, shows "Copied" for `resetAfter` ms
 * and announces it (a polite live region; an announcement on iOS).
 */
export function SoneCopyButton({
  value,
  copy = webClipboard,
  label: labelProp = null,
  copiedLabel: copiedProp = null,
  variant = "outline",
  size = null,
  iconOnly = false,
  disabled = false,
  resetAfter = 1500,
  onCopied,
  onCopyError,
  style,
  ...rest
}: SoneCopyButtonProps) {
  const messages = useSoneMessages();
  const [isCopied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = (): void => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clearTimer, []);

  const label = labelProp ?? messages.copy;
  const copiedLabel = copiedProp ?? messages.copied;
  const text = isCopied ? copiedLabel : label;

  const run = async (): Promise<void> => {
    try {
      await copy(value);
    } catch (error) {
      clearTimer();
      setCopied(false);
      onCopyError?.(error);
      return;
    }
    setCopied(true);
    onCopied?.(value);
    // iOS has no live regions: say it.
    if (Platform.OS === "ios")
      AccessibilityInfo.announceForAccessibility(copiedLabel);
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      setCopied(false);
    }, resetAfter);
  };

  return (
    <View {...rest} style={[{ flexDirection: "row", flexShrink: 0 }, style]}>
      <SoneButton
        variant={variant}
        size={size ?? (iconOnly ? "icon-sm" : "sm")}
        disabled={disabled}
        aria-label={iconOnly ? text : undefined}
        onPress={() => void run()}
      >
        <SoneIcon name={isCopied ? "check" : "copy"} />
        {iconOnly ? null : text}
      </SoneButton>
      <Text aria-live="polite" style={styles.srOnly}>
        {isCopied ? copiedLabel : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Read, not drawn (`.sr-only`).
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0,
  },
});
