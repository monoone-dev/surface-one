// How a date picker's trigger is named, with no framework in it (Angular and the Vue and
// React twins, through @surface-one/core). A `<label for>` alone would replace the
// button's text, so the trigger is named by its labels AND the date it shows:
// "Due date, October 24, 2026".

/**
 * The `aria-labelledby` for a date picker trigger: the ids of its `<label>`s (one gets
 * an id when it has none) followed by `valueId`, or `null` when nothing labels it.
 * Browser-only — call it after render.
 */
export function datePickerLabelledBy(
  trigger: HTMLButtonElement | null,
  valueId: string,
): string | null {
  const labels = trigger?.labels ? Array.from(trigger.labels) : [];
  if (labels.length === 0) return null;
  const ids = labels.map(
    (label, i) => label.id || (label.id = `${valueId}-label-${i}`),
  );
  return [...ids, valueId].join(" ");
}
