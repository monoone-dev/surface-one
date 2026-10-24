import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type PropType,
} from "vue";

import {
  EMPTY_GRAPH_SCENE,
  SoneGraphEngine,
  type GraphScene,
  type GraphSceneAnchor,
  type SceneCursor,
} from "@surface-one/core";

/** What a `SoneGraphCanvas` template ref exposes. */
export interface SoneGraphCanvasExposed {
  /** Zooms about the centre by `factor` (1.25 is one step in). */
  zoomBy(factor: number): void;
  /** Glides back to the view that fits every node. */
  fit(): void;
}

/**
 * `canvas[soneGraphCanvas]` — the canvas part of `<SoneGraph>`: binds a `GraphScene` to
 * the framework-free `SoneGraphEngine`. The engine (and with it `getContext`,
 * `matchMedia` and the observers) is created once mounted, so it is SSR-safe. Use it on
 * its own when you build the scene yourself.
 */
export const SoneGraphCanvas = defineComponent({
  name: "SoneGraphCanvas",
  props: {
    /** The positioned nodes, edges, columns and clusters to draw. */
    scene: {
      type: Object as PropType<GraphScene>,
      default: () => EMPTY_GRAPH_SCENE,
    },
    /** Tone name → custom property (or `"--a, --b"` fallback chain). */
    tones: {
      type: Object as PropType<Readonly<Record<string, string>>>,
      default: () => ({}),
    },
    selectedKey: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    /** The user picked a node with the pointer or keyboard; `null` clears. */
    nodePick: (_key: string | null) => true,
    /** Double-click, or Enter on the picked node. */
    nodeOpen: (_key: string) => true,
    nodeHover: (_key: string | null) => true,
    /** Zoom in percent of the fitted view. */
    zoomChange: (_percent: number) => true,
    /** Screen position of the hovered (else the picked) node, for a floating card. */
    anchor: (_anchor: GraphSceneAnchor | null) => true,
  },
  setup(props, { emit, expose }) {
    const el = ref<HTMLCanvasElement | null>(null);
    const engine = shallowRef<SoneGraphEngine | null>(null);
    const cursor = ref<SceneCursor>("grab");

    onMounted(() => {
      if (!el.value) return;
      const created = new SoneGraphEngine(el.value, {
        pick: (key) => emit("nodePick", key),
        open: (key) => emit("nodeOpen", key),
        hover: (key) => emit("nodeHover", key),
        zoom: (pct) => emit("zoomChange", pct),
        anchor: (a) => emit("anchor", a),
        cursor: (c) => (cursor.value = c),
      });
      created.setScene(props.scene);
      created.setTones(props.tones);
      created.setSelected(props.selectedKey);
      engine.value = created;
    });
    onBeforeUnmount(() => {
      engine.value?.dispose();
      engine.value = null;
    });
    watch(
      () => props.scene,
      (scene) => engine.value?.setScene(scene),
    );
    watch(
      () => props.tones,
      (tones) => engine.value?.setTones(tones),
    );
    watch(
      () => props.selectedKey,
      (key) => engine.value?.setSelected(key),
    );

    const exposed: SoneGraphCanvasExposed = {
      zoomBy: (factor) => engine.value?.zoomBy(factor),
      fit: () => engine.value?.fit(),
    };
    expose(exposed);

    return () =>
      h("canvas", {
        ref: el,
        "data-slot": "graph-canvas",
        tabindex: 0,
        style: { cursor: cursor.value },
        onPointerdown: (e: PointerEvent) => engine.value?.pointerDown(e),
        onPointermove: (e: PointerEvent) => engine.value?.pointerMove(e),
        onPointerup: (e: PointerEvent) => engine.value?.pointerUp(e),
        onPointercancel: (e: PointerEvent) => engine.value?.pointerUp(e),
        onPointerleave: () => engine.value?.pointerLeave(),
        onDblclick: (e: MouseEvent) => engine.value?.doubleClick(e),
        onWheel: (e: WheelEvent) => engine.value?.wheel(e),
        onKeydown: (e: KeyboardEvent) => engine.value?.keydown(e),
      });
  },
});
