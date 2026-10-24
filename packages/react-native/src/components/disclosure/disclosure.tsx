import { useId, type ReactNode, type ReactElement } from "react";
import {
  Pressable,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  textChildren,
  useForeground,
} from "../../theme/foreground";
import { em, padding, shadow, weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneIcon } from "../icon/icon";

export interface SoneDisclosureProps extends Omit<ViewProps, "children"> {
  /** Shown or not, controlled with `onOpenChange`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly disabled?: boolean;
  /** Names the panel region; by default the trigger does. */
  readonly panelLabel?: string | null;
  /** The trigger's content (a string becomes its label). */
  readonly summary?: ReactNode;
  /** The panel. */
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-disclosure>` — a show / hide section (one accordion item): `summary` is the
 * trigger, the children the panel. `open` / `defaultOpen` / `onOpenChange`.
 */
export function SoneDisclosure({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  panelLabel = null,
  summary,
  children,
  style,
  ...rest
}: SoneDisclosureProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const fg = useForeground();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const focus = useFocusRing();
  const triggerId = `sone-disclosure-${useId()}-trigger`;
  const bg = open ? t.disclosureOpenBg : t.disclosureBg;
  const rotate = open ? t.disclosureIconRotateOpen : t.disclosureIconRotate;
  return (
    <View {...rest} style={[{ flexDirection: "column" }, style]}>
      <Pressable
        role="button"
        nativeID={triggerId}
        aria-expanded={open}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        onPress={() => {
          if (!disabled) setOpen(!open);
        }}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: t.disclosureGap,
            width: "100%",
            paddingVertical: t.disclosurePy,
            paddingHorizontal: t.disclosurePx,
            backgroundColor: bg,
            borderWidth: t.borderWidthThin,
            borderColor: t.disclosureBorder,
            borderRadius: t.disclosureRadius,
          },
          pressed && !disabled && { borderColor: t.disclosureHoverBorder },
          open && {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomColor: "transparent",
          },
          focus.focused && {
            borderColor: t.accentEdge,
            ...shadow(t.focusRing),
          },
          disabled && { opacity: t.disabledOpacity },
        ]}
      >
        {({ pressed }) => {
          const active = pressed && !disabled;
          const chevron = (
            <View
              aria-hidden
              style={{ transform: [{ rotate: `${rotate}deg` }] }}
            >
              <SoneIcon
                name="chevron-right"
                color={active ? t.disclosureIconHover : undefined}
              />
            </View>
          );
          return (
            <SoneForegroundProvider
              value={{
                color: active ? t.textPrimary : t.disclosureFg,
                fontSize: t.fontSizeSm,
                fontWeight: weight(t.fontWeightMedium),
              }}
            >
              {/* `--disclosure-icon-order`: the chevron before (0) or after the summary. */}
              {t.disclosureIconOrder > 0 ? null : chevron}
              <View style={{ flex: 1, minWidth: 0 }}>
                {textChildren(summary)}
              </View>
              {t.disclosureIconOrder > 0 ? chevron : null}
            </SoneForegroundProvider>
          );
        }}
      </Pressable>
      <View
        role="region"
        aria-labelledby={panelLabel ? undefined : triggerId}
        aria-label={panelLabel ?? undefined}
        style={[
          {
            flexDirection: "column",
            gap: t.disclosurePanelGap,
            ...padding(t.disclosurePanelP),
            borderWidth: t.borderWidthThin,
            borderTopWidth: 0,
            borderColor: t.disclosureBorder,
            borderBottomLeftRadius: t.disclosureRadius,
            borderBottomRightRadius: t.disclosureRadius,
            backgroundColor: bg,
          },
          !open && { display: "none" },
        ]}
      >
        <SoneForegroundProvider
          value={{ fontSize: em(t.disclosurePanelFontSize, fg.fontSize) }}
        >
          {textChildren(children)}
        </SoneForegroundProvider>
      </View>
    </View>
  );
}
