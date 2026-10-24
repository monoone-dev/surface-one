import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import { View, type TextStyle, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";
import { SoneText, type SoneTextProps } from "../../theme/foreground";
import { weight } from "../../theme/style";

export type FieldOrientation = "vertical" | "horizontal";

type TextKind = "label" | "hint";

interface FieldContextValue {
  readonly invalid: boolean;
  readonly disabled: boolean;
  readonly label?: string;
  readonly hint?: string;
  setText(kind: TextKind, id: string, text: string | null): void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** The plain text of children (strings inside elements too), for an accessible name. */
function plainText(children: ReactNode): string {
  return Children.toArray(children)
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? String(c)
        : isValidElement<{ children?: ReactNode }>(c)
          ? plainText(c.props.children)
          : "",
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * What a control inside a `SoneField` inherits: its own props win, then the field's
 * `invalid` / `disabled`, its label (the accessible name) and its description and error
 * (the accessibility hint — `aria-describedby` on the web).
 */
export function useSoneFieldControl(own: {
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly hint?: string;
}) {
  const field = useContext(FieldContext);
  return {
    invalid: own.invalid ?? field?.invalid ?? false,
    disabled: own.disabled ?? field?.disabled ?? false,
    label: own.label ?? field?.label,
    hint: own.hint ?? field?.hint,
  };
}

/** A label, description or error: hands its text to the field. */
function useFieldText(kind: TextKind, children: ReactNode): void {
  const field = useContext(FieldContext);
  const id = useId();
  const text = plainText(children);
  const setText = field?.setText;
  useLayoutEffect(() => {
    if (!setText) return;
    setText(kind, id, text || null);
    return () => setText(kind, id, null);
  }, [setText, kind, id, text]);
}

export interface SoneFieldProps extends ViewProps {
  readonly orientation?: FieldOrientation;
  readonly invalid?: boolean;
  readonly disabled?: boolean;
}

/**
 * `[soneField]` — a label, a control and its help / error text. The control inside takes
 * the label as its name, the description and error as its hint, and `invalid` /
 * `disabled`.
 */
export function SoneField({
  orientation = "vertical",
  invalid = false,
  disabled = false,
  style,
  ...rest
}: SoneFieldProps): ReactElement {
  const t = useSoneTheme().tokens;
  const [texts, setTexts] = useState<
    Record<TextKind, Readonly<Record<string, string>>>
  >({ label: {}, hint: {} });
  const setText = useCallback(
    (kind: TextKind, id: string, text: string | null) =>
      setTexts((prev) => {
        if ((prev[kind][id] ?? null) === text) return prev;
        const next = { ...prev[kind] };
        if (text === null) delete next[id];
        else next[id] = text;
        return { ...prev, [kind]: next };
      }),
    [],
  );
  const context = useMemo<FieldContextValue>(() => {
    const join = (r: Readonly<Record<string, string>>) =>
      Object.values(r).join(". ") || undefined;
    return {
      invalid,
      disabled,
      label: join(texts.label),
      hint: join(texts.hint),
      setText,
    };
  }, [invalid, disabled, texts, setText]);
  return (
    <FieldContext.Provider value={context}>
      <View
        role="group"
        {...rest}
        style={[
          {
            flexDirection: orientation === "horizontal" ? "row" : "column",
            alignItems: orientation === "horizontal" ? "center" : "stretch",
            gap: t.fieldGap,
            width: "100%",
          },
          style,
        ]}
      />
    </FieldContext.Provider>
  );
}

/** Small medium-weight text: the look of the labels and titles. */
function useLabelStyle(leading: number, danger: boolean): TextStyle {
  const t = useSoneTheme().tokens;
  const field = useContext(FieldContext);
  return {
    color: danger && field?.invalid ? t.dangerText : t.textPrimary,
    fontSize: t.fontSizeSm,
    fontWeight: weight(t.fontWeightMedium),
    lineHeight: Math.round(t.fontSizeSm * leading),
    ...(field?.disabled ? { opacity: t.disabledOpacity } : {}),
  };
}

/** `label[soneLabel]` — a label; inside a field it names the field's control. */
export function SoneLabel({
  style,
  children,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  useFieldText("label", children);
  const look = useLabelStyle(t.leadingNone, false);
  return (
    <SoneText {...rest} style={[look, style]}>
      {children}
    </SoneText>
  );
}

/** `[soneFieldLabel]` — the field's label (destructive while the field is invalid). */
export function SoneFieldLabel({
  style,
  children,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  useFieldText("label", children);
  const look = useLabelStyle(t.fieldLabelLeading, true);
  return (
    <SoneText {...rest} style={[look, style]}>
      {children}
    </SoneText>
  );
}

/** `[soneFieldLabelOptional]` — the quiet "Optional" marker inside a label. */
export function SoneFieldLabelOptional({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textMuted,
          fontSize: t.fontSizeXs,
          fontWeight: weight(t.fontWeightNormal),
        },
        style,
      ]}
    />
  );
}

/** `[soneFieldTitle]` — a title for a field whose control is not a text field. */
export function SoneFieldTitle({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  const look = useLabelStyle(t.leadingSnug, true);
  return <SoneText {...rest} style={[look, style]} />;
}

function helpStyle(
  t: ReturnType<typeof useSoneTheme>["tokens"],
  color: string,
): TextStyle {
  return {
    color,
    fontSize: t.fontSizeSm,
    fontWeight: weight(t.fontWeightNormal),
    lineHeight: Math.round(t.fontSizeSm * t.leadingNormal),
  };
}

/** `[soneFieldDescription]` — help text the field's control is described by. */
export function SoneFieldDescription({
  style,
  children,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  const field = useContext(FieldContext);
  useFieldText("hint", children);
  return (
    <SoneText
      {...rest}
      style={[
        helpStyle(t, t.textSecondary),
        field?.disabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {children}
    </SoneText>
  );
}

/** `[soneFieldError]` — an error (`role="alert"`) the field's control is described by. */
export function SoneFieldError({
  style,
  children,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  useFieldText("hint", children);
  return (
    <SoneText
      role="alert"
      {...rest}
      style={[helpStyle(t, t.dangerText), style]}
    >
      {children}
    </SoneText>
  );
}

/** `[soneFieldContent]` — the label and description beside a switch or checkbox. */
export function SoneFieldContent({ style, ...rest }: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          flex: 1,
          flexDirection: "column",
          gap: t.fieldContentGap,
          minWidth: 0,
        },
        style,
      ]}
    />
  );
}

export interface SoneFieldGroupProps extends ViewProps {
  readonly variant?: "default" | "choices";
}

/** `[soneFieldGroup]` — fields stacked with the form rhythm (tighter for choices). */
export function SoneFieldGroup({
  variant = "default",
  style,
  ...rest
}: SoneFieldGroupProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "column",
          gap: variant === "choices" ? t.space3 : t.fieldGroupGap,
          width: "100%",
        },
        style,
      ]}
    />
  );
}

