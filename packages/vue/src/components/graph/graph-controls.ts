import {
  computed,
  defineComponent,
  h,
  onMounted,
  onUpdated,
  ref,
  type PropType,
} from "vue";

import { rovingFocusTarget } from "@surface-one/core";
import { useSoneMessages } from "../../composables/messages";
import { SoneButton } from "../button/button";

export interface SoneGraphControlsLabels {
  fit: string;
  fitLabel: string;
  zoomIn: string;
  zoomOut: string;
  list: string;
  listLabel: string;
}

/**
 * `<sone-graph-controls>` — the overlay toolbar of a graph: an info panel (the default
 * slot: a legend, counts) and Fit / zoom out / zoom readout / zoom in, plus an optional
 * list toggle. One tab stop; arrow keys, Home and End move between the buttons
 * (WAI-ARIA toolbar).
 */
export const SoneGraphControls = defineComponent({
  name: "SoneGraphControls",
  props: {
    /** Accessible name of the toolbar. */
    label: { type: String, required: true },
    /** The zoom readout, in percent of the fitted view. */
    zoomPct: { type: Number, default: 100 },
    /** `true` / `false` shows the list toggle pressed / not pressed; `null` hides it. */
    list: { type: Boolean as PropType<boolean | null>, default: null },
    labels: {
      type: Object as PropType<Partial<SoneGraphControlsLabels>>,
      default: () => ({}),
    },
  },
  emits: {
    zoomIn: () => true,
    zoomOut: () => true,
    fit: () => true,
    listChange: (_value: boolean) => true,
  },
  setup(props, { slots, emit }) {
    const messages = useSoneMessages();
    const host = ref<HTMLElement | null>(null);
    let active = 0;

    const text = computed<SoneGraphControlsLabels>(() => {
      const m = messages.value;
      return {
        fit: m.graphFit,
        fitLabel: m.graphFitLabel,
        zoomIn: m.graphZoomIn,
        zoomOut: m.graphZoomOut,
        list: m.graphList,
        listLabel: m.graphListLabel,
        ...props.labels,
      };
    });

    const buttons = (): HTMLButtonElement[] => [
      ...(host.value?.querySelectorAll<HTMLButtonElement>(
        "[data-slot=graph-controls-actions] button",
      ) ?? []),
    ];
    const syncTabStops = (): void => {
      const all = buttons();
      active = Math.min(active, all.length - 1);
      all.forEach((b, i) => (b.tabIndex = i === active ? 0 : -1));
    };
    onMounted(syncTabStops);
    onUpdated(syncTabStops);

    const onKeydown = (event: KeyboardEvent): void => {
      const all = buttons();
      const at = all.indexOf(event.target as HTMLButtonElement);
      if (at < 0) return;
      rovingFocusTarget(event, all, at, { orientation: "both" })?.focus();
    };
    const onFocusin = (event: FocusEvent): void => {
      const at = buttons().indexOf(event.target as HTMLButtonElement);
      if (at >= 0) {
        active = at;
        syncTabStops();
      }
    };

    const button = (
      key: string,
      size: "xs" | "icon-xs",
      attrs: Record<string, unknown>,
      content: string,
    ) =>
      h(
        SoneButton,
        { key, variant: "ghost", size, type: "button", ...attrs },
        () => content,
      );
    const divider = (key: string) =>
      h("span", { key, class: "gc-divider", "aria-hidden": "true" });

    return () => {
      const t = text.value;
      const list = props.list;
      return h(
        "sone-graph-controls",
        {
          ref: host,
          "data-slot": "graph-controls",
          role: "toolbar",
          "aria-label": props.label,
          onKeydown,
          onFocusin,
        },
        [
          h(
            "div",
            { class: "gc-panel gc-info", "data-slot": "graph-controls-info" },
            slots.default?.(),
          ),
          h(
            "div",
            {
              class: "gc-panel gc-actions",
              "data-slot": "graph-controls-actions",
            },
            [
              ...(list !== null
                ? [
                    button(
                      "list",
                      "xs",
                      {
                        "aria-label": t.listLabel,
                        "aria-pressed": String(list),
                        onClick: () => emit("listChange", !list),
                      },
                      t.list,
                    ),
                    divider("list-divider"),
                  ]
                : []),
              button(
                "fit",
                "xs",
                { "aria-label": t.fitLabel, onClick: () => emit("fit") },
                t.fit,
              ),
              divider("fit-divider"),
              button(
                "out",
                "icon-xs",
                { "aria-label": t.zoomOut, onClick: () => emit("zoomOut") },
                "−",
              ),
              h(
                "span",
                { key: "zoom", class: "gc-zoom", "aria-hidden": "true" },
                `${props.zoomPct}%`,
              ),
              button(
                "in",
                "icon-xs",
                { "aria-label": t.zoomIn, onClick: () => emit("zoomIn") },
                "+",
              ),
            ],
          ),
        ],
      );
    };
  },
});
