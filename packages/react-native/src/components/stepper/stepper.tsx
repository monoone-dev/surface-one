import type { ReactElement } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  type SoneForeground,
} from "../../theme/foreground";
import { weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneIcon } from "../icon/icon";
import { currentProps } from "../../utils/a11y";

/** One step of a `SoneStepper`. `key` must be unique. */
export interface SoneStep {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  /** This step can never be pressed. */
  readonly disabled?: boolean;
}

export type StepperVariant = "dots" | "numbered";
export type StepperOrientation = "horizontal" | "vertical";
export type StepState = "completed" | "active" | "inactive";

/** What `onStepPress` receives: the pressed step and its index. */
export interface SoneStepPress {
  readonly index: number;
  readonly step: SoneStep;
}

export interface SoneStepperProps {
  readonly steps?: readonly SoneStep[];
  /** The active step's index (controlled). */
  readonly current?: number;
  /** The active step's index at first (uncontrolled). */
  readonly defaultCurrent?: number;
  readonly onCurrentChange?: (index: number) => void;
  readonly onStepPress?: (press: SoneStepPress) => void;
  readonly variant?: StepperVariant;
  readonly orientation?: StepperOrientation;
  /** Only the steps up to the current one can be pressed. */
  readonly linear?: boolean;
  /** Read-only: no buttons at all. */
  readonly disabled?: boolean;
  readonly showCount?: boolean;
  /** The group's accessible name (default: the "Progress" message; `null` for none). */
  readonly "aria-label"?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

const NO_STEPS: readonly SoneStep[] = [];

function useStepperStyles(variant: StepperVariant, vertical: boolean) {
  return useSoneStyles(
    ({ tokens: t }) => {
      const numbered = variant === "numbered";
      const indicator = t.space1 * 7;
      return {
        host: {
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "flex-start" : "center",
          justifyContent: vertical ? "flex-start" : "space-between",
          gap: t.space4,
          minWidth: 0,
        } as ViewStyle,
        list: {
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "flex-start" : "center",
          gap: t.space2,
          minWidth: 0,
          flexGrow: numbered ? 1 : 0,
          flexShrink: 1,
        } as ViewStyle,
        item: {
          flexDirection: numbered && vertical ? "column" : "row",
          alignItems: numbered && vertical ? "flex-start" : "center",
          gap: numbered ? (vertical ? t.space1 : t.space3) : 0,
          minWidth: 0,
        } as ViewStyle,
        itemGrow: { flexGrow: 1, flexShrink: 1 } as ViewStyle,
        trigger: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: numbered ? "flex-start" : "center",
          gap: numbered ? t.space3 : t.space2,
          minWidth: numbered ? 0 : t.space1 * 6,
          height: numbered ? undefined : t.space1 * 6,
          borderRadius: numbered ? t.radiusMd : t.radiusPill,
        } as ViewStyle,
        focused: { boxShadow: t.focusRing } as ViewStyle,
        disabled: { opacity: t.disabledOpacity } as ViewStyle,
        indicator: {
          alignItems: "center",
          justifyContent: "center",
          borderRadius: t.radiusPill,
          backgroundColor: t.trackBg,
          boxShadow: `inset 0px 0px 0px ${t.borderWidthThin}px ${t.trackBorder}`,
          width: numbered ? indicator : t.space2,
          height: numbered ? indicator : t.space2,
        } as ViewStyle,
        indicatorOn: { backgroundColor: t.accent, boxShadow: "" } as ViewStyle,
        dotActive: { width: t.space2 * 3 } as ViewStyle,
        numberFg: {
          color: t.textSecondary,
          fontSize: t.fontSizeXs,
          fontWeight: weight(t.fontWeightMedium),
          fontVariant: ["tabular-nums"],
          iconSize: t.controlIconXs,
        } as Partial<SoneForeground>,
        onAccent: t.textOnAccent,
        title: {
          fontSize: t.fontSizeSm,
          fontWeight: weight(t.fontWeightMedium),
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
          color: t.textPrimary,
        },
        titleInactive: { color: t.textSecondary },
        description: {
          color: t.textSecondary,
          fontSize: t.fontSizeXs,
          lineHeight: Math.round(t.fontSizeXs * t.leadingXs),
        },
        separator: vertical
          ? ({
              width: t.borderWidthThin,
              height: t.space5,
              marginLeft: indicator / 2,
              backgroundColor: t.border,
            } as ViewStyle)
          : ({
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: t.space5,
              minWidth: t.space4,
              height: t.borderWidthThin,
              backgroundColor: t.border,
            } as ViewStyle),
        separatorDone: { backgroundColor: t.accent } as ViewStyle,
        count: { color: t.textMuted, flexShrink: 0 },
      };
    },
    [variant, vertical],
  );
}

