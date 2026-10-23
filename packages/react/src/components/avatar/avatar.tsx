"use client";

import {
  Children,
  createContext,
  createElement,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

import { mergeRefs } from "../../utils/refs";
import { cx, type PolymorphicProps } from "../../utils/part";

export type AvatarSize = "sm" | "default" | "lg";
type ImageStatus = "loading" | "loaded" | "error";

interface AvatarState {
  readonly status: ImageStatus;
  readonly setStatus: (status: ImageStatus) => void;
}

const AvatarContext = createContext<AvatarState | null>(null);

export interface SoneAvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  readonly ref?: Ref<HTMLImageElement>;
}

/** `img[soneAvatarImage]` — shown once it loads; until then (or on error) the fallback is. */
export function SoneAvatarImage({
  className,
  onLoad,
  onError,
  ref,
  ...rest
}: SoneAvatarImageProps): ReactElement {
  const avatar = useContext(AvatarContext);
  const img = useRef<HTMLImageElement | null>(null);
  const setStatus = avatar?.setStatus;
  // A server-rendered image may finish loading before hydration adds the listeners.
  useEffect(() => {
    const el = img.current;
    if (el?.complete && setStatus)
      setStatus(el.naturalWidth > 0 ? "loaded" : "error");
  }, [setStatus]);
  return (
    <img
      {...rest}
      ref={mergeRefs(img, ref)}
      className={cx("avatar-image", className)}
      data-slot="avatar-image"
      onLoad={(event) => {
        setStatus?.("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus?.("error");
        onError?.(event);
      }}
    />
  );
}

/** `[soneAvatarFallback]` — initials or an icon while there is no image. */
export function SoneAvatarFallback<E extends ElementType = "span">({
  as,
  className,
  ...rest
}: PolymorphicProps<E>): ReactElement | null {
  const avatar = useContext(AvatarContext);
  if (avatar?.status === "loaded") return null;
  return createElement(as ?? "span", {
    "data-slot": "avatar-fallback",
    ...rest,
    className: cx("avatar-fallback", className),
  });
}

const PLACEHOLDER = (
  <span
    className="avatar-fallback avatar-placeholder"
    data-slot="avatar-placeholder"
  >
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle
        cx="8"
        cy="5.75"
        r="2.75"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.75 13.5c.6-2.4 2.7-4 5.25-4s4.65 1.6 5.25 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

export interface SoneAvatarProps extends HTMLAttributes<HTMLElement> {
  readonly size?: AvatarSize;
  readonly ref?: Ref<HTMLElement>;
  readonly children?: ReactNode;
}

/** `<sone-avatar>` — an image with a fallback; a person glyph when it has neither. */
export function SoneAvatar({
  size = "default",
  className,
  children,
  ...rest
}: SoneAvatarProps): ReactElement {
  const [status, setStatus] = useState<ImageStatus>("loading");
  const context = useMemo(() => ({ status, setStatus }), [status]);
  const hasFallback = Children.toArray(children).some(
    (c) => isValidElement(c) && c.type === SoneAvatarFallback,
  );
  return createElement(
    "sone-avatar",
    {
      "data-slot": "avatar",
      "data-size": size,
      ...rest,
      className: cx("avatar", className),
    },
    <AvatarContext.Provider value={context}>
      {children}
      {status !== "loaded" && !hasFallback ? PLACEHOLDER : null}
    </AvatarContext.Provider>,
  );
}
