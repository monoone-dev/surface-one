import { type ReactNode, type ReactElement } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, textChildren } from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";
import { currentProps } from "../../utils/a11y";
import { useFocusRing } from "../../utils/focus";
import { SoneIcon } from "../icon/icon";

/**
 * `nav[soneBreadcrumb]` — the trail of links to the current page. Named
 * "Breadcrumb" (the messages catalogue) unless you pass `aria-label`.
 */
export function SoneBreadcrumb({
  "aria-label": label,
  ...rest
}: ViewProps): ReactElement {
  const messages = useSoneMessages();
  return (
    <View
      role="navigation"
      aria-label={label ?? messages.breadcrumbLabel}
      {...rest}
    />
  );
}

/** `ol[soneBreadcrumbList]` — the crumbs in a wrapping row, muted `text-sm`. */
export function SoneBreadcrumbList({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return (
    <View
      role="list"
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: t.space2,
        },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={{
          color: t.textSecondary,
          fontSize: t.fontSizeSm,
          fontWeight: weight(t.fontWeightNormal),
        }}
      >
        {children}
      </SoneForegroundProvider>
    </View>
  );
}

/** `li[soneBreadcrumbItem]` — one crumb: a link, the page or an ellipsis. */
export function SoneBreadcrumbItem({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return (
    <View
      role="listitem"
      {...rest}
      style={[
        { flexDirection: "row", alignItems: "center", gap: t.space2 },
        style,
      ]}
    >
      {textChildren(children)}
    </View>
  );
}

export interface SoneBreadcrumbLinkProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  /** The crumb's label (a string becomes its text). */
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/** `a[soneBreadcrumbLink]` — a crumb that leads to its page (`onPress` navigates). */
export function SoneBreadcrumbLink({
  onFocus,
  onBlur,
  style,
  children,
  ...rest
}: SoneBreadcrumbLinkProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const focus = useFocusRing(onFocus, onBlur);
  return (
    <Pressable
      role="link"
      {...rest}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={[
        { borderRadius: t.radiusSm },
        focus.focused && shadow(t.focusRing),
        style,
      ]}
    >
      {({ pressed }) => (
        <SoneForegroundProvider value={pressed ? { color: t.textPrimary } : {}}>
          {textChildren(children)}
        </SoneForegroundProvider>
      )}
    </Pressable>
  );
}

/** `span[soneBreadcrumbPage]` — the current page: not a link, `aria-current="page"`. */
export function SoneBreadcrumbPage({
  children,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return (
    <View role="link" aria-disabled {...currentProps(true, "page")} {...rest}>
      <SoneForegroundProvider value={{ color: t.textPrimary }}>
        {textChildren(children)}
      </SoneForegroundProvider>
    </View>
  );
}

/** `li[soneBreadcrumbSeparator]` — the chevron between crumbs; `children` replace it. */
export function SoneBreadcrumbSeparator({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return (
    <View
      aria-hidden
      {...rest}
      style={[{ flexDirection: "row", alignItems: "center" }, style]}
    >
      <SoneForegroundProvider
        value={{ color: t.textMuted, iconSize: t.controlIconSm }}
      >
        {textChildren(children ?? <SoneIcon name="chevron-right" />)}
      </SoneForegroundProvider>
    </View>
  );
}

export interface SoneBreadcrumbEllipsisProps extends ViewProps {
  /** What screen readers hear in place of the collapsed crumbs. */
  readonly srOnlyText?: string | null;
}

/** `<sone-breadcrumb-ellipsis>` — stands in for collapsed crumbs; says "More" to screen readers. */
export function SoneBreadcrumbEllipsis({
  srOnlyText = null,
  style,
  ...rest
}: SoneBreadcrumbEllipsisProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const messages = useSoneMessages();
  return (
    <View
      role="img"
      aria-label={srOnlyText ?? messages.breadcrumbMore}
      {...rest}
      style={[
        {
          width: t.controlHMd,
          height: t.controlHMd,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <SoneIcon name="ellipsis" size={t.controlIcon} />
    </View>
  );
}
