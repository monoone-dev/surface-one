import {
  Children,
  isValidElement,
  useId,
  useLayoutEffect,
  type ReactNode,
} from "react";
import {
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { em, weight } from "../../theme/style";
import { SoneButton, type SoneButtonProps } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { useSoneOverlay } from "./overlay";

export type DialogMediaTone = "default" | "accent" | "destructive" | "warning";

/** A part a sheet lays out itself (no side padding wrapper). */
const sheetPart = <T extends object>(part: T): T =>
  Object.assign(part, { soneSheetPart: true });

/** An alert dialog of size `xs`: a centred header and a two-column footer. */
function useCentred(): boolean {
  const overlay = useSoneOverlay();
  return overlay?.kind === "alertdialog" && overlay.size === "xs";
}

/**
 * `[soneDialogHeader]` — the title and description; a `SoneDialogMedia` child sits at
 * the start, a `SoneDialogClose` child at the end (and the corner close steps aside).
 */
export const SoneDialogHeader = sheetPart(function SoneDialogHeader({
  style,
  children,
  ...rest
}: ViewProps) {
  const { tokens: t } = useSoneTheme();
  const overlay = useSoneOverlay();
  const centred = useCentred();
  const items = Children.toArray(children);
  const is = (c: ReactNode, type: unknown) =>
    isValidElement(c) && c.type === type;
  const media = items.filter((c) => is(c, SoneDialogMedia));
  const close = items.filter((c) => is(c, SoneDialogClose));
  const text = items.filter((c) => !media.includes(c) && !close.includes(c));
  const hasClose = close.length > 0;
  const setHeaderClose = overlay?.setHeaderClose;
  useLayoutEffect(() => {
    if (!setHeaderClose || !hasClose) return;
    setHeaderClose(true);
    return () => setHeaderClose(false);
  }, [setHeaderClose, hasClose]);

  const sheet = overlay?.kind === "sheet";
  const gap =
    overlay?.kind === "alertdialog"
      ? t.alertDialogHeaderGap
      : sheet
        ? t.sheetHeaderGap
        : t.space2;
  // Clear of the corner close: `--close-inset + --control-h-sm + --space-2 - --overlay-pad`.
  const clearance =
    overlay?.cornerClose && !hasClose
      ? (sheet ? t.sheetCloseInset : t.dialogCloseInset) +
        t.controlHSm +
        t.space2 -
        (sheet ? 0 : t.dialogPadding)
      : undefined;
  const box: ViewStyle = {
    ...(sheet && { padding: t.sheetPadding }),
    ...(clearance !== undefined && { paddingRight: clearance }),
  };
  const column = (
    <View style={{ gap, flexShrink: 1, flexGrow: 1 }}>{text}</View>
  );

  if (centred)
    return (
      <View {...rest} style={[box, { gap, alignItems: "center" }, style]}>
        {media.map((m, i) => (
          <View key={i} style={{ marginBottom: t.space2 }}>
            {m}
          </View>
        ))}
        {text}
        {close}
      </View>
    );
  if (!media.length && !hasClose)
    return (
      <View {...rest} style={[box, { gap }, style]}>
        {children}
      </View>
    );
  return (
    <View
      {...rest}
      style={[
        box,
        { flexDirection: "row", alignItems: "flex-start", columnGap: t.space2 },
        media.length > 0 && { columnGap: t.dialogMediaGap },
        style,
      ]}
    >
      {media}
      {column}
      {close}
    </View>
  );
});

/** `[soneDialogFooter]` — the actions, at the end; a dialog's sits on its own band. */
export const SoneDialogFooter = sheetPart(function SoneDialogFooter({
  style,
  children,
  ...rest
}: ViewProps) {
  const { tokens: t } = useSoneTheme();
  const overlay = useSoneOverlay();
  const centred = useCentred();
  const own: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: t.space2,
  };
  if (overlay?.kind === "sheet")
    Object.assign(own, {
      flexDirection: t.sheetFooterDirection === "column" ? "column" : "row",
      alignItems:
        t.sheetFooterAlign === "stretch"
          ? "stretch"
          : t.sheetFooterAlign === "flex-start" ||
              t.sheetFooterAlign === "start"
            ? "flex-start"
            : own.alignItems,
      marginTop: "auto",
      padding: t.sheetPadding,
      backgroundColor: t.surfaceOverlay,
    });
  else if (overlay) {
    const inset = t.dialogFooterInset;
    Object.assign(own, {
      marginHorizontal: -inset,
      marginBottom: -inset,
      padding: inset,
      borderTopWidth: t.dialogFooterRule,
      borderColor: t.border,
      backgroundColor: t.dialogFooterBg,
      borderBottomLeftRadius: t.dialogRadius,
      borderBottomRightRadius: t.dialogRadius,
    });
  }
  return (
    <View {...rest} style={[own, centred && { flexWrap: "nowrap" }, style]}>
      {centred
        ? Children.map(children, (c) => <View style={{ flex: 1 }}>{c}</View>)
        : children}
    </View>
  );
});

