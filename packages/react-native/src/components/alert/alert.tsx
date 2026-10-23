import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type ReactNode,
  type ReactElement,
} from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme, type SoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { weight } from "../../theme/style";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { mix, over } from "../../utils/color";

export type AlertVariant =
  "default" | "destructive" | "warning" | "success" | "info";

export type AlertActionsAlign = "start" | "center" | "end";

/** The colours of one variant — the `.alert[data-variant]` rules, `color-mix()` computed. */
export interface AlertLook {
  readonly background: string;
  readonly border: string;
  /** The alert's ink (the title inherits it in a status variant). */
  readonly color: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

export function alertLook(theme: SoneTheme, variant: AlertVariant): AlertLook {
  const t = theme.tokens;
  if (variant === "default")
    return {
      background: t.surfaceRaised,
      border: t.alertBorder,
      color: t.alertFg,
      icon: t.alertFg,
      title: t.textPrimary,
      description: t.textSecondary,
    };
  const [hue, ink, soft, edge] = {
    destructive: [t.danger, t.dangerText, t.dangerSoft, t.alertDangerBorder],
    warning: [t.warning, t.warningText, t.warningSoft, t.alertWarningBorder],
    success: [t.success, t.successText, t.successSoft, t.alertSuccessBorder],
    info: [t.accent, t.accentText, t.accentSoft, t.alertInfoBorder],
  }[variant];
  const color = mix(t.textPrimary, ink, t.alertStatusNeutral);
  return {
    background: over(mix(soft, "transparent", t.alertTint), t.surfaceRaised),
    border: mix(edge, t.alertBorder, t.alertTint),
    color,
    icon: mix(hue, t.textPrimary, t.alertIconHue),
    title: color,
    // `--alert-status-description` (most skins: the ink at 90%).
    description: mix(color, "transparent", 0.9),
  };
}

/** The box of `.alert` — shared with `SoneBanner`. */
export function alertBox(theme: SoneTheme, look: AlertLook): ViewStyle {
  const t = theme.tokens;
  return {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: t.alertGap,
    paddingVertical: t.alertPy,
    paddingHorizontal: t.alertPx,
    borderWidth: t.borderWidthThin,
    borderColor: look.border,
    borderRadius: t.alertRadius,
    backgroundColor: look.background,
  };
}

const AlertContext = createContext<AlertLook | null>(null);

export interface SoneAlertProps extends ViewProps {
  readonly variant?: AlertVariant;
  readonly dismissible?: boolean;
  /** The close button's name (default: the "Dismiss" message). */
  readonly closeLabel?: string | null;
  /** Where `SoneAlertAction` sits against a title + description; `null` keeps the default. */
  readonly actionsAlign?: AlertActionsAlign | null;
  /** The close button was pressed; the owner removes the alert. */
  readonly onDismissed?: () => void;
}

const isPart = (c: ReactNode, type: unknown) =>
  isValidElement(c) && c.type === type;

/**
 * `[soneAlert]` — a leading `SoneIcon`, then the title, description and action;
 * `dismissible` adds a close button at the end and calls `onDismissed`.
 */
export function SoneAlert({
  variant = "default",
  dismissible = false,
  closeLabel = null,
  actionsAlign = null,
  onDismissed,
  style,
  children,
  ...rest
}: SoneAlertProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const messages = useSoneMessages();
  const look = useMemo(() => alertLook(theme, variant), [theme, variant]);
  const label = closeLabel ?? messages.dismiss;
  const parts = Children.toArray(children);
  const icons = parts.filter((c) => isPart(c, SoneIcon));
  const actions = parts.filter((c) => isPart(c, SoneAlertAction));
  const body = parts.filter(
    (c) => !isPart(c, SoneIcon) && !isPart(c, SoneAlertAction),
  );
  const structured = body.some(
    (c) => isPart(c, SoneAlertTitle) || isPart(c, SoneAlertDescription),
  );
  const align = actionsAlign ?? (structured ? "start" : "center");
  return (
    <View
      {...rest}
      style={[
        alertBox(theme, look),
        dismissible && { paddingRight: t.alertPx + t.controlHXs },
        style,
      ]}
    >
      <AlertContext.Provider value={look}>
        <SoneForegroundProvider
          value={{
            color: look.color,
            fontSize: t.fontSizeSm,
            lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
            iconSize: t.controlIcon,
          }}
        >
          {icons.length > 0 && (
            <SoneForegroundProvider value={{ color: look.icon }}>
              <View style={{ marginTop: t.space1 / 2 }}>{icons}</View>
            </SoneForegroundProvider>
          )}
          <View style={{ flex: 1, minWidth: 0, gap: t.space1 / 2 }}>
            {textChildren(body)}
          </View>
          {actions.length > 0 && (
            <View
              style={{
                alignSelf: {
                  start: "flex-start",
                  center: "center",
                  end: "flex-end",
                }[align] as ViewStyle["alignSelf"],
                marginLeft: structured ? t.space3 : 0,
              }}
            >
              {actions}
            </View>
          )}
          {dismissible && (
            <SoneButton
              variant="ghost"
              size="icon-xs"
              aria-label={label}
              onPress={() => onDismissed?.()}
              style={{
                position: "absolute",
                top: t.alertPy - t.space1,
                right: t.alertPx - t.space2,
              }}
            >
              <SoneIcon name="close" color={look.color} />
            </SoneButton>
          )}
        </SoneForegroundProvider>
      </AlertContext.Provider>
    </View>
  );
}

/** `[soneAlertTitle]` */
export function SoneAlertTitle({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  const look = useContext(AlertContext);
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: look?.title ?? t.textPrimary,
          fontWeight: weight(t.fontWeightMedium),
          lineHeight: Math.round(t.fontSizeSm * t.alertTitleLeading),
        },
        style,
      ]}
    />
  );
}

/** `[soneAlertDescription]` */
export function SoneAlertDescription({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  const look = useContext(AlertContext);
  return (
    <SoneText
      {...rest}
      style={[{ color: look?.description ?? t.textSecondary }, style]}
    />
  );
}

/** `[soneAlertAction]` — a button (or a few) at the end of the alert. */
export function SoneAlertAction({ style, ...rest }: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        { flexDirection: "row", alignItems: "center", gap: t.space2 },
        style,
      ]}
    />
  );
}
