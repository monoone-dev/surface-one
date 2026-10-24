/**
 * The open / closed bookkeeping of an accordion, shared by every framework. Pure: no
 * Angular, no DOM globals (the Vue, React and React Native twins bundle it through
 * the private core package).
 */

/** `single`: at most one item open; `multiple`: any number. */
export type AccordionType = "single" | "multiple";

/**
 * The open items: one value (or `null`) for a `single` accordion, a list for a
 * `multiple` one. Either shape is read by both types.
 */
export type AccordionValue = string | readonly string[] | null;

/** The open item values of `value`, whatever its shape. */
export function accordionOpenValues(
  value: AccordionValue | undefined,
): string[] {
  if (value === null || value === undefined) return [];
  return typeof value === "string" ? [value] : [...value];
}

/** Whether the item `item` is open in `value`. */
export function isAccordionItemOpen(
  value: AccordionValue | undefined,
  item: string,
): boolean {
  return accordionOpenValues(value).includes(item);
}

/**
 * The value after the trigger of `item` is pressed. A `single` accordion opens it and
 * closes the others; pressing the open item closes it only when `collapsible`
 * (otherwise the value does not change and the same object is returned). A
 * `multiple` accordion toggles it in the list.
 */
export function toggleAccordionValue(
  value: AccordionValue | undefined,
  item: string,
  type: AccordionType,
  collapsible: boolean,
): AccordionValue {
  const open = accordionOpenValues(value);
  if (type === "multiple")
    return open.includes(item)
      ? open.filter((v) => v !== item)
      : [...open, item];
  if (open[0] === item && open.length === 1)
    return collapsible ? null : (value ?? null);
  return item;
}
