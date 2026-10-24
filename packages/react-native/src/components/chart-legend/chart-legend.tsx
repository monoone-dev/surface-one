import type { ReactElement } from "react";
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { chartTone, formatChartNumber } from "@surface-one/core/chart";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { SoneText, useForeground } from "../../theme/foreground";
import { shadow } from "../../theme/style";
import { toneColor } from "../../utils/chart";
import { useControllable } from "@surface-one/core/react/controllable";
import { useFocusRing } from "../../utils/focus";

export type SoneSwatchShape = "dot" | "square" | "line";
export type SoneChartLegendOrientation = "row" | "column";

export interface SoneChartLegendItem {
  key: string;
  label: string;
  tone?: string;
  value?: string | number | null;
}

export interface SoneSwatchProps extends Omit<ViewProps, "style"> {
  /** A token suffix (`chart-3`), a token name (`--brand`) or a colour; default: the inherited ink. */
  readonly tone?: string | null;
  readonly shape?: SoneSwatchShape;
  readonly style?: StyleProp<ViewStyle>;
}

/** `[data-slot="chart-swatch"]` — the colour key of a series. Decorative. */
export function SoneSwatch({
  tone = "",
  shape = "dot",
  style,
  ...rest
}: SoneSwatchProps): ReactElement {
  const t = useSoneTheme().tokens;
  const fg = useForeground();
  const dot = t.space1 * 2;
  return (
    <View
      aria-hidden
      {...rest}
      style={[
        {
          flexShrink: 0,
          width: shape === "line" ? t.space1 * 3 : dot,
          height: shape === "line" ? t.space1 / 2 : dot,
          borderRadius: shape === "square" ? t.radiusXs : t.radiusPill,
          backgroundColor: toneColor(t, tone, fg.color),
        },
        style,
      ]}
    />
  );
}

const NO_KEYS: readonly string[] = [];

