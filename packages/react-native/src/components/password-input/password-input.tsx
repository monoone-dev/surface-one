import type { ReactElement } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { useControllable } from "@surface-one/core/react/controllable";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import type { SoneGlyph } from "../icon/glyph";
import { SONE_GLYPHS } from "../icon/glyphs.generated";
import {
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  type SoneInputGroupInputProps,
} from "../input/input-group";

export type PasswordAutocomplete = "current-password" | "new-password" | "off";

/** The eye struck through — the glyph the web twin draws while the password shows. */
const EYE_OFF: SoneGlyph = {
  ...SONE_GLYPHS.eye,
  children: [...SONE_GLYPHS.eye.children, ["path", { d: "M3.5 3.5l17 17" }]],
};

export interface SonePasswordInputProps extends Omit<
  SoneInputGroupInputProps,
  "secureTextEntry" | "autoComplete" | "style"
> {
  /** Shown as text (controlled), with `onVisibleChange`; or `defaultVisible`. */
  readonly visible?: boolean;
  readonly defaultVisible?: boolean;
  readonly onVisibleChange?: (visible: boolean) => void;
  readonly autoComplete?: PasswordAutocomplete;
  readonly invalid?: boolean;
  /** The toggle's name (default: the "Show password" message). */
  readonly toggleLabel?: string | null;
  /** The frame. */
  readonly style?: StyleProp<ViewStyle>;
  /** The text field. */
  readonly inputStyle?: StyleProp<TextStyle>;
}

/**
 * `<sone-password-input>` — a password field with a show / hide toggle button (checked
 * while the password shows): `value` / `defaultValue` / `onValueChange` and `visible` /
 * `defaultVisible` / `onVisibleChange`. Every other prop goes to the `TextInput`.
 */
export function SonePasswordInput({
  visible: visibleProp,
  defaultVisible = false,
  onVisibleChange,
  autoComplete = "current-password",
  invalid,
  disabled,
  toggleLabel,
  style,
  inputStyle,
  ...control
}: SonePasswordInputProps): ReactElement {
  const messages = useSoneMessages();
  const t = useSoneTheme().tokens;
  const [visible, setVisible] = useControllable(
    visibleProp,
    defaultVisible,
    onVisibleChange,
  );
  const label = toggleLabel ?? messages.showPassword;
  return (
    <SoneInputGroup invalid={invalid} disabled={disabled} style={style}>
      <SoneInputGroupInput
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        {...control}
        disabled={disabled}
        secureTextEntry={!visible}
        autoComplete={autoComplete}
        textContentType={
          autoComplete === "new-password"
            ? "newPassword"
            : autoComplete === "off"
              ? "none"
              : "password"
        }
        style={inputStyle}
      />
      <SoneInputGroupAddon align="inline-end">
        <SoneButton
          variant="ghost"
          size="icon-xs"
          disabled={disabled}
          aria-label={label}
          aria-checked={visible}
          onPress={() => setVisible(!visible)}
          style={{ borderRadius: t.inputGroupButtonRadius }}
        >
          <SoneIcon glyph={visible ? EYE_OFF : SONE_GLYPHS.eye} />
        </SoneButton>
      </SoneInputGroupAddon>
    </SoneInputGroup>
  );
}
