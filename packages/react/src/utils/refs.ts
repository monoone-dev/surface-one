import type { Ref, RefCallback } from "react";

/** One ref callback that feeds several refs (the caller's `ref` and the component's own). */
export function mergeRefs<T>(
  ...refs: (Ref<T> | undefined | null)[]
): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        return typeof cleanup === "function" ? cleanup : () => ref(null);
      }
      if (ref) (ref as { current: T | null }).current = node;
      return () => {
        if (ref) (ref as { current: T | null }).current = null;
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  };
}
