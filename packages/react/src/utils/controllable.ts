"use client";

import { useCallback, useRef, useState } from "react";

/**
 * A value that works both controlled (`value` + `onValueChange`) and uncontrolled
 * (`defaultValue`), the React twin of the Vue `v-model` props: the component reads the
 * prop while the owner passes one, otherwise keeps its own state, and reports every
 * change it makes itself.
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [local, setLocal] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : local;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const currentRef = useRef(current);
  currentRef.current = current;
  const set = useCallback(
    (next: T) => {
      if (Object.is(next, currentRef.current)) return;
      currentRef.current = next;
      if (!controlled) setLocal(next);
      onChangeRef.current?.(next);
    },
    [controlled],
  );
  return [current, set];
}
