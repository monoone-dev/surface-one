import { Comment, Fragment, type Component, type VNode } from "vue";

/** The slot's vnodes with fragments (`v-for`, `<template>`) flattened and comments dropped. */
export function flatten(nodes: readonly VNode[] | undefined): VNode[] {
  const out: VNode[] = [];
  for (const node of nodes ?? []) {
    if (node.type === Comment) continue;
    if (node.type === Fragment && Array.isArray(node.children)) {
      out.push(...flatten(node.children as VNode[]));
    } else {
      out.push(node);
    }
  }
  return out;
}

/** Whether a slot renders the given component at its top level — known while rendering, so SSR gets it right. */
export function hasPart(nodes: readonly VNode[], part: Component): boolean {
  return nodes.some((node) => node.type === part);
}

/** The text a slot renders (strings and the text of nested elements), as `textContent` would read it. */
export function vnodeText(nodes: readonly VNode[] | undefined): string {
  let out = "";
  for (const node of nodes ?? []) {
    if (node.type === Comment) continue;
    const children = node.children;
    if (typeof children === "string") out += children;
    else if (Array.isArray(children)) out += vnodeText(children as VNode[]);
    else if (
      children &&
      typeof children === "object" &&
      typeof (children as { default?: unknown }).default === "function"
    ) {
      // A component's default slot (`h(SoneKbd, null, () => "⌘K")`).
      out += vnodeText(
        (children as { default: () => VNode[] }).default() as VNode[],
      );
    }
  }
  return out;
}
