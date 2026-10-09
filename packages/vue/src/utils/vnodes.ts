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
