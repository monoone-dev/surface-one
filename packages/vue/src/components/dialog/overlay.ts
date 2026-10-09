import {
  Teleport,
  defineComponent,
  h,
  shallowRef,
  type ComponentObjectPropsOptions,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { useOverlay } from "../../composables/overlay";
import { useModel } from "../../utils/model";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

/** The props every overlay shares. */
export const overlayProps = {
  /**
   * Shown or not: `v-model:open`, or leave it out and render the overlay with `v-if`
   * (it is open while rendered), listening to `@dismiss`.
   */
  open: { type: Boolean, default: true },
  /** Escape, the scrim and the close button may dismiss it. */
  dismissible: { type: Boolean, default: true },
  /** The corner close button. */
  showClose: { type: Boolean, default: true },
  /** The close button's name (default: the "Close" message). */
  closeLabel: { type: String as PropType<string | null>, default: null },
  /** Names the panel when it has no `SoneDialogTitle`. */
  ariaLabel: { type: String as PropType<string | null>, default: null },
  /** Render in place instead of teleporting to `<body>`. */
  inline: { type: Boolean, default: false },
} as const;

export const overlayEmits = {
  "update:open": (_value: boolean) => true,
  dismiss: () => true,
};

interface OverlaySpec {
  readonly name: string;
  readonly host: string;
  readonly layerClass: string;
  readonly layerSlot: string;
  readonly panelClass: string;
  readonly closeSlot?: string;
}

interface OverlayPanel {
  readonly role: string;
  readonly slot: string;
  readonly closeOnScrim: boolean;
  readonly cornerClose: boolean;
  readonly attrs: Record<string, unknown>;
}

/** Builds an overlay component from its look (`spec`) and its per-render panel settings. */
export function defineOverlay<P extends ComponentObjectPropsOptions>(
  spec: OverlaySpec,
  props: P,
  panel: (props: Record<string, unknown>) => OverlayPanel,
) {
  return defineComponent({
    name: spec.name,
    inheritAttrs: false,
    props: { ...overlayProps, ...props },
    emits: overlayEmits,
    setup(rawProps, { emit, attrs, slots }) {
      const p = rawProps as Record<string, unknown> & {
        open: boolean;
        dismissible: boolean;
        showClose: boolean;
        closeLabel: string | null;
        ariaLabel: string | null;
        inline: boolean;
      };
      const messages = useSoneMessages();
      const open = useModel(
        () => p.open,
        (v) => emit("update:open", v),
      );
      const layer = shallowRef<HTMLElement | null>(null);
      const panelEl = shallowRef<HTMLElement | null>(null);
      const overlay = useOverlay({
        open: () => open.value,
        layer,
        panel: panelEl,
        dismissible: () => p.dismissible,
        closeOnScrim: () => panel(p).closeOnScrim,
        dismiss: () => {
          emit("dismiss");
          open.set(false);
        },
      });

      return () => {
        const settings = panel(p);
        const content = open.value
          ? h(
              spec.host,
              {
                ...attrs,
                ref: layer,
                class: [spec.layerClass, attrs["class"]],
                "data-slot": spec.layerSlot,
                onPointerdown: overlay.onLayerPointerDown,
                onClick: overlay.onLayerClick,
              },
              h(
                "div",
                {
                  ref: panelEl,
                  class: spec.panelClass,
                  role: settings.role,
                  "data-slot": settings.slot,
                  "aria-modal": "true",
                  "aria-labelledby": p.ariaLabel
                    ? undefined
                    : overlay.titleId.value,
                  "aria-label": p.ariaLabel ?? undefined,
                  "aria-describedby": overlay.descriptionId.value,
                  tabindex: "-1",
                  ...settings.attrs,
                  onKeydown: (e: KeyboardEvent) => {
                    if (e.key === "Escape") overlay.onEscape(e);
                    else overlay.onKeydown(e);
                  },
                },
                [
                  slots.default?.(),
                  settings.cornerClose && p.showClose && p.dismissible
                    ? h(
                        "span",
                        { class: "dialog-close-anchor" },
                        h(
                          SoneButton,
                          {
                            variant: "ghost",
                            size: "icon-sm",
                            type: "button",
                            class: "dialog-close",
                            "data-slot": spec.closeSlot,
                            "aria-label": p.closeLabel ?? messages.value.close,
                            onClick: overlay.requestClose,
                          },
                          () => h(SoneIcon, { icon: "close" }),
                        ),
                      )
                    : null,
                ],
              ),
            )
          : null;
        return h(Teleport, { to: "body", disabled: p.inline }, [content]);
      };
    },
  });
}
