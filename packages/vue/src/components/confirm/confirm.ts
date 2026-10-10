import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
  type Component,
  type InjectionKey,
  type PropType,
  type VNode,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { asProp, definePart, toElement, type AsTag } from "../../utils/part";
import { flatten } from "../../utils/vnodes";
import { SoneButton } from "../button/button";
import { SoneSpinner } from "../spinner/spinner";

export type ConfirmVariant = "default" | "destructive";
export type ConfirmSize = "default" | "compact";
export type ConfirmLayout = "inline" | "card";

type PartKind = "title" | "description";

interface ConfirmContext {
  /** A part nested below the top level registers its id; returns the unregister. */
  register(kind: PartKind, id: string): () => void;
}

const CONFIRM: InjectionKey<ConfirmContext> = Symbol("SoneConfirm");

/** A title, description or error: an id (its own, the one the root handed it, or a generated one) the root links. */
function defineConfirmText(
  name: string,
  slot: string,
  kind: PartKind,
  role?: string,
) {
  return defineComponent({
    name,
    props: { ...asProp, id: { type: String, default: undefined } },
    setup(props, { slots }) {
      const root = inject(CONFIRM, null);
      const fallback = `sone-${slot}-${useId()}`;
      const id = computed(() => props.id ?? fallback);
      if (root) {
        let unregister: (() => void) | null = null;
        watch(
          id,
          (next) => {
            unregister?.();
            unregister = root.register(kind, next);
          },
          { immediate: true },
        );
        onBeforeUnmount(() => unregister?.());
      }
      return () =>
        h(
          (props.as ?? "p") as string,
          { class: slot, "data-slot": slot, role, id: id.value },
          slots.default?.(),
        );
    },
  });
}

/** `[soneConfirmTitle]` — the question; names the alertdialog. */
export const SoneConfirmTitle = defineConfirmText(
  "SoneConfirmTitle",
  "confirm-title",
  "title",
);

/** `[soneConfirmDescription]` — the consequence ("This cannot be undone."). */
export const SoneConfirmDescription = defineConfirmText(
  "SoneConfirmDescription",
  "confirm-description",
  "description",
);

/** `[soneConfirmError]` — why the last attempt failed; announced with `role="alert"`. */
export const SoneConfirmError = defineConfirmText(
  "SoneConfirmError",
  "confirm-error",
  "description",
  "alert",
);

/** `[soneConfirmActions]` — extra controls at the start of the button row (a "Don't ask again" checkbox). */
export const SoneConfirmActions = definePart({
  name: "SoneConfirmActions",
  tag: "div",
  className: "confirm-actions",
  slot: "confirm-actions",
});

const KIND = new Map<Component, PartKind>([
  [SoneConfirmTitle, "title"],
  [SoneConfirmDescription, "description"],
  [SoneConfirmError, "description"],
]);

/**
 * `[soneConfirm]` — an inline confirmation: the shadcn/ui Alert Dialog anatomy
 * (title, description, Cancel then the action) rendered in place, in a row or a list,
 * instead of in a modal. Render it with `v-if` when the user asks to delete / discard /
 * leave; it is a `role="alertdialog"` named by its `SoneConfirmTitle` (or your
 * `aria-label`) and described by its `SoneConfirmDescription` and `SoneConfirmError`.
 *
 * The buttons are drawn for you, always Cancel then Confirm. Focus moves to the Confirm
 * button when it mounts, Escape cancels (without reaching an enclosing dialog), and while
 * `busy` both buttons are `aria-disabled` (focus stays put) and the action shows
 * `busyLabel` with a spinner. A `SoneConfirmActions` (or the `#actions` slot) sits at the
 * start of the button row. Give focus back to the control that opened it on `@cancel`.
 */
