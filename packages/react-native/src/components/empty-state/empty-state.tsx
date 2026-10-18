import { createContext, useContext } from "react";
import { View, type ViewProps } from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { em, weight } from "../../theme/style";
import { SoneIcon, type ShellIcon } from "../icon/icon";
import { SoneSpinner } from "../spinner/spinner";

export type EmptyMediaVariant = "default" | "icon";
export type EmptyStateTone = "default" | "locked" | "error" | "loading";

// `max-width: 24rem` of the header, the description and the content.
const MEASURE = 384;

const ToneContext = createContext<EmptyStateTone>("default");

export interface SoneEmptyProps extends ViewProps {
  readonly icon?: ShellIcon | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly tone?: EmptyStateTone;
  readonly busy?: boolean;
}

/**
 * `<sone-empty-state>` — the empty state. Compose the parts, or set `icon` / `title` /
 * `description` / `tone` and the header is drawn for you; the children follow it.
 * `locked` defaults the icon to `lock`, `error` to `alert-circle` (`role="alert"`),
 * `loading` or `busy` shows a spinner (`role="status"`).
 */
export function SoneEmpty({
  icon = null,
  title = null,
  description = null,
  tone: toneProp = "default",
  busy = false,
  style,
  children,
  ...rest
}: SoneEmptyProps) {
  const t = useSoneTheme().tokens;
  const messages = useSoneMessages();
  const tone: EmptyStateTone = busy ? "loading" : toneProp;
  const loading = tone === "loading";
  const mediaIcon: ShellIcon | null =
    icon ??
    (tone === "locked" ? "lock" : tone === "error" ? "alert-circle" : null);
  const header =
    loading || mediaIcon || title || description ? (
      <SoneEmptyHeader>
        {loading ? (
          <SoneEmptyMedia variant="icon">
            {/* With no title the spinner itself says "Loading". */}
            <SoneSpinner size={24} label={title ? null : messages.loading} />
          </SoneEmptyMedia>
        ) : mediaIcon ? (
          <SoneEmptyMedia variant="icon">
            <SoneIcon name={mediaIcon} />
          </SoneEmptyMedia>
        ) : null}
        {title ? <SoneEmptyTitle>{title}</SoneEmptyTitle> : null}
        {description ? (
          <SoneEmptyDescription>{description}</SoneEmptyDescription>
        ) : null}
      </SoneEmptyHeader>
    ) : null;
  return (
    <View
      role={tone === "error" ? "alert" : loading ? "status" : undefined}
      aria-busy={loading || undefined}
      {...rest}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          gap: t.space2,
          minWidth: 0,
          paddingTop: t.emptyPadding[0],
          paddingRight: t.emptyPadding[1],
          paddingBottom: t.emptyPadding[2],
          paddingLeft: t.emptyPadding[3],
          borderRadius: t.emptyRadius,
        },
        style,
      ]}
    >
      <ToneContext.Provider value={tone}>
        {header}
        {textChildren(children)}
      </ToneContext.Provider>
    </View>
  );
}

/** `[soneEmptyHeader]` — the media, title and description, centred. */
export function SoneEmptyHeader({ style, ...rest }: ViewProps) {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          alignItems: "center",
          gap: t.space2,
          maxWidth: MEASURE,
          alignSelf: "center",
        },
        style,
      ]}
    />
  );
}

export interface SoneEmptyMediaProps extends ViewProps {
  /** `icon`: an icon in a tinted tile. */
  readonly variant?: EmptyMediaVariant;
}

/** `[soneEmptyMedia]` — an illustration, or (`variant="icon"`) an icon in a tile. */
export function SoneEmptyMedia({
  variant = "default",
  style,
  children,
  ...rest
}: SoneEmptyMediaProps) {
  const t = useSoneTheme().tokens;
  const error = useContext(ToneContext) === "error";
  const fg = error ? t.dangerText : t.emptyMediaFg;
  const icon = variant === "icon";
  return (
    <View
      {...rest}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          marginBottom: t.space2,
        },
        icon && {
          width: t.emptyMediaSize,
          height: t.emptyMediaSize,
          borderRadius: t.emptyMediaRadius,
          borderWidth: t.borderWidthThin,
          borderColor: error ? "transparent" : t.emptyMediaBorder,
          backgroundColor: error ? t.dangerSoft : t.emptyMediaBg,
        },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={icon ? { color: fg, iconSize: t.emptyMediaIconSize } : {}}
      >
        {children}
      </SoneForegroundProvider>
    </View>
  );
}

/** `[soneEmptyTitle]` — a heading. */
export function SoneEmptyTitle({ style, ...rest }: SoneTextProps) {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      role="heading"
      {...rest}
      style={[
        {
          color: t.textPrimary,
          fontSize: t.emptyTitleSize,
          fontWeight: weight(t.fontWeightMedium),
          lineHeight: Math.round(t.emptyTitleSize * t.emptyTitleLeading),
          letterSpacing: em(t.trackingHeading, t.emptyTitleSize),
          textAlign: "center",
        },
        style,
      ]}
    />
  );
}

/** `[soneEmptyDescription]` */
export function SoneEmptyDescription({ style, ...rest }: SoneTextProps) {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          maxWidth: MEASURE,
          color: t.textTertiary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingRelaxed),
          textAlign: "center",
        },
        style,
      ]}
    />
  );
}

/** `[soneEmptyContent]` — the actions under the header. */
export function SoneEmptyContent({ style, children, ...rest }: ViewProps) {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          alignItems: "center",
          gap: t.emptyContentGap,
          width: "100%",
          maxWidth: MEASURE,
          minWidth: 0,
          marginTop: t.space2,
        },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={{
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
        }}
      >
        {textChildren(children)}
      </SoneForegroundProvider>
    </View>
  );
}
