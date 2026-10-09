import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
  type InjectionKey,
  type PropType,
} from "vue";

import { asProp, definePart, renderAs, toElement } from "../../utils/part";

export type FieldOrientation = "vertical" | "horizontal" | "responsive";

const CONTROL_SELECTOR =
  '[data-slot="input-group-control"] input, input[data-slot="input-group-control"], ' +
  'textarea[data-slot="input-group-control"], input:not([type="hidden"]), select, textarea';

interface FieldContext {
  register(id: string): void;
  unregister(id: string): void;
}

const FIELD: InjectionKey<FieldContext> = Symbol("SoneField");

interface Written {
  readonly el: Element;
  readonly ids: readonly string[];
  readonly invalid: boolean;
}

const sameIds = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * `[soneField]` — a label, a control and its help / error text. It points the first
 * control's `aria-describedby` at every `SoneFieldDescription` / `SoneFieldError`
 * inside it and sets `aria-invalid` while `invalid`, keeping the control's own ids.
 */
export const SoneField = defineComponent({
  name: "SoneField",
  props: {
    ...asProp,
    orientation: {
      type: String as PropType<FieldOrientation>,
      default: "vertical",
    },
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const host = shallowRef<HTMLElement | null>(null);
    const describedBy = ref<string[]>([]);
    let written: Written | null = null;

    provide(FIELD, {
      register: (id) => {
        if (!describedBy.value.includes(id))
          describedBy.value = [...describedBy.value, id];
      },
      unregister: (id) => {
        describedBy.value = describedBy.value.filter((x) => x !== id);
      },
    });

    const unwrite = (prev: Written): void => {
      const rest = (prev.el.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((t) => t && !prev.ids.includes(t));
      if (rest.length) prev.el.setAttribute("aria-describedby", rest.join(" "));
      else prev.el.removeAttribute("aria-describedby");
      if (prev.invalid) prev.el.removeAttribute("aria-invalid");
    };

    const sync = (): void => {
      const el = host.value?.querySelector(CONTROL_SELECTOR) ?? null;
      if (written && written.el !== el) {
        unwrite(written);
        written = null;
      }
      if (!el) return;
      const ids = describedBy.value;
      const invalid = props.invalid;
      const current = written;
      if (current && sameIds(current.ids, ids) && current.invalid === invalid)
        return;
      const own = (el.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((t) => t && !(current?.ids ?? []).includes(t));
      const merged = [...own, ...ids.filter((id) => !own.includes(id))];
      if (merged.length) el.setAttribute("aria-describedby", merged.join(" "));
      else el.removeAttribute("aria-describedby");
      if (invalid) el.setAttribute("aria-invalid", "true");
      else if (current?.invalid) el.removeAttribute("aria-invalid");
      written = { el, ids, invalid };
    };

    onMounted(sync);
    onUpdated(sync);
    watch([describedBy, () => props.invalid], sync, { flush: "post" });

    return () =>
      renderAs(
        props.as ?? "div",
        {
          ref: (r: unknown) => (host.value = toElement(r)),
          role: "group",
          "data-slot": "field",
          "data-orientation": props.orientation,
          "data-invalid": props.invalid ? "true" : undefined,
          "data-disabled": props.disabled ? "true" : undefined,
        },
        slots,
      );
  },
});

/** A description or error inside a field: an id (its own or a generated one) the field links. */
function defineFieldText(
  name: string,
  slot: string,
  tag: string,
  role?: string,
) {
  return defineComponent({
    name,
    props: { ...asProp, id: { type: String, default: undefined } },
    setup(props, { slots }) {
      const field = inject(FIELD, null);
      const fallback = `sone-${slot}-${useId()}`;
      const id = computed(() => props.id ?? fallback);
      if (field) {
        watch(
          id,
          (next, prev) => {
            if (prev) field.unregister(prev);
            field.register(next);
          },
          { immediate: true },
        );
        onBeforeUnmount(() => field.unregister(id.value));
      }
      return () =>
        renderAs(
          props.as ?? tag,
          { "data-slot": slot, role, id: id.value },
          slots,
        );
    },
  });
}

export const SoneFieldDescription = defineFieldText(
  "SoneFieldDescription",
  "field-description",
  "p",
);

export const SoneFieldError = defineFieldText(
  "SoneFieldError",
  "field-error",
  "p",
  "alert",
);

/** `label[soneLabel]` */
export const SoneLabel = definePart({
  name: "SoneLabel",
  tag: "label",
  slot: "label",
});

export const SoneFieldLabel = definePart({
  name: "SoneFieldLabel",
  tag: "label",
  slot: "field-label",
});

export const SoneFieldContent = definePart({
  name: "SoneFieldContent",
  tag: "div",
  slot: "field-content",
});

export const SoneFieldTitle = definePart({
  name: "SoneFieldTitle",
  tag: "div",
  slot: "field-title",
});

export const SoneFieldGroup = definePart({
  name: "SoneFieldGroup",
  tag: "div",
  slot: "field-group",
  props: {
    variant: {
      type: String as PropType<"default" | "choices">,
      default: "default",
    },
  },
  attrs: (p) => ({ "data-variant": p.variant }),
});

export const SoneFieldSet = definePart({
  name: "SoneFieldSet",
  tag: "fieldset",
  slot: "field-set",
});

export const SoneFieldLegend = definePart({
  name: "SoneFieldLegend",
  tag: "legend",
  slot: "field-legend",
  props: {
    variant: {
      type: String as PropType<"legend" | "label">,
      default: "legend",
    },
  },
  attrs: (p) => ({ "data-variant": p.variant }),
});

export const SoneFieldSeparator = definePart({
  name: "SoneFieldSeparator",
  tag: "div",
  slot: "field-separator",
  static: { role: "separator" },
});

export const SoneFieldSeparatorContent = definePart({
  name: "SoneFieldSeparatorContent",
  tag: "span",
  slot: "field-separator-content",
});
