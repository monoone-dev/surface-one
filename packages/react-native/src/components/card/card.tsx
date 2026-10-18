import { Children, createContext, isValidElement, useContext } from "react";
import { View, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";

export type CardSize = "default" | "sm";

const CardSizeContext = createContext<CardSize>("default");

function usePad(): number {
  const t = useSoneTheme().tokens;
  return useContext(CardSizeContext) === "sm" ? t.cardSpacingSm : t.cardSpacing;
}

export interface SoneCardProps extends ViewProps {
  readonly size?: CardSize;
}

/** `[soneCard]` — a raised panel; its parts stack with the card's padding between them. */
export function SoneCard({
  size = "default",
  style,
  children,
  ...rest
}: SoneCardProps) {
  const t = useSoneTheme().tokens;
  const pad = size === "sm" ? t.cardSpacingSm : t.cardSpacing;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "column",
          gap: pad,
          padding: pad,
          overflow: "hidden",
          borderWidth: t.borderWidthThin,
          borderColor: t.cardRing,
          borderRadius: t.cardRadius,
          backgroundColor: t.surfaceRaised,
          ...shadow(t.cardShadow),
        },
        style,
      ]}
    >
      <CardSizeContext.Provider value={size}>
        <SoneForegroundProvider
          value={{
            color: t.textPrimary,
            fontSize: t.fontSizeSm,
            lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
          }}
        >
          {textChildren(children)}
        </SoneForegroundProvider>
      </CardSizeContext.Provider>
    </View>
  );
}

/** `[soneCardHeader]` — title and description, with a `SoneCardAction` at the end. */
export function SoneCardHeader({ style, children, ...rest }: ViewProps) {
  const t = useSoneTheme().tokens;
  const parts = Children.toArray(children);
  const isAction = (c: unknown) =>
    isValidElement(c) && c.type === SoneCardAction;
  const actions = parts.filter(isAction);
  return (
    <View
      {...rest}
      style={[{ flexDirection: "row", alignItems: "flex-start" }, style]}
    >
      <View style={{ flex: 1, minWidth: 0, gap: t.cardHeaderGap }}>
        {textChildren(parts.filter((c) => !isAction(c)))}
      </View>
      {actions.length > 0 && (
        <View style={{ marginLeft: t.cardActionGap }}>{actions}</View>
      )}
    </View>
  );
}

/** `[soneCardTitle]` — a heading. */
export function SoneCardTitle({ style, ...rest }: SoneTextProps) {
  const t = useSoneTheme().tokens;
  const sm = useContext(CardSizeContext) === "sm";
  const fontSize = sm ? t.cardTitleSizeSm : t.fontSizeBase;
  return (
    <SoneText
      role="heading"
      {...rest}
      style={[
        {
          color: t.textPrimary,
          fontSize,
          fontWeight: weight(t.fontWeightMedium),
          lineHeight: Math.round(fontSize * t.cardTitleLeading),
        },
        style,
      ]}
    />
  );
}

/** `[soneCardDescription]` */
export function SoneCardDescription({ style, ...rest }: SoneTextProps) {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
        },
        style,
      ]}
    />
  );
}

/** `[soneCardAction]` — the top-end corner of the header. */
export function SoneCardAction({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[{ alignSelf: "flex-start" }, style]} />;
}

/** `[soneCardContent]` */
export function SoneCardContent({ style, children, ...rest }: ViewProps) {
  return (
    <View {...rest} style={[{ minWidth: 0 }, style]}>
      {textChildren(children)}
    </View>
  );
}

/** `[soneCardFooter]` — a row of actions; a skin with a footer band draws it full-bleed. */
export function SoneCardFooter({ style, children, ...rest }: ViewProps) {
  const t = useSoneTheme().tokens;
  const pad = usePad();
  const band = t.cardFooterBand;
  const inner = t.cardRadius - t.borderWidthThin;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.space2,
          marginHorizontal: -pad * band,
          marginBottom: -pad * band,
          padding: pad * band,
          borderTopWidth: t.borderWidthThin * band,
          borderTopColor: t.borderSubtle,
          borderBottomLeftRadius: inner,
          borderBottomRightRadius: inner,
          backgroundColor: t.cardFooterBg,
        },
        style,
      ]}
    >
      {textChildren(children)}
    </View>
  );
}
