import {
  defineComponent,
  h,
  type Component,
  type ComponentObjectPropsOptions,
  type ExtractPropTypes,
  type PropType,
  type Slots,
} from "vue";

/** What a part renders as: a tag name (`"section"`) or a component (`NuxtLink`). */
export type AsTag = string | Component;

export const asProp = {
  /** The element or component to render instead of the default tag. */
  as: {
    type: [String, Object, Function] as PropType<AsTag>,
    default: undefined,
  },
} as const;

type Attrs = Record<string, unknown>;

interface PartSpec<P extends ComponentObjectPropsOptions> {
  /** The component name, `Sone*`. */
  readonly name: string;
  /** The default tag. */
  readonly tag: string;
  /** The shared stylesheet class (the Angular host class), if any. */
  readonly className?: string;
  /** `data-slot`, the same as in @surface-one/angular. */
  readonly slot: string;
  /** Attributes that never change. */
  readonly static?: Attrs;
  readonly props?: P;
  /** Attributes derived from the props (`undefined` leaves one out). */
  readonly attrs?: (props: Readonly<ExtractPropTypes<P>>) => Attrs;
}

/**
 * A part that is only an element with the Surface One class, `data-slot` and a few
 * data / ARIA attributes — the Vue twin of an Angular attribute directive such as
 * `[soneCardHeader]`. Classes, attributes and listeners fall through to the element.
 */
export function definePart<
  const P extends ComponentObjectPropsOptions = Record<never, never>,
>(spec: PartSpec<P>) {
  return defineComponent({
    name: spec.name,
    props: { ...asProp, ...(spec.props ?? ({} as P)) },
    setup(rawProps, { slots }) {
      const props = rawProps as unknown as Readonly<ExtractPropTypes<P>> & {
        readonly as?: AsTag;
      };
      return () =>
        renderAs(
          props.as ?? spec.tag,
          {
            class: spec.className,
            "data-slot": spec.slot,
            ...spec.static,
            ...spec.attrs?.(props),
          },
          slots,
        );
    },
  });
}

/** An element gets the default slot's nodes; a component gets the slots themselves. */
export function renderAs(tag: AsTag, attrs: Attrs, slots: Slots) {
  // The server renderer prints `class=""` for an undefined class; leave the key out.
  if (attrs["class"] === undefined) delete attrs["class"];
  return typeof tag === "string"
    ? h(tag, attrs, slots.default?.())
    : h(tag, attrs, slots);
}

/** `''` when on, left out when off — for presence attributes such as `data-inset`. */
export const flag = (on: boolean): "" | undefined => (on ? "" : undefined);

/** A template ref's element, whether it points at an element or a component. */
export function toElement(ref: unknown): HTMLElement | null {
  if (ref instanceof HTMLElement) return ref;
  const el = (ref as { $el?: unknown } | null)?.$el;
  return el instanceof HTMLElement ? el : null;
}

/**
 * Splits the fallthrough attributes of a component whose host wraps a native control:
 * `class` / `style` style the host, everything else (`id`, `name`, listeners, ARIA)
 * belongs on the control.
 */
export function splitAttrs(attrs: Record<string, unknown>): {
  host: Attrs;
  control: Attrs;
} {
  const { class: cls, style, ...control } = attrs;
  const host: Attrs = {};
  if (cls !== undefined) host["class"] = cls;
  if (style !== undefined) host["style"] = style;
  return { host, control };
}
