import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
} from "react";
import { Image, View, type ImageProps, type ViewProps } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, textChildren } from "../../theme/foreground";
import { weight } from "../../theme/style";

export type AvatarSize = "sm" | "default" | "lg";
type ImageStatus = "loading" | "loaded" | "error";

// The `.avatar` sizes are fixed in the stylesheet (no token).
const SIZE: Record<AvatarSize, number> = { sm: 24, default: 32, lg: 40 };

interface AvatarState {
  readonly size: AvatarSize;
  readonly status: ImageStatus;
  readonly hasFallback: boolean;
  readonly setStatus: (status: ImageStatus) => void;
}

const AvatarContext = createContext<AvatarState | null>(null);

export type SoneAvatarImageProps = ImageProps;

/** `img[soneAvatarImage]` — shown once it loads; until then (or on error) the fallback is. */
export function SoneAvatarImage({
  onLoad,
  onError,
  style,
  ...rest
}: SoneAvatarImageProps) {
  const avatar = useContext(AvatarContext);
  const hidden = avatar?.status !== "loaded";
  return (
    <Image
      {...rest}
      aria-hidden={hidden || undefined}
      onLoad={(event) => {
        avatar?.setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        avatar?.setStatus("error");
        onError?.(event);
      }}
      resizeMode="cover"
      style={[
        { width: "100%", height: "100%" },
        hidden && { position: "absolute", opacity: 0 },
        style,
      ]}
    />
  );
}

function useFallbackStyle() {
  const t = useSoneTheme().tokens;
  const avatar = useContext(AvatarContext);
  const fontSize = avatar?.size === "sm" ? t.fontSizeXs : t.fontSizeSm;
  return {
    box: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.surfaceHover,
    } as const,
    fg: {
      color: t.textSecondary,
      fontSize,
      fontWeight: weight(t.fontWeightMedium),
      lineHeight: Math.round(fontSize * t.leadingSm),
    },
    status: avatar?.status,
  };
}

/** `[soneAvatarFallback]` — initials or an icon while there is no image. */
export function SoneAvatarFallback({ style, children, ...rest }: ViewProps) {
  const s = useFallbackStyle();
  if (s.status === "loaded") return null;
  return (
    <View {...rest} style={[s.box, style]}>
      <SoneForegroundProvider value={s.fg}>
        {textChildren(children)}
      </SoneForegroundProvider>
    </View>
  );
}

/** The person glyph of an avatar with neither an image nor a fallback. */
function Placeholder({ px }: { px: number }) {
  const s = useFallbackStyle();
  return (
    <View style={s.box} aria-hidden>
      <Svg
        viewBox="0 0 16 16"
        width={px * 0.62}
        height={px * 0.62}
        fill="none"
        color={s.fg.color}
      >
        <Circle
          cx="8"
          cy="5.75"
          r="2.75"
          stroke="currentColor"
          strokeWidth={1.4}
        />
        <Path
          d="M2.75 13.5c.6-2.4 2.7-4 5.25-4s4.65 1.6 5.25 4"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export interface SoneAvatarProps extends ViewProps {
  readonly size?: AvatarSize;
}

/** `<sone-avatar>` — an image with a fallback; a person glyph when it has neither. */
export function SoneAvatar({
  size = "default",
  style,
  children,
  ...rest
}: SoneAvatarProps) {
  const t = useSoneTheme().tokens;
  const [status, setStatus] = useState<ImageStatus>("loading");
  const hasFallback = Children.toArray(children).some(
    (c) => isValidElement(c) && c.type === SoneAvatarFallback,
  );
  const state = useMemo(
    () => ({ size, status, hasFallback, setStatus }),
    [size, status, hasFallback],
  );
  const px = SIZE[size];
  return (
    <View
      {...rest}
      style={[
        {
          width: px,
          height: px,
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: t.radiusPill,
        },
        style,
      ]}
    >
      <AvatarContext.Provider value={state}>
        {children}
        {status !== "loaded" && !hasFallback && <Placeholder px={px} />}
      </AvatarContext.Provider>
    </View>
  );
}