/** `fieldset[soneFieldSet]` — a group of fields under a `SoneFieldLegend`. */
export function SoneFieldSet({ style, ...rest }: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      role="group"
      {...rest}
      style={[{ flexDirection: "column", gap: t.fieldSetGap }, style]}
    />
  );
}

export interface SoneFieldLegendProps extends SoneTextProps {
  readonly variant?: "legend" | "label";
}

/** `legend[soneFieldLegend]` — the heading of a field set. */
export function SoneFieldLegend({
  variant = "legend",
  style,
  ...rest
}: SoneFieldLegendProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      role="heading"
      {...rest}
      style={[
        {
          marginBottom: t.fieldLegendMb,
          color: t.textPrimary,
          fontSize: variant === "label" ? t.fontSizeSm : t.fontSizeBase,
          fontWeight: weight(t.fontWeightMedium),
        },
        style,
      ]}
    />
  );
}

/** `[soneFieldSeparator]` — a rule between fields, with optional text ("or") on it. */
export function SoneFieldSeparator({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      role="separator"
      {...rest}
      style={[
        {
          height: t.space1 * 5,
          marginVertical: -t.space2,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          borderTopWidth: t.borderWidthThin,
          borderColor: t.border,
        }}
      />
      {children != null ? (
        <View
          style={{
            paddingHorizontal: t.space2,
            backgroundColor: t.fieldSeparatorBg,
          }}
        >
          <SoneText style={{ color: t.textSecondary, fontSize: t.fontSizeSm }}>
            {children}
          </SoneText>
        </View>
      ) : null}
    </View>
  );
}
