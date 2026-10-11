import {
  createElement,
  type ComponentPropsWithRef,
  type ElementType,
  type ReactElement,
} from "react";

type Attrs = Record<string, unknown>;

/**
 * The props of a polymorphic part: its own props, `as` (the element or component it
 * renders instead of the default tag — `"a"`, Next.js `Link`, …) and every prop of
 * whatever it renders, `ref` included.
 */
export type PolymorphicProps<E extends ElementType, Own = object> = Own & {
  /** The element or component to render instead of the default tag. */
  readonly as?: E;
} & Omit<ComponentPropsWithRef<E>, keyof Own | "as">;

/** Joins class names, skipping the empty ones. */
export function cx(...names: unknown[]): string | undefined {
  const out = names.filter((n) => typeof n === "string" && n !== "").join(" ");
  return out === "" ? undefined : out;
}

/** `''` when on, left out when off — for presence attributes such as `data-inset`. */
export const flag = (on: boolean | undefined): "" | undefined =>
  on ? "" : undefined;

interface PartSpec<D extends ElementType, Own extends object> {
  /** The component name, `Sone*` (its `displayName`). */
  readonly name: string;
  /** The default tag. */
  readonly tag: D;
  /** The shared stylesheet class (the Angular host class), if any. */
  readonly className?: string;
  /** `data-slot`, the same as in @surface-one/angular. */
  readonly slot: string;
  /** Attributes that never change. */
  readonly static?: Attrs;
  /** The own props, read by `attrs` and never passed to the element. */
  readonly props?: readonly (keyof Own & string)[];
  /** Attributes derived from the own props (`undefined` leaves one out). */
  readonly attrs?: (props: Own) => Attrs;
}

export type PartComponent<D extends ElementType, Own extends object> = {
  <E extends ElementType = D>(props: PolymorphicProps<E, Own>): ReactElement;
  displayName?: string;
};

/**
 * A part that is only an element with the SurfaceOne class, `data-slot` and a few
 * data / ARIA attributes — the React twin of an Angular attribute directive such as
 * `[soneCardHeader]`. `className` is merged; every other prop (`ref`, `id`,
 * `onClick`, `aria-*`) goes to the element and wins over the derived attributes.
 */
export function definePart<D extends ElementType, Own extends object = object>(
  spec: PartSpec<D, Own>,
): PartComponent<D, Own> {
  const ownKeys = spec.props ?? [];
  const Part = (props: PolymorphicProps<ElementType, Own>): ReactElement => {
    const { as, className, ...rest } = props as Attrs & {
      as?: ElementType;
      className?: string;
    };
    const own: Attrs = {};
    for (const key of ownKeys) {
      own[key] = rest[key];
      delete rest[key];
    }
    return createElement(as ?? spec.tag, {
      "data-slot": spec.slot,
      ...spec.static,
      ...spec.attrs?.(own as Own),
      ...rest,
      className: cx(spec.className, className),
    });
  };
  Part.displayName = spec.name;
  return Part as PartComponent<D, Own>;
}