export interface SoneDialogMediaProps extends ViewProps {
  readonly tone?: DialogMediaTone;
}

/** `[soneDialogMedia]` — the icon tile beside the title (decorative). */
export function SoneDialogMedia({
  tone = "default",
  style,
  children,
  ...rest
}: SoneDialogMediaProps) {
  const { tokens: t } = useSoneTheme();
  const [bg, ink] = {
    default: [t.dialogMediaBg, t.textPrimary],
    accent: [t.accentSoft, t.accent],
    destructive: [t.dangerSoft, t.danger],
    warning: [t.warningSoft, t.warning],
  }[tone];
  return (
    <View
      aria-hidden
      {...rest}
      style={[
        {
          width: t.dialogMediaSize,
          height: t.dialogMediaSize,
          borderRadius: t.dialogMediaRadius,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={{ color: ink, iconSize: t.dialogMediaIcon }}
      >
        {textChildren(children)}
      </SoneForegroundProvider>
    </View>
  );
}

/** `[soneDialogTitle]` — the heading that names the overlay it sits in. */
export function SoneDialogTitle({ nativeID, style, ...rest }: SoneTextProps) {
  const { tokens: t } = useSoneTheme();
  const overlay = useSoneOverlay();
  const centred = useCentred();
  const fallback = `sone-dialog-title-${useId()}`;
  const id = nativeID ?? fallback;
  const setTitleId = overlay?.setTitleId;
  useLayoutEffect(() => {
    if (!setTitleId) return;
    setTitleId(id);
    // A conditionally rendered title must not leave the dialog labelled by a dead id.
    return () => setTitleId(undefined);
  }, [setTitleId, id]);
  const leading =
    overlay?.kind === "alertdialog"
      ? t.alertDialogTitleLeading
      : overlay?.kind === "sheet"
        ? t.sheetTitleLeading
        : t.dialogTitleLeading;
  const size = t.dialogTitleSize;
  return (
    <SoneText
      role="heading"
      {...rest}
      nativeID={id}
      style={[
        {
          color: t.textPrimary,
          fontSize: size,
          fontWeight: weight(t.dialogTitleWeight),
          lineHeight: Math.round(size * leading),
          letterSpacing: em(t.dialogTitleTracking, size),
        },
        centred && { textAlign: "center" },
        style,
      ]}
    />
  );
}

/** `[soneDialogDescription]` — the supporting line under the title. */
export function SoneDialogDescription({ style, ...rest }: SoneTextProps) {
  const { tokens: t } = useSoneTheme();
  const centred = useCentred();
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
        },
        centred && { textAlign: "center" },
        style,
      ]}
    />
  );
}

export interface SoneDialogCloseProps extends Omit<SoneButtonProps, "onPress"> {
  /** The button's name (default: the "Close" message). */
  readonly label?: string | null;
  /** Runs first; `event.preventDefault()` keeps the overlay open. */
  readonly onPress?: (event: GestureResponderEvent) => void;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `button[soneDialogClose]` — a close button for a dialog or sheet header. Inside an
 * overlay it closes it (when it may be dismissed) and the corner close steps aside.
 */
export function SoneDialogClose({
  label = null,
  onPress,
  children,
  ...rest
}: SoneDialogCloseProps) {
  const overlay = useSoneOverlay();
  const messages = useSoneMessages();
  return (
    <SoneButton
      variant="ghost"
      size="icon-sm"
      aria-label={label ?? messages.close}
      {...rest}
      onPress={(event) => {
        onPress?.(event);
        if (!event.isDefaultPrevented?.()) overlay?.requestClose();
      }}
    >
      {children ?? <SoneIcon name="close" />}
    </SoneButton>
  );
}
