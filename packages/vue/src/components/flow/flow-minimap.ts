import { computed, defineComponent, h, ref, type PropType } from "vue";

import { useSoneFlow } from "./flow";
import { flowBounds } from "./geometry";
import type { SoneFlowPanelPosition } from "./types";

const PAD = 24;

/**
 * `<sone-flow-minimap>` — a small overview of the whole `<SoneFlow>`: every node as a
 * block and the visible area as a frame. Click or drag in it to move the view there.
 * A pointer shortcut — the keyboard has the controls and Tab between nodes — so it is
 * hidden from assistive technology.
 */
export const SoneFlowMinimap = defineComponent({
  name: "SoneFlowMinimap",
  props: {
    position: {
      type: String as PropType<SoneFlowPanelPosition>,
      default: "bottom-right",
    },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 136 },
  },
  setup(props) {
    const flow = useSoneFlow();
    const svg = ref<SVGSVGElement | null>(null);
    let dragging: number | null = null;

    const view = computed(() => {
      const v = flow.viewport.value;
      const pane = flow.paneSize.value;
      const visible = pane.width
        ? {
            x: -v.x / v.zoom,
            y: -v.y / v.zoom,
            width: pane.width / v.zoom,
            height: pane.height / v.zoom,
          }
        : null;
      const rects = flow.rendered.value.map((r) => r.rect);
      const world = flowBounds(visible ? [...rects, visible] : rects) ?? {
        x: 0,
        y: 0,
        width: 400,
        height: 300,
      };
      const box = [
        world.x - PAD,
        world.y - PAD,
        world.width + PAD * 2,
        world.height + PAD * 2,
      ];
      // One screen pixel of the frame, whatever the scale.
      const scale = Math.max(box[2]! / props.width, box[3]! / props.height);
      return { box: box.join(" "), visible, stroke: 1.5 * scale };
    });

    const moveTo = (e: PointerEvent): void => {
      const el = svg.value;
      const ctm = el?.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
        ctm.inverse(),
      );
      flow.centerOn({ x: p.x, y: p.y });
    };

    const onPointerDown = (e: PointerEvent): void => {
      if (e.button !== 0) return;
      dragging = e.pointerId;
      svg.value?.setPointerCapture?.(e.pointerId);
      moveTo(e);
    };
    const onPointerMove = (e: PointerEvent): void => {
      if (dragging === e.pointerId) moveTo(e);
    };
    const onPointerUp = (e: PointerEvent): void => {
      if (dragging !== e.pointerId) return;
      dragging = null;
      const el = svg.value;
      if (el?.hasPointerCapture?.(e.pointerId))
        el.releasePointerCapture(e.pointerId);
    };

    return () => {
      const v = view.value;
      return h(
        "sone-flow-minimap",
        {
          class: "flow-panel",
          "data-slot": "flow-minimap",
          "aria-hidden": "true",
          "data-position": props.position,
          style: { width: `${props.width}px`, height: `${props.height}px` },
        },
        [
          h(
            "svg",
            {
              ref: svg,
              class: "flow-minimap-svg",
              viewBox: v.box,
              preserveAspectRatio: "xMidYMid meet",
              onPointerdown: onPointerDown,
              onPointermove: onPointerMove,
              onPointerup: onPointerUp,
              onPointercancel: onPointerUp,
            },
            [
              ...flow.rendered.value.map((r) =>
                h("rect", {
                  key: r.node.id,
                  class: "flow-minimap-node",
                  "data-tone": r.node.tone ?? "neutral",
                  "data-selected": r.selected ? "" : undefined,
                  x: r.rect.x,
                  y: r.rect.y,
                  width: r.rect.width,
                  height: r.rect.height,
                  rx: r.node.shape === "circle" ? r.rect.width / 2 : 6,
                }),
              ),
              v.visible
                ? h("rect", {
                    key: "viewport",
                    class: "flow-minimap-viewport",
                    x: v.visible.x,
                    y: v.visible.y,
                    width: v.visible.width,
                    height: v.visible.height,
                    "stroke-width": v.stroke,
                    rx: "4",
                  })
                : null,
            ],
          ),
        ],
      );
    };
  },
});
