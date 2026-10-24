// The React-only part of core: imported by module (`@surface-one/core/react/children`)
// from @surface-one/react and @surface-one/react-native, never from the core entry, so the
// Vue bundle never reaches React (test/react-only.test.ts checks).
import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";

/**
 * The children with arrays and fragments flattened (the Vue `flatten`); an element that
 * came out of a fragment gets the fragment's key in front of its own, so keys stay unique.
 */
export function flattenChildren(children: ReactNode, prefix = ""): ReactNode[] {
  const out: ReactNode[] = [];
  Children.toArray(children).forEach((child) => {
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.type === Fragment
    ) {
      out.push(
        ...flattenChildren(
          child.props.children,
          `${prefix}${String(child.key)}/`,
        ),
      );
    } else if (isValidElement(child) && prefix) {
      out.push(cloneElement(child, { key: `${prefix}${String(child.key)}` }));
    } else {
      out.push(child);
    }
  });
  return out;
}