export interface SoneChartLegendProps extends Omit<ViewProps, "style"> {
  readonly items?: readonly SoneChartLegendItem[];
  readonly orientation?: SoneChartLegendOrientation;
  /** Makes each item a toggle (pressed = shown) that shows / hides its series. */
  readonly toggleable?: boolean;
  /** The keys of the hidden series (controlled). */
  readonly hidden?: readonly string[];
  /** The keys hidden at first (uncontrolled). */
  readonly defaultHidden?: readonly string[];
  readonly onHiddenChange?: (hidden: readonly string[]) => void;
  /** Called with the key of the toggled series. */
  readonly onToggle?: (key: string) => void;
  readonly shape?: SoneSwatchShape;
  /** The locale numeric values are formatted in; default: the `numberLocale` message. */
  readonly locale?: string | null;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-chart-legend>` — swatch, label and value per series (a list named by
 * `aria-label`). `toggleable` makes each item a toggle that updates `hidden`
 * (`onHiddenChange`) and calls `onToggle` with the key.
 */
export function SoneChartLegend({
  items = [],
  orientation = "row",
  toggleable = false,
  hidden: hiddenProp,
  defaultHidden = NO_KEYS,
  onHiddenChange,
  onToggle,
  shape = "dot",
  locale = null,
  style,
  ...rest
}: SoneChartLegendProps): ReactElement {
  const messages = useSoneMessages();
  const [hidden, setHidden] = useControllable(
    hiddenProp,
    defaultHidden,
    onHiddenChange,
  );
  const off = new Set(hidden);
  const numberLocale = locale || messages.numberLocale;
  const column = orientation === "column";
  const s = useSoneStyles(
    ({ tokens: t }) => ({
      list: column
        ? ({ flexDirection: "column", rowGap: t.space1 } satisfies ViewStyle)
        : ({
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: t.space1,
            columnGap: toggleable ? t.space2 : t.space4,
          } satisfies ViewStyle),
      item: { flexDirection: "row", minWidth: 0 } satisfies ViewStyle,
    }),
    [column, toggleable],
  );
  const toggle = (key: string) => {
    setHidden(
      hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key],
    );
    onToggle?.(key);
  };
  return (
    <View role="list" {...rest} style={[s.list, style]}>
      {items.map((item, i) => {
        const row = {
          tone: item.tone || chartTone(i),
          label: item.label,
          value:
            item.value === null || item.value === undefined || item.value === ""
              ? null
              : typeof item.value === "number"
                ? formatChartNumber(item.value, numberLocale)
                : item.value,
        };
        return (
          <View
            key={item.key}
            role="listitem"
            style={[s.item, column && { width: "100%" }]}
          >
            {toggleable ? (
              <LegendToggle
                {...row}
                shape={shape}
                column={column}
                shown={!off.has(item.key)}
                onPress={() => toggle(item.key)}
              />
            ) : (
              <LegendEntry {...row} shape={shape} column={column} />
            )}
          </View>
        );
      })}
    </View>
  );
}

interface EntryProps {
  readonly tone: string;
  readonly label: string;
  readonly value: string | null;
  readonly shape: SoneSwatchShape;
  readonly column: boolean;
  /** A hidden series of a toggleable legend: muted and struck through. */
  readonly off?: boolean;
  /** The label ink while pressed. */
  readonly ink?: string;
}

function LegendEntry({
  tone,
  label,
  value,
  shape,
  column,
  off = false,
  ink,
}: EntryProps) {
  const s = useSoneStyles(({ tokens: t }) => ({
    entry: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space2,
      minWidth: 0,
    } satisfies ViewStyle,
    label: {
      flexShrink: 1,
      color: t.textSecondary,
      fontSize: t.fontSizeSm,
      lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
    },
    value: { flexShrink: 0 },
    off: { color: t.textMuted, textDecorationLine: "line-through" as const },
  }));
  const t = useSoneTheme().tokens;
  return (
    <View style={[s.entry, column && { flexGrow: 1 }]}>
      <SoneSwatch
        tone={tone}
        shape={shape}
        style={off && { opacity: t.disabledOpacity }}
      />
      <SoneText
        numberOfLines={1}
        style={[s.label, ink ? { color: ink } : null, off && s.off]}
      >
        {label}
      </SoneText>
      {value !== null ? (
        <SoneText
          tone="primary"
          size="sm"
          weight="medium"
          numeric
          style={[s.value, column && { marginStart: "auto" }]}
        >
          {value}
        </SoneText>
      ) : null}
    </View>
  );
}

// React Native names a toggle `togglebutton` + checked; the web build keeps `aria-pressed`.
const toggleA11y = (shown: boolean) =>
  Platform.OS === "web"
    ? ({ role: "button", "aria-pressed": shown } as object)
    : ({ role: "togglebutton", "aria-checked": shown } as const);

function LegendToggle({
  shown,
  onPress,
  ...entry
}: Omit<EntryProps, "off" | "ink"> & {
  readonly shown: boolean;
  readonly onPress: () => void;
}) {
  const focus = useFocusRing();
  const s = useSoneStyles(({ tokens: t }) => ({
    rest: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: t.controlHXs,
      paddingHorizontal: t.space2,
      borderRadius: t.radiusSm,
    } satisfies ViewStyle,
    pressed: { backgroundColor: t.surfaceHover } satisfies ViewStyle,
    focused: shadow(t.focusRing),
    ink: t.textPrimary,
  }));
  return (
    <Pressable
      {...toggleA11y(shown)}
      onPress={onPress}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        s.rest,
        entry.column && { flexGrow: 1 },
        pressed && s.pressed,
        focus.focused && s.focused,
      ]}
    >
      {({ pressed }) => (
        <LegendEntry
          {...entry}
          off={!shown}
          ink={pressed && shown ? s.ink : undefined}
        />
      )}
    </Pressable>
  );
}
