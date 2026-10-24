import type { ReactElement } from "react";
import {
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  comboboxSelectedOptions,
  comboboxToggle,
  filterComboboxItems,
  isComboboxSelected,
  soneCommandFilter,
  type SoneComboboxItems,
  type SoneComboboxOption,
  type SoneComboboxValue,
  type SoneCommandFilter,
} from "@surface-one/core/combobox";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { fontFamily, shadow, weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneSearchField } from "../search-field/search-field";
import { SoneSheet, SoneSheetFooter, SoneSheetTitle } from "../sheet/sheet";

export type {
  SoneComboboxGroup,
  SoneComboboxItems,
  SoneComboboxOption,
  SoneComboboxValue,
} from "@surface-one/core/combobox";

export interface SoneComboboxProps {
  /** The options: `{ value, label, disabled?, keywords? }`, or `{ label, options }` groups. */
  readonly options: SoneComboboxItems;
  /** Pick several options; the value is then a list. */
  readonly multiple?: boolean;
  /** The picked value (`null` while none) or a list, controlled with `onValueChange`; or `defaultValue`. */
  readonly value?: SoneComboboxValue;
  readonly defaultValue?: SoneComboboxValue;
  readonly onValueChange?: (value: SoneComboboxValue) => void;
  /** The typed search, controlled with `onSearchChange`; it clears when the sheet closes. */
  readonly search?: string;
  readonly onSearchChange?: (search: string) => void;
  /** The list sheet is open, controlled with `onOpenChange`; or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Filter the options by the search. Turn off when they come filtered from a server. */
  readonly shouldFilter?: boolean;
  /** A custom match function (default `soneCommandFilter`, as on the web). */
  readonly filter?: SoneCommandFilter;
  /** Shown while nothing is picked. */
  readonly placeholder?: string;
  /** The search field's placeholder (default: the "Search" message). */
  readonly searchPlaceholder?: string;
  /** Shown when no option matches (default: the messages' `comboboxEmpty`). */
  readonly emptyText?: string;
  /** A clear button while something is picked. */
  readonly clearable?: boolean;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  /** Names the field and the list sheet: "Framework". */
  readonly ariaLabel?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-combobox>` on a phone: a field-styled trigger showing the picked label(s) that
 * opens a sheet with a search field over the options (filtered as on the web, by
 * `soneCommandFilter`). A single pick closes the sheet; with `multiple` each press
 * toggles an option and Done closes it.
 */
export function SoneCombobox({
  options,
  multiple = false,
  value: valueProp,
  defaultValue,
  onValueChange,
  search: searchProp,
  onSearchChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  shouldFilter = true,
  filter = soneCommandFilter,
  placeholder = "",
  searchPlaceholder,
  emptyText,
  clearable = false,
  disabled = false,
  invalid = false,
  ariaLabel,
  style,
  testID,
}: SoneComboboxProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable<SoneComboboxValue>(
    valueProp,
    defaultValue ?? (multiple ? [] : null),
    onValueChange,
  );
  const [search, setSearch] = useControllable<string>(
    searchProp,
    "",
    onSearchChange,
  );
  const [open, setOpenState] = useControllable<boolean>(
    openProp,
    defaultOpen ?? false,
    onOpenChange,
  );
  const focus = useFocusRing();
  const s = useSoneStyles((th) => {
    const t = th.tokens;
    const ring = (r: string) => [t.inputShadow, r].filter(Boolean).join(", ");
    return {
      row: {
        flexDirection: "row",
        alignItems: "center",
        gap: t.space2,
      } as ViewStyle,
      trigger: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: t.controlGapMd,
        minHeight: t.controlHMd,
        paddingHorizontal: t.controlPxMd,
        borderWidth: t.borderWidthThin,
        borderColor: t.comboboxInputBorder,
        borderRadius: t.controlRadius,
        backgroundColor: t.comboboxInputBg,
        ...shadow(t.inputShadow),
      } as ViewStyle,
      pressed: { borderColor: t.inputHoverBorder } as ViewStyle,
      focused: {
        borderColor: t.accentEdge,
        boxShadow: ring(t.focusRing),
      } as ViewStyle,
      invalid: {
        borderColor: t.invalidBorder,
        boxShadow: ring(
          `0px 0px 0px ${t.invalidRingRest}px ${t.invalidRingColor}`,
        ),
      } as ViewStyle,
      disabled: {
        opacity: t.disabledOpacity,
        backgroundColor: t.inputDisabledBg,
      } as ViewStyle,
      list: { gap: t.space1 } as ViewStyle,
      label: {
        paddingHorizontal: t.menuItemPx,
        paddingTop: t.space2,
        paddingBottom: t.menuLabelPy,
      } as ViewStyle,
      option: {
        flexDirection: "row",
        alignItems: "center",
        gap: t.menuItemGap,
        minHeight: t.menuItemH,
        paddingHorizontal: t.menuItemPx,
        paddingVertical: t.menuItemPy,
        borderRadius: t.menuItemRadius,
      } as ViewStyle,
      optionPressed: { backgroundColor: t.surfaceHover } as ViewStyle,
      optionDisabled: { opacity: t.disabledOpacity } as ViewStyle,
      empty: {
        paddingVertical: t.space6,
        alignItems: "center",
      } as ViewStyle,
      fg: {
        color: t.textPrimary,
        fontSize: t.controlFontSize,
        fontFamily: fontFamily(th),
        lineHeight: Math.round(t.controlFontSize * t.leadingSm),
        iconSize: t.controlIcon,
      },
      placeholderInk: t.textTertiary,
      mutedInk: t.textMuted,
      labelInk: t.textTertiary,
      checkInk: t.textPrimary,
      weight: weight(t.fontWeightMedium),
    };
  });

  const setOpen = (next: boolean): void => {
    setOpenState(next);
    if (!next && search) setSearch("");
  };
  const picked = comboboxSelectedOptions(options, value);
  const shown = picked.map((o) => o.label).join(", ");
  const sections = filterComboboxItems(
    options,
    shouldFilter ? search : "",
    filter,
  );
  const choose = (option: SoneComboboxOption): void => {
    if (option.disabled) return;
    setValue(comboboxToggle(value, option.value, multiple));
    if (!multiple) setOpen(false);
  };
  const name = ariaLabel ?? placeholder;

  return (
    <View style={[s.row, style]}>
      <Pressable
        role="button"
        // The name says the field and its value: "Framework: Nuxt.js".
        aria-label={
          ariaLabel
            ? [ariaLabel, shown || placeholder].filter(Boolean).join(": ")
            : undefined
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPress={() => setOpen(true)}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        testID={testID}
        style={({ pressed }) => [
          s.trigger,
          pressed && !disabled && s.pressed,
          (focus.focused || open) && s.focused,
          invalid && s.invalid,
          disabled && s.disabled,
        ]}
      >
        <SoneForegroundProvider value={s.fg}>
          <SoneText
            numberOfLines={1}
            style={[{ flex: 1 }, !shown && { color: s.placeholderInk }]}
          >
            {shown || placeholder}
          </SoneText>
          <SoneIcon name="chevron-down" color={s.mutedInk} />
        </SoneForegroundProvider>
      </Pressable>
      {clearable && picked.length > 0 && !disabled ? (
        <SoneButton
          variant="ghost"
          size="icon"
          aria-label={messages.comboboxClear}
          onPress={() => setValue(multiple ? [] : null)}
        >
          <SoneIcon name="close" />
        </SoneButton>
      ) : null}
      {open ? (
        <SoneSheet
          side="bottom"
          ariaLabel={name}
          onDismiss={() => setOpen(false)}
        >
          {name ? <SoneSheetTitle>{name}</SoneSheetTitle> : null}
          <SoneSearchField
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
            clearable
            autoFocus
          />
          <ScrollView>
            <SoneForegroundProvider value={s.fg}>
              {sections.length === 0 ? (
                <View style={s.empty}>
                  <SoneText role="status" style={{ color: s.mutedInk }}>
                    {emptyText ?? messages.comboboxEmpty}
                  </SoneText>
                </View>
              ) : (
                <View
                  role={multiple ? "group" : "radiogroup"}
                  aria-label={name || undefined}
                  style={s.list}
                >
                  {sections.map((section, i) => (
                    <View
                      key={section.label ?? `-${i}`}
                      role={section.label ? "group" : undefined}
                      aria-label={section.label ?? undefined}
                    >
                      {section.label ? (
                        <View style={s.label}>
                          <SoneText size="xs" style={{ color: s.labelInk }}>
                            {section.label}
                          </SoneText>
                        </View>
                      ) : null}
                      {section.options.map((o) => {
                        const on = isComboboxSelected(value, o.value);
                        return (
                          <Pressable
                            key={o.value}
                            role={multiple ? "checkbox" : "radio"}
                            aria-checked={on}
                            aria-disabled={o.disabled || undefined}
                            disabled={o.disabled}
                            onPress={() => choose(o)}
                            style={({ pressed }) => [
                              s.option,
                              pressed && s.optionPressed,
                              o.disabled && s.optionDisabled,
                            ]}
                          >
                            <SoneText
                              style={[
                                { flex: 1 },
                                on && { fontWeight: s.weight },
                              ]}
                            >
                              {o.label}
                            </SoneText>
                            {on ? (
                              <SoneIcon name="check" color={s.checkInk} />
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
            </SoneForegroundProvider>
          </ScrollView>
          {multiple ? (
            <SoneSheetFooter>
              <SoneButton onPress={() => setOpen(false)}>
                {messages.comboboxDone}
              </SoneButton>
            </SoneSheetFooter>
          ) : null}
        </SoneSheet>
      ) : null}
    </View>
  );
}
