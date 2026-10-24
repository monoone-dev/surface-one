import { useState, type ReactElement } from "react";
import {
  Image,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneStyles } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { useControllable } from "@surface-one/core/react/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneSpinner } from "../spinner/spinner";

export interface SoneImagePickerProps {
  /** The picked image's uri (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  /** A pick, or `undefined` once the image is removed. */
  readonly onValueChange?: (uri: string | undefined) => void;
  /**
   * Opens the app's picker and resolves the chosen image's uri — `undefined` for a
   * cancel. The package has no picker of its own:
   * `pick={async () => (await ImagePicker.launchImageLibraryAsync()).assets?.[0]?.uri}`
   * (expo-image-picker), a remote-search sheet, a URL prompt …
   */
  readonly pick: () => string | undefined | Promise<string | undefined>;
  /** Shown in the empty field. */
  readonly label?: string;
  /** The name of the button that replaces the image. */
  readonly changeLabel?: string;
  /** The name of the button that removes the image. */
  readonly removeLabel?: string;
  /** Shown when the image fails to load. */
  readonly errorLabel?: string;
  /** Width over height of the field. */
  readonly aspectRatio?: number;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  /** `pick` rejected. */
  readonly onPickError?: (error: unknown) => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-image-picker>` — a tappable image field: a dashed placeholder, then the image
 * with change and remove buttons. The app injects `pick` (the package has no native
 * dependency); `value` / `defaultValue` / `onValueChange`.
 */
export function SoneImagePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  pick,
  label = "Add image",
  changeLabel = "Change image",
  removeLabel = "Remove image",
  errorLabel = "Image unavailable",
  aspectRatio = 16 / 9,
  disabled = false,
  invalid = false,
  onPickError,
  style,
  testID,
}: SoneImagePickerProps): ReactElement {
  const [value, setValue] = useControllable<string | undefined>(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const focus = useFocusRing();
  const s = useSoneStyles(
    (th) => {
      const t = th.tokens;
      return {
        box: {
          aspectRatio,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          gap: t.space2,
          borderWidth: t.borderWidthThin,
          borderColor: t.inputBorder,
          borderRadius: t.radiusLg,
          backgroundColor: t.inputBg,
        } as ViewStyle,
        center: {
          alignItems: "center",
          justifyContent: "center",
          gap: t.space2,
        } as ViewStyle,
        empty: { borderStyle: "dashed" } as ViewStyle,
        pressed: { backgroundColor: t.surfaceHover } as ViewStyle,
        focused: {
          borderColor: t.accentEdge,
          boxShadow: t.focusRing,
        } as ViewStyle,
        invalid: { borderColor: t.invalidBorder } as ViewStyle,
        disabled: { opacity: t.disabledOpacity } as ViewStyle,
        fill: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        } as const,
        actions: {
          position: "absolute",
          top: t.space2,
          right: t.space2,
          flexDirection: "row",
          gap: t.space2,
        } as ViewStyle,
        fg: {
          color: t.textSecondary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
          iconSize: t.controlIcon + t.space1,
        },
      };
    },
    [aspectRatio],
  );

  const run = async (): Promise<void> => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      const uri = await pick();
      if (uri) setValue(uri);
    } catch (error) {
      onPickError?.(error);
    } finally {
      setBusy(false);
    }
  };
  const hasImage = !!value;
  const broken = hasImage && failed === value;

  return (
    <View
      testID={testID}
      style={[
        s.box,
        !hasImage && s.empty,
        invalid && s.invalid,
        disabled && s.disabled,
        style,
      ]}
    >
      {hasImage ? (
        <>
          {broken ? null : (
            <Image
              source={{ uri: value }}
              resizeMode="cover"
              aria-hidden
              onError={() => setFailed(value ?? null)}
              style={s.fill}
            />
          )}
          {broken ? (
            <SoneForegroundProvider value={s.fg}>
              <SoneIcon name="eye" />
              <SoneText>{errorLabel}</SoneText>
            </SoneForegroundProvider>
          ) : null}
          <View style={s.actions}>
            <SoneButton
              variant="secondary"
              size="icon-sm"
              aria-label={changeLabel}
              disabled={disabled || busy}
              onPress={() => void run()}
            >
              {busy ? <SoneSpinner label={null} /> : <SoneIcon name="edit" />}
            </SoneButton>
            <SoneButton
              variant="secondary"
              size="icon-sm"
              aria-label={removeLabel}
              disabled={disabled || busy}
              onPress={() => setValue(undefined)}
            >
              <SoneIcon name="close" />
            </SoneButton>
          </View>
        </>
      ) : (
        <Pressable
          role="button"
          aria-label={label}
          aria-busy={busy || undefined}
          aria-disabled={disabled || undefined}
          disabled={disabled || busy}
          onPress={() => void run()}
          onFocus={focus.onFocus}
          onBlur={focus.onBlur}
          style={({ pressed }) => [
            s.fill,
            s.center,
            pressed && s.pressed,
            focus.focused && s.focused,
          ]}
        >
          <SoneForegroundProvider value={s.fg}>
            {busy ? <SoneSpinner label={null} /> : <SoneIcon name="plus" />}
            <SoneText>{label}</SoneText>
          </SoneForegroundProvider>
        </Pressable>
      )}
    </View>
  );
}
