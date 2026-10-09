import {
  defineComponent,
  inject,
  onBeforeUnmount,
  useId,
  type PropType,
} from "vue";

import { SONE_OVERLAY, type SoneOverlayHost } from "../../composables/overlay";
import { asProp, definePart, renderAs } from "../../utils/part";

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
