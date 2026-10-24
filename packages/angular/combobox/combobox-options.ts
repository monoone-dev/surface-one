// The combobox's options, filtering, highlight and selection, with no framework in it:
// `sone-combobox` and its Vue, React and React Native twins (through @surface-one/core)
// filter and move the same way. Matching is passed in — the command's `soneCommandFilter`
// by default in every component — so this file imports nothing.

/** Decides whether an option matches the search (the shape of `SoneCommandFilter`). */
export type SoneComboboxFilter = (
  label: string,
  search: string,
  keywords: readonly string[],
) => boolean;

/** One option: `value` is what the combobox holds, `label` what it shows and matches. */
export interface SoneComboboxOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
  /** Extra search terms. */
  readonly keywords?: readonly string[];
}

/** A labelled group of options. */
export interface SoneComboboxGroup {
  readonly label: string;
  readonly options: readonly SoneComboboxOption[];
}

/** What `options` takes: options, groups, or both mixed. */
export type SoneComboboxItems = readonly (
  SoneComboboxOption | SoneComboboxGroup
)[];

/** The value: one option's (`null` while none) or, with `multiple`, a list. */
export type SoneComboboxValue = string | null | readonly string[];

/** The options left after a search, in their groups (`label: null` for the ungrouped ones). */
export interface SoneComboboxSection {
  readonly label: string | null;
  readonly options: readonly SoneComboboxOption[];
}

const isGroup = (
  item: SoneComboboxOption | SoneComboboxGroup,
): item is SoneComboboxGroup =>
  Array.isArray((item as SoneComboboxGroup).options);

/** Every option, groups flattened, in order. */
export function comboboxOptions(
  items: SoneComboboxItems,
): SoneComboboxOption[] {
  return items.flatMap((item) => (isGroup(item) ? item.options : [item]));
}

/**
 * The options `filter` keeps for `search` (matched on the label, the keywords and
 * the value), as sections: ungrouped options in a row share one
 * section, each group is its own, and an emptied group is dropped.
 */
export function filterComboboxItems(
  items: SoneComboboxItems,
  search: string,
  filter: SoneComboboxFilter,
): SoneComboboxSection[] {
  const q = search.trim();
  const matches = (o: SoneComboboxOption): boolean =>
    !q || filter(o.label, q, [...(o.keywords ?? []), o.value]);
  const sections: { label: string | null; options: SoneComboboxOption[] }[] =
    [];
  for (const item of items) {
    if (isGroup(item)) {
      const options = item.options.filter(matches);
      if (options.length) sections.push({ label: item.label, options });
    } else if (matches(item)) {
      const last = sections[sections.length - 1];
      if (last && last.label === null) last.options.push(item);
      else sections.push({ label: null, options: [item] });
    }
  }
  return sections;
}

/** True when `optionValue` is picked in `value`. */
export function isComboboxSelected(
  value: SoneComboboxValue,
  optionValue: string,
): boolean {
  return Array.isArray(value)
    ? value.includes(optionValue)
    : value === optionValue;
}

/** The value after choosing `optionValue`: it replaces a single value, and toggles in a list. */
export function comboboxToggle(
  value: SoneComboboxValue,
  optionValue: string,
  multiple: boolean,
): SoneComboboxValue {
  if (!multiple) return optionValue;
  const list = Array.isArray(value) ? (value as readonly string[]) : [];
  return list.includes(optionValue)
    ? list.filter((v) => v !== optionValue)
    : [...list, optionValue];
}

/** The picked options, in the value's order (a value with no option is skipped). */
export function comboboxSelectedOptions(
  items: SoneComboboxItems,
  value: SoneComboboxValue,
): SoneComboboxOption[] {
  const all = comboboxOptions(items);
  const values = Array.isArray(value)
    ? (value as readonly string[])
    : value === null
      ? []
      : [value as string];
  return values
    .map((v) => all.find((o) => o.value === v))
    .filter((o): o is SoneComboboxOption => !!o);
}

/** Moves an index for a key (the shape of `listNavigationIndex`). */
export type SoneComboboxNavigate = (
  key: string,
  current: number,
  count: number,
) => number | null;

/**
 * Where the highlight goes for `key` among `visible`, skipping disabled options,
 * moved by `navigate` (the list-navigation keys: Up / Down, Home / End, PageUp /
 * PageDown): the option's value, or `null` when the key does not move.
 */
export function comboboxNavigate(
  key: string,
  active: string | null,
  visible: readonly SoneComboboxOption[],
  navigate: SoneComboboxNavigate,
): string | null {
  const enabled = visible.filter((o) => !o.disabled);
  const current = enabled.findIndex((o) => o.value === active);
  const next = navigate(key, current, enabled.length);
  return next === null ? null : (enabled[next]?.value ?? null);
}

/**
 * The option to highlight: `active` while it is visible and enabled, else the first
 * picked one that is, else the first enabled one — or `null`.
 */
export function comboboxActiveOption(
  visible: readonly SoneComboboxOption[],
  active: string | null,
  value: SoneComboboxValue,
): SoneComboboxOption | null {
  const enabled = visible.filter((o) => !o.disabled);
  return (
    enabled.find((o) => o.value === active) ??
    enabled.find((o) => isComboboxSelected(value, o.value)) ??
    enabled[0] ??
    null
  );
}

/**
 * The ids of the `<label>`s of `control` (one gets an id when it has none), for the
 * listbox's `aria-labelledby` — or `null` when nothing labels it. Browser-only.
 */
export function comboboxLabelIds(
  control: HTMLInputElement | null,
  idPrefix: string,
): string | null {
  const labels = control?.labels ? Array.from(control.labels) : [];
  if (labels.length === 0) return null;
  return labels
    .map((label, i) => label.id || (label.id = `${idPrefix}-label-${i}`))
    .join(" ");
}

/** A stable DOM id for an option: `<listId>-<index of the option>`. */
export function comboboxOptionId(listId: string, index: number): string {
  return `${listId}-option-${index}`;
}