type Styles = ReturnType<typeof useStepperStyles>;

function StepTrigger({
  step,
  index,
  state,
  variant,
  interactive,
  enabled,
  onPress,
  s,
}: {
  readonly step: SoneStep;
  readonly index: number;
  readonly state: StepState;
  readonly variant: StepperVariant;
  readonly interactive: boolean;
  readonly enabled: boolean;
  readonly onPress: () => void;
  readonly s: Styles;
}) {
  const focus = useFocusRing();
  const on = state !== "inactive";
  const numbered = variant === "numbered";
  const body = (
    <>
      <View
        aria-hidden
        style={[
          s.indicator,
          on && s.indicatorOn,
          !numbered && state === "active" && s.dotActive,
        ]}
      >
        {numbered ? (
          <SoneForegroundProvider
            value={on ? { ...s.numberFg, color: s.onAccent } : s.numberFg}
          >
            {state === "completed" ? (
              <SoneIcon name="check" />
            ) : (
              <SoneText>{index + 1}</SoneText>
            )}
          </SoneForegroundProvider>
        ) : null}
      </View>
      {/* Dots show no text: the label is the accessible name instead. */}
      {numbered ? (
        <View style={{ minWidth: 0, flexShrink: 1 }}>
          <SoneText style={[s.title, state === "inactive" && s.titleInactive]}>
            {step.label}
          </SoneText>
          {step.description ? (
            <SoneText style={s.description}>{step.description}</SoneText>
          ) : null}
        </View>
      ) : null}
    </>
  );
  const name = [step.label, step.description].filter(Boolean).join(", ");
  if (!interactive)
    return (
      <View
        accessible
        aria-label={name}
        {...currentProps(state === "active")}
        style={s.trigger}
      >
        {body}
      </View>
    );
  return (
    <Pressable
      role="button"
      aria-label={name}
      {...currentProps(state === "active")}
      disabled={!enabled}
      aria-disabled={!enabled || undefined}
      onPress={onPress}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={[s.trigger, focus.focused && s.focused, !enabled && s.disabled]}
    >
      {body}
    </Pressable>
  );
}

/**
 * `<sone-stepper>` — progress through a multi-step flow; `current` (controlled, with
 * `onCurrentChange`) or `defaultCurrent` is the active step's index. Dots, or numbered
 * circles with titles; a "Step 2 of 4" count after them.
 */
export function SoneStepper({
  steps = NO_STEPS,
  current: currentProp,
  defaultCurrent = 0,
  onCurrentChange,
  onStepPress,
  variant = "dots",
  orientation = "horizontal",
  linear = false,
  disabled = false,
  showCount = true,
  "aria-label": ariaLabel,
  style,
  testID,
}: SoneStepperProps): ReactElement {
  const messages = useSoneMessages();
  const [current, setCurrent] = useControllable(
    currentProp,
    defaultCurrent,
    onCurrentChange,
  );
  const vertical = orientation === "vertical";
  const s = useStepperStyles(variant, vertical);
  const n = steps.length;
  const c = Math.trunc(current);
  const index =
    n === 0 || !Number.isFinite(c) ? 0 : Math.min(Math.max(c, 0), n - 1);
  const stateOf = (i: number): StepState =>
    i < index ? "completed" : i === index ? "active" : "inactive";
  const canGo = (i: number): boolean => {
    const step = steps[i];
    if (!step || step.disabled || disabled) return false;
    return !linear || i <= index;
  };
  const go = (i: number): void => {
    if (!canGo(i)) return;
    setCurrent(i);
    onStepPress?.({ index: i, step: steps[i]! });
  };
  const numbered = variant === "numbered";
  return (
    <View
      role="group"
      aria-label={
        ariaLabel === undefined
          ? messages.stepperLabel
          : (ariaLabel ?? undefined)
      }
      testID={testID}
      style={[s.host, style]}
    >
      <View role="list" style={s.list}>
        {steps.map((step, i) => (
          <View
            key={step.key}
            role="listitem"
            style={[s.item, numbered && !vertical && i < n - 1 && s.itemGrow]}
          >
            <StepTrigger
              step={step}
              index={i}
              state={stateOf(i)}
              variant={variant}
              interactive={!disabled}
              enabled={canGo(i)}
              onPress={() => go(i)}
              s={s}
            />
            {numbered && i < n - 1 ? (
              <View
                aria-hidden
                style={[
                  s.separator,
                  stateOf(i) === "completed" && s.separatorDone,
                ]}
              />
            ) : null}
          </View>
        ))}
      </View>
      {showCount && n > 0 ? (
        <SoneText mono size="xs" numeric style={s.count}>
          {messages.stepCount(index + 1, n)}
        </SoneText>
      ) : null}
    </View>
  );
}