export const SoneConfirm = defineComponent({
  name: "SoneConfirm",
  props: {
    ...asProp,
    /** `destructive` paints the action red (delete, discard, leave). */
    variant: { type: String as PropType<ConfirmVariant>, default: "default" },
    /** `compact` uses extra-small buttons and tighter spacing — for a list row. */
    size: { type: String as PropType<ConfirmSize>, default: "default" },
    /** `inline`: text and buttons share one wrapping row. `card`: a bordered panel, buttons below. */
    layout: { type: String as PropType<ConfirmLayout>, default: "inline" },
    /** The action button's label (default: the "Confirm" message). */
    confirmLabel: { type: String as PropType<string | null>, default: null },
    /** The cancel button's label (default: the "Cancel" message). */
    cancelLabel: { type: String as PropType<string | null>, default: null },
    /** The action button's label while `busy` (default: the "Working…" message). */
    busyLabel: { type: String as PropType<string | null>, default: null },
    /** The action is running: both buttons are disabled and the action shows `busyLabel`. */
    busy: { type: Boolean, default: false },
    /** Move focus to the Confirm button when the confirmation mounts. */
    autoFocus: { type: Boolean, default: true },
  },
  emits: { confirm: () => true, cancel: () => true },
  setup(props, { slots, emit, expose }) {
    const messages = useSoneMessages();
    const uid = `sone-confirm-${useId()}`;
    // Shallow: the entries are compared by identity on unregister.
    const registered = shallowRef<{ kind: PartKind; id: string }[]>([]);
    provide(CONFIRM, {
      register(kind, id) {
        const entry = { kind, id };
        registered.value = [...registered.value, entry];
        return () => {
          registered.value = registered.value.filter((e) => e !== entry);
        };
      },
    });

    const confirmButton = ref<unknown>(null);
    const focus = (): void => toElement(confirmButton.value)?.focus();
    expose({ focus });
    onMounted(() => {
      if (props.autoFocus) focus();
    });

    const onConfirm = (): void => {
      if (!props.busy) emit("confirm");
    };
    const onCancel = (): void => {
      if (!props.busy) emit("cancel");
    };
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") return;
      // Handled here, so an enclosing dialog or sheet stays open.
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    };

    return () => {
      // The top-level parts get their ids here, while rendering, so the server-rendered
      // alertdialog is already named and described; nested parts register theirs.
      const ids: Record<PartKind, string[]> = { title: [], description: [] };
      const content: VNode[] = [];
      const actions: VNode[] = [];
      let n = 0;
      for (const node of flatten(slots.default?.())) {
        const kind = KIND.get(node.type as Component);
        if (node.type === SoneConfirmActions) {
          actions.push(node);
        } else if (kind) {
          const id =
            (node.props?.["id"] as string | undefined) ??
            `${uid}-${kind}-${n++}`;
          ids[kind].push(id);
          content.push(cloneVNode(node, { id }));
        } else {
          content.push(node);
        }
      }
      for (const { kind, id } of registered.value)
        if (!ids[kind].includes(id)) ids[kind].push(id);

      const busy = props.busy;
      const size = props.size === "compact" ? "xs" : "sm";
      const busyAttr = busy ? "true" : undefined;
      const tag: AsTag = props.as ?? "div";
      const children = [
        h(
          "div",
          { class: "confirm-content", "data-slot": "confirm-content" },
          content,
        ),
        h("div", { class: "confirm-footer", "data-slot": "confirm-footer" }, [
          ...actions,
          ...(slots.actions
            ? [h(SoneConfirmActions, null, () => slots.actions?.())]
            : []),
          h(
            SoneButton,
            {
              type: "button",
              class: "confirm-cancel",
              variant: props.layout === "card" ? "outline" : "ghost",
              size,
              "aria-disabled": busyAttr,
              onClick: onCancel,
            },
            () => props.cancelLabel ?? messages.value.cancel,
          ),
          h(
            SoneButton,
            {
              ref: confirmButton,
              type: "button",
              class: "confirm-action",
              variant:
                props.variant === "destructive" ? "destructive" : "default",
              size,
              "aria-disabled": busyAttr,
              onClick: onConfirm,
            },
            () =>
              busy
                ? [
                    h(SoneSpinner, {
                      size: 14,
                      label: null,
                      "data-icon": "inline-start",
                    }),
                    props.busyLabel ?? messages.value.confirmBusy,
                  ]
                : (props.confirmLabel ?? messages.value.confirm),
          ),
        ]),
      ];
      const attrs = {
        class: "confirm",
        "data-slot": "confirm",
        role: "alertdialog",
        "data-variant": props.variant,
        "data-size": props.size,
        "data-layout": props.layout,
        "aria-labelledby": ids.title[0],
        "aria-describedby": ids.description.join(" ") || undefined,
        "aria-busy": busyAttr,
        onKeydown,
      };
      return typeof tag === "string"
        ? h(tag, attrs, children)
        : h(tag, attrs, () => children);
    };
  },
});
