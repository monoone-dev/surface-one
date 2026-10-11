// Small DOM helpers the Vue and React components share. Browser-only unless noted.

/**
 * Arrow keys (and Home / End) move focus between the enabled `[data-slot=slot]`
 * items inside `host` — toggle groups and tab lists. Left / Right, or Up / Down when
 * `vertical`; wraps around. Prevents the default only for a key it handles.
 */
export function moveGroupFocus(
  host: HTMLElement,
  slot: string,
  vertical: boolean,
  event: { readonly key: string; preventDefault(): void },
): void {
  const prev = vertical ? "ArrowUp" : "ArrowLeft";
  const next = vertical ? "ArrowDown" : "ArrowRight";
  const key = event.key;
  if (key !== prev && key !== next && key !== "Home" && key !== "End") return;
  const items = Array.from(
    host.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
  ).filter(
    (el) =>
      !(el as HTMLButtonElement).disabled &&
      el.getAttribute("aria-disabled") !== "true",
  );
  const at = items.indexOf(host.ownerDocument.activeElement as HTMLElement);
  if (at < 0 || items.length < 2) return;
  const to =
    key === "Home"
      ? 0
      : key === "End"
        ? items.length - 1
        : (at + (key === next ? 1 : -1) + items.length) % items.length;
  event.preventDefault();
  items[to]?.focus();
}

/**
 * `items` sorted into document order by their elements; an item not mounted yet
 * keeps its place. Server-safe: it never touches the `Node` global.
 */
export function inDocumentOrder<T>(
  items: readonly T[],
  element: (item: T) => Element | null | undefined,
): T[] {
  return [...items].sort((a, b) => {
    const x = element(a);
    const y = element(b);
    if (!x || !y) return 0;
    // 4: Node.DOCUMENT_POSITION_FOLLOWING (no `Node` global on the server).
    return x.compareDocumentPosition(y) & 4 ? -1 : 1;
  });
}
