import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  useId,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SONE_OVERLAY, type SoneOverlayHost } from "../../composables/overlay";
import { asProp, definePart, renderAs } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

export type DialogMediaTone = "default" | "accent" | "destructive" | "warning";

export const SoneDialogHeader = definePart({
  name: "SoneDialogHeader",
  tag: "div",
  className: "dialog-header",
  slot: "dialog-header",
});

export const SoneDialogFooter = definePart({
  name: "SoneDialogFooter",
  tag: "div",
  className: "dialog-footer",
  slot: "dialog-footer",
});

export const SoneDialogMedia = definePart({
  name: "SoneDialogMedia",
  tag: "div",
  className: "dialog-media",
  slot: "dialog-media",
  static: { "aria-hidden": "true" },
  props: {
    tone: { type: String as PropType<DialogMediaTone>, default: "default" },
  },
  attrs: (p) => ({ "data-tone": p.tone }),
});

/** A title or description that names / describes the overlay it sits in. */
function defineLabel(
  name: string,
  className: string,
  tag: string,
  register: (host: SoneOverlayHost) => {
    add(label: { id: () => string }): void;
    remove(label: { id: () => string }): void;
  },
) {
  return defineComponent({
    name,
    props: { ...asProp, id: { type: String, default: undefined } },
    setup(props, { slots }) {
      const fallback = `sone-${className}-${useId()}`;
      const label = { id: () => props.id ?? fallback };
      const overlay = inject(SONE_OVERLAY, null);
      if (overlay) {
        const reg = register(overlay);
        reg.add(label);
        // A title inside a `v-if` must not leave the dialog labelled by a dead id.
        onBeforeUnmount(() => reg.remove(label));
      }
      return () =>
        renderAs(
          props.as ?? tag,
          { class: className, "data-slot": className, id: label.id() },
          slots,
        );
    },
  });
}

export const SoneDialogTitle = defineLabel(
  "SoneDialogTitle",
  "dialog-title",
  "h2",
  (o) => ({ add: o.registerTitle, remove: o.unregisterTitle }),
);

export const SoneDialogDescription = defineLabel(
  "SoneDialogDescription",
  "dialog-description",
  "p",
  (o) => ({ add: o.registerDescription, remove: o.unregisterDescription }),
);

/**
 * `button[soneDialogClose]` — a close button for a dialog or sheet header. Inside an
 * overlay it closes it (when it may be dismissed) and the corner close steps aside;
 * a `click` listener runs first and can `preventDefault()` to keep it open.
 */
export const SoneDialogClose = defineComponent({
  name: "SoneDialogClose",
  props: {
    label: { type: String as PropType<string | null>, default: null },
  },
  emits: ["click"],
  setup(props, { slots, emit }) {
    const overlay = inject(SONE_OVERLAY, null);
    const messages = useSoneMessages();
    return () =>
      h(
        "button",
        {
          type: "button",
          class: "btn dialog-header-close",
          "data-slot": "dialog-close",
          "data-variant": "ghost",
          "data-size": "icon-sm",
          "aria-label": props.label ?? messages.value.close,
          onClick: (event: MouseEvent) => {
            emit("click", event);
            if (!event.defaultPrevented) overlay?.requestClose?.();
          },
        },
        slots.default ? slots.default() : h(SoneIcon, { icon: "close" }),
      );
  },
});
