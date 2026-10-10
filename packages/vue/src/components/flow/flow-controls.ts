import {
  computed,
  defineComponent,
  h,
  withDirectives,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { vSoneTooltip, type TooltipSide } from "../../directives/tooltip";
import { SoneButton } from "../button";
import { SoneIcon, type ShellIcon } from "../icon";
import { useSoneFlow } from "./flow";
import type { SoneFlowPanelPosition } from "./types";

export interface SoneFlowControlsLabels {
  readonly group: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly fit: string;
  readonly resetZoom: string;
  readonly lock: string;
}

/**
 * `<sone-flow-controls>` — zoom in, zoom out, fit view, the zoom level (a reset to
 * 100%) and a lock toggle for the `<SoneFlow>` it sits in.
 */
export const SoneFlowControls = defineComponent({
  name: "SoneFlowControls",
  props: {
    position: {
      type: String as PropType<SoneFlowPanelPosition>,
      default: "bottom-left",
    },
    orientation: {
      type: String as PropType<"horizontal" | "vertical">,
      default: "vertical",
    },
    /** Show the zoom level as a button that resets it to 100%. */
    showZoom: { type: Boolean, default: false },
    showLock: { type: Boolean, default: true },
    labels: {
      type: Object as PropType<Partial<SoneFlowControlsLabels>>,
      default: () => ({}),
    },
  },
  setup(props) {
    const flow = useSoneFlow();
    const messages = useSoneMessages();

    const text = computed<SoneFlowControlsLabels>(() => {
      const m = messages.value;
      return {
        group: m.flowControls,
        zoomIn: m.flowZoomIn,
        zoomOut: m.flowZoomOut,
        fit: m.flowFit,
        resetZoom: m.flowResetZoom,
        lock: m.flowLock,
        ...props.labels,
      };
    });
    const percent = computed(() => `${Math.round(flow.zoom.value * 100)}%`);
    /** Away from the edge the controls sit on. */
    const tooltipSide = computed<TooltipSide>(() => {
      if (props.orientation === "horizontal")
        return props.position.startsWith("top") ? "bottom" : "top";
      return props.position.endsWith("right") ? "left" : "right";
    });

    const button = (
      key: string,
      tooltip: string,
      attrs: Record<string, unknown>,
      content: () => unknown,
    ) =>
      withDirectives(
        h(
          SoneButton,
          { key, variant: "ghost", size: "icon-sm", type: "button", ...attrs },
          { default: content },
        ),
        [[vSoneTooltip, { text: tooltip, side: tooltipSide.value }]],
      );
    const icon = (name: ShellIcon) => () => h(SoneIcon, { icon: name });

    return () => {
      const t = text.value;
      const zoom = flow.zoom.value;
      const interactive = flow.interactive.value;
      return h(
        "sone-flow-controls",
        {
          class: "flow-panel",
          "data-slot": "flow-controls",
          role: "group",
          "aria-label": t.group,
          "data-position": props.position,
          "data-orientation": props.orientation,
        },
        [
          button(
            "in",
            t.zoomIn,
            {
              "aria-label": t.zoomIn,
              disabled: zoom >= flow.maxZoom(),
              onClick: () => flow.zoomIn(),
            },
            icon("zoom-in"),
          ),
          button(
            "out",
            t.zoomOut,
            {
              "aria-label": t.zoomOut,
              disabled: zoom <= flow.minZoom(),
              onClick: () => flow.zoomOut(),
            },
            icon("zoom-out"),
          ),
          props.showZoom
            ? button(
                "zoom",
                t.resetZoom,
                {
                  class: "flow-controls-zoom",
                  size: "sm",
                  "aria-label": `${t.resetZoom}, ${percent.value}`,
                  onClick: () => flow.zoomTo(1),
                },
                () => percent.value,
              )
            : null,
          button(
            "fit",
            t.fit,
            { "aria-label": t.fit, onClick: () => flow.fit() },
            icon("fit"),
          ),
          props.showLock
            ? button(
                "lock",
                t.lock,
                {
                  "aria-label": t.lock,
                  "aria-pressed": String(!interactive),
                  onClick: () => flow.setInteractive(!interactive),
                },
                icon(interactive ? "unlock" : "lock"),
              )
            : null,
        ],
      );
    };
  },
});
