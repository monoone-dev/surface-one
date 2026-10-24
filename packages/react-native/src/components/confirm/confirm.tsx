import {
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

import { flattenChildren } from "@surface-one/core/react/children";
import {
  AccessibilityInfo,
  Platform,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  useForeground,
  type SoneTextProps,
} from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";
import { SoneSpinner } from "../spinner/spinner";
import { SoneButton, type SoneButtonProps } from "../button/button";

export type ConfirmVariant = "default" | "destructive";
export type ConfirmSize = "default" | "compact";
export type ConfirmLayout = "inline" | "card";

interface ConfirmContext {
  readonly size: ConfirmSize;
  readonly layout: ConfirmLayout;
  /** A title registers its id (it names the alertdialog); returns the unregister. */
  register(id: string): () => void;
}

const CONFIRM = createContext<ConfirmContext | null>(null);

/** `[soneConfirmTitle]` — the question; names the alertdialog. */
export function SoneConfirmTitle({
  nativeID,
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const fg = useForeground();
  const root = useContext(CONFIRM);
  const fallback = `sone-confirm-title-${useId()}`;
  const id = nativeID ?? fallback;
  useLayoutEffect(() => root?.register(id), [root, id]);
  const fontSize =
    root?.layout === "card"
      ? root.size === "compact"
        ? t.fontSizeSm
        : t.fontSizeMd
      : fg.fontSize;
  return (
    <SoneText
      {...rest}
      nativeID={id}
      style={[
        {
          color: t.textPrimary,
          fontSize,
          fontWeight: weight(t.fontWeightMedium),
          lineHeight: Math.round(fontSize * t.leadingSnug),
        },
        style,
      ]}
    />
  );
}

/** `[soneConfirmDescription]` — the consequence ("This cannot be undone."). */
export function SoneConfirmDescription({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return <SoneText {...rest} style={[{ color: t.textSecondary }, style]} />;
}

/** `[soneConfirmError]` — why the last attempt failed; announced as an alert. */
export function SoneConfirmError({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return (
    <SoneText
      role="alert"
      aria-live="assertive"
      {...rest}
      style={[{ color: t.dangerText }, style]}
    />
  );
}

/** `[soneConfirmActions]` — extra controls at the start of the button row. */
export function SoneConfirmActions({
  style,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: t.space2,
          marginRight: "auto",
        },
        style,
      ]}
    />
  );
}

/** What a `ref` on SoneConfirm gets. */
export interface SoneConfirmHandle {
  /** Moves focus (the screen reader's, on a device) to the Confirm button. */
  focus(): void;
}

export interface SoneConfirmProps extends ViewProps {
  /** `destructive` paints the action red (delete, discard, leave). */
  readonly variant?: ConfirmVariant;
  /** `compact` uses extra-small buttons and tighter spacing — for a list row. */
  readonly size?: ConfirmSize;
  /** `inline`: text and buttons share one wrapping row. `card`: a bordered panel, buttons below. */
  readonly layout?: ConfirmLayout;
  /** Default: the "Confirm" message. */
  readonly confirmLabel?: string | null;
  /** Default: the "Cancel" message. */
  readonly cancelLabel?: string | null;
  /** The action's label while `busy` (default: the "Working…" message). */
  readonly busyLabel?: string | null;
  /** The action is running: both buttons are disabled and the action shows `busyLabel`. */
  readonly busy?: boolean;
  /** Move focus to the Confirm button when the confirmation mounts. */
  readonly autoFocus?: boolean;
  /** Extra controls at the start of the button row. */
  readonly actions?: ReactNode;
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
  readonly children?: ReactNode;
  readonly ref?: Ref<SoneConfirmHandle>;
}

/**
 * `[soneConfirm]` — an inline confirmation: the shadcn/ui Alert Dialog anatomy (title,
 * description, Cancel then the action) rendered in place, in a row or a list, instead
 * of in a modal (for the modal one, `SoneAlertDialog`). It is a `role="alertdialog"`
 * named by its `SoneConfirmTitle`; focus moves to the Confirm button on mount.
 */
export function SoneConfirm({
  variant = "default",
  size = "default",
  layout = "inline",
  confirmLabel = null,
  cancelLabel = null,
  busyLabel = null,
  busy = false,
  autoFocus = true,
  actions: actionsProp,
  onConfirm,
  onCancel,
  style,
  children,
  ref,
  ...rest
}: SoneConfirmProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const messages = useSoneMessages();
  const [titles, setTitles] = useState<readonly string[]>([]);
  const context = useMemo<ConfirmContext>(
    () => ({
      size,
      layout,
      register(id) {
        setTitles((list) => [...list, id]);
        return () => setTitles((list) => list.filter((e) => e !== id));
      },
    }),
    [size, layout],
  );

  const confirmButton = useRef<ComponentRef<typeof View> | null>(null);
  const focus = useCallback(() => {
    const node = confirmButton.current;
    if (!node) return;
    if (Platform.OS === "web") node.focus?.();
    else AccessibilityInfo.sendAccessibilityEvent(node, "focus");
  }, []);
  useImperativeHandle(ref, () => ({ focus }), [focus]);
  const autoFocusOnMount = useRef(autoFocus);
  useEffect(() => {
    if (autoFocusOnMount.current) focus();
  }, [focus]);

  const content: ReactNode[] = [];
  const actions: ReactNode[] = [];
  for (const node of flattenChildren(children))
    (isValidElement(node) && node.type === SoneConfirmActions
      ? actions
      : content
    ).push(node);

  const compact = size === "compact";
  const card = layout === "card";
  const buttonSize = compact ? "xs" : "sm";
  const root: ViewStyle = card
    ? {
        flexDirection: "column",
        alignItems: "stretch",
        gap: compact ? t.space3 : t.space4,
        padding: compact ? t.cardSpacingSm : t.cardSpacing,
        borderWidth: t.borderWidthThin,
        borderColor: t.cardRing,
        borderRadius: t.cardRadius,
        backgroundColor: t.surfaceRaised,
        ...shadow(t.cardShadow),
      }
    : {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        rowGap: compact ? t.space1 : t.space2,
        columnGap: compact ? t.space2 : t.space3,
      };
  const fontSize = compact ? t.fontSizeXs : t.fontSizeSm;
  // The confirm button's ref (SoneButton spreads it onto its Pressable).
  const confirmRef = { ref: confirmButton } as Partial<SoneButtonProps>;

  return (
    <View
      {...rest}
      role="alertdialog"
      aria-labelledby={titles[0]}
      aria-busy={busy || undefined}
      style={[root, style]}
    >
      <SoneForegroundProvider
        value={{
          color: t.textPrimary,
          fontSize,
          lineHeight: Math.round(fontSize * t.leadingNormal),
        }}
      >
        <CONFIRM.Provider value={context}>
          {content.length ? (
            <View
              style={
                card
                  ? { gap: t.space1 }
                  : {
                      flexGrow: 1,
                      flexShrink: 1,
                      // `flex: 1 1 12rem` — the width the text wraps the buttons below at.
                      flexBasis: 192,
                      gap: t.space1 / 2,
                      minWidth: 0,
                    }
              }
            >
              {content}
            </View>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "flex-end",
              gap: compact ? t.space1 : t.space2,
              marginLeft: card ? 0 : "auto",
            }}
          >
            {actions}
            {actionsProp != null && actionsProp !== false ? (
              <SoneConfirmActions>{actionsProp}</SoneConfirmActions>
            ) : null}
            <SoneButton
              variant={card ? "outline" : "ghost"}
              size={buttonSize}
              disabled={busy}
              onPress={() => {
                if (!busy) onCancel?.();
              }}
            >
              {cancelLabel ?? messages.cancel}
            </SoneButton>
            <SoneButton
              {...confirmRef}
              variant={variant === "destructive" ? "destructive" : "default"}
              size={buttonSize}
              disabled={busy}
              onPress={() => {
                if (!busy) onConfirm?.();
              }}
            >
              {busy ? <SoneSpinner label={null} /> : null}
              {busy
                ? (busyLabel ?? messages.confirmBusy)
                : (confirmLabel ?? messages.confirm)}
            </SoneButton>
          </View>
        </CONFIRM.Provider>
      </SoneForegroundProvider>
    </View>
  );
}
