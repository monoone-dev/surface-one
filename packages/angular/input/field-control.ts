// How a field ([soneField], SoneField) wires its control, with no framework in it: Angular
// calls it after every render, the Vue and React twins (through @surface-one/core) after
// every update. It points the first control's aria-describedby at the field's description
// and error ids and sets aria-invalid, keeping whatever ids the control had of its own.

/** The first form control inside a field, input-group controls first. */
export const FIELD_CONTROL_SELECTOR =
  '[data-slot="input-group-control"] input, input[data-slot="input-group-control"], ' +
  'textarea[data-slot="input-group-control"], input:not([type="hidden"]), select, textarea';

/** What the field last wrote on its control, so the next sync can take it back. */
export interface FieldControlState {
  readonly el: Element;
  readonly ids: readonly string[];
  readonly invalid: boolean;
}

const sameIds = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i]);

function unwrite(prev: FieldControlState): void {
  const rest = (prev.el.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter((t) => t && !prev.ids.includes(t));
  if (rest.length) prev.el.setAttribute("aria-describedby", rest.join(" "));
  else prev.el.removeAttribute("aria-describedby");
  if (prev.invalid) prev.el.removeAttribute("aria-invalid");
}

/**
 * Brings the field's control in line with `ids` and `invalid`; returns the new state to pass
 * back next time (`null` once the field holds no control).
 */
export function syncFieldControl(
  host: Element | null,
  prev: FieldControlState | null,
  ids: readonly string[],
  invalid: boolean,
): FieldControlState | null {
  const el = host?.querySelector(FIELD_CONTROL_SELECTOR) ?? null;
  let current = prev;
  if (current && current.el !== el) {
    unwrite(current);
    current = null;
  }
  if (!el) return null;
  if (current && sameIds(current.ids, ids) && current.invalid === invalid)
    return current;
  const own = (el.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter((t) => t && !(current?.ids ?? []).includes(t));
  const merged = [...own, ...ids.filter((id) => !own.includes(id))];
  if (merged.length) el.setAttribute("aria-describedby", merged.join(" "));
  else el.removeAttribute("aria-describedby");
  if (invalid) el.setAttribute("aria-invalid", "true");
  else if (current?.invalid) el.removeAttribute("aria-invalid");
  return { el, ids, invalid };
}
