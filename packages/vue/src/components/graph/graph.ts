import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  shallowRef,
  useId,
  watch,
  type PropType,
} from "vue";

import {
  GRAPH_ZOOM_STEP,
  SONE_GRAPH_SIZING,
  SONE_GRAPH_TONES,
  graphCards,
  graphClusterLabel,
  graphLayoutRequest,
  graphPickAnnouncement,
  graphScene,
  graphToneOf,
  prepareGraph,
  runGraphLayoutWith,
  type GraphSceneAnchor,
  type SoneGraphCardModel,
  type SoneGraphCluster,
  type SoneGraphData,
  type SoneGraphLabels,
  type SoneGraphLaidOut,
  type SoneGraphLayout,
  type SoneGraphLayoutStrategy,
  type SoneGraphNode,
  type SoneGraphNodeInfo,
  type SoneGraphSizing,
  type SoneGraphTones,
} from "@surface-one/core";
import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { definePart } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneGraphCanvas, type SoneGraphCanvasExposed } from "./graph-canvas";
import { SoneGraphCard } from "./graph-card";
import { SoneGraphControls } from "./graph-controls";
import type { SoneGraphCardContext } from "./types";

/** `[soneGraphLegend]` — content for the controls' info panel (a legend, counts). */
export const SoneGraphLegend = definePart({
  name: "SoneGraphLegend",
  tag: "span",
  slot: "graph-legend",
});

/** What a `SoneGraph` template ref exposes. */
export interface SoneGraphExposed {
  /** Zooms about the centre by `factor` (1.25 is one step in). */
  zoomBy(factor: number): void;
  /** Glides back to the view that fits every node. */
  fit(): void;
}

/**
 * `<sone-graph>` — an interactive network diagram on a Canvas 2D: `force`, `clusters`
 * (communities with hulls) or `layers` (one column per `layer`) layouts; drag to pan,
 * wheel to zoom at the cursor, click to select and highlight the neighbourhood,
 * double-click or Enter to open; full keyboard support with spoken selections, an
 * optional node list, and colours read from the theme tokens. The default slot fills
 * the controls' info panel (a `SoneGraphLegend`); the `card` slot replaces the body of
 * the node card. The layout runs only once mounted, so the server renders the frame.
 */
export const SoneGraph = defineComponent({
  name: "SoneGraph",
  props: {
    data: { type: Object as PropType<SoneGraphData | null>, default: null },
    layout: { type: String as PropType<SoneGraphLayout>, default: "force" },
    /** Extra or overriding tones: tone name → custom property, or a `"--a, --b"` fallback chain. */
    tones: {
      type: Object as PropType<SoneGraphTones>,
      default: () => ({}),
    },
    /** The radius range node sizes are mapped onto. */
    sizing: {
      type: Object as PropType<SoneGraphSizing>,
      default: () => SONE_GRAPH_SIZING,
    },
    /** Column titles of the `layers` layout, by `layer`. */
    layerLabels: {
      type: Object as PropType<Readonly<Record<number, string>>>,
      default: () => ({}),
    },
    /** The title of a `clusters` community; return `""` for none (default: "<largest node> · n"). */
    clusterLabel: {
      type: Function as PropType<
        ((cluster: SoneGraphCluster) => string) | null
      >,
      default: null,
    },
    /** The meta line of a node's card, its list entry and its announcement (default: "3 links"). */
    describe: {
      type: Function as PropType<
        ((node: SoneGraphNode, info: SoneGraphNodeInfo) => string) | null
      >,
      default: null,
    },
    /** The canvas's accessible name; defaults to the node and link counts. */
    label: { type: String as PropType<string | null>, default: null },
    /** The counts in the controls panel; `""` hides them. */
    summary: { type: String as PropType<string | null>, default: null },
    labels: {
      type: Object as PropType<Partial<SoneGraphLabels>>,
      default: () => ({}),
    },
    /** Computes the layout elsewhere (a Web Worker); `null` lays out on the main thread. */
    layoutStrategy: {
      type: Function as PropType<SoneGraphLayoutStrategy | null>,
      default: null,
    },
    /** Shows the List button in the controls. */
    listToggle: { type: Boolean, default: true },
    /** The selected node id (`v-model:selected`). */
    selected: { type: String as PropType<string | null>, default: null },
    /** Renders the nodes as a list of buttons under the canvas (`v-model:show-list`). */
    showList: { type: Boolean, default: false },
  },
  emits: {
    "update:selected": (_id: string | null) => true,
    "update:showList": (_value: boolean) => true,
    nodeOpen: (_id: string) => true,
    nodeHover: (_id: string | null) => true,
    /** Zoom in percent of the fitted view. */
    zoomChange: (_percent: number) => true,
  },
  setup(props, { slots, emit, expose }) {
    const messages = useSoneMessages();
    const hintId = `sone-graph-${useId()}-hint`;
    const selected = useModel(
      () => props.selected,
      (v) => emit("update:selected", v),
    );
    const showList = useModel(
      () => props.showList,
      (v) => emit("update:showList", v),
    );
    const canvas = ref<SoneGraphCanvasExposed | null>(null);
    const zoomPct = ref(100);
    const anchor = shallowRef<GraphSceneAnchor | null>(null);
    const announcement = ref("");
    const browser = ref(false);
    const laidOut = shallowRef<SoneGraphLaidOut | null>(null);
    let layoutSeq = 0;

    const text = computed<SoneGraphLabels>(() => {
      const m = messages.value;
      return {
        roleDescription: m.graphRoleDescription,
        controls: m.graphControls,
        fit: m.graphFit,
        fitLabel: m.graphFitLabel,
        zoomIn: m.graphZoomIn,
        zoomOut: m.graphZoomOut,
        list: m.graphList,
        listLabel: m.graphListLabel,
        open: m.graphOpen,
        selectionCleared: m.graphSelectionCleared,
        instructions: m.graphInstructions,
        empty: m.graphEmpty,
        ...props.labels,
      };
    });
    const describe = computed(
      () =>
        props.describe ??
        ((_node: SoneGraphNode, info: SoneGraphNodeInfo) =>
          messages.value.graphLinks(info.degree)),
    );
    const clusterLabel = computed(
      () =>
        props.clusterLabel ??
        ((cluster: SoneGraphCluster) =>
          graphClusterLabel(cluster, messages.value.graphUnlinked)),
    );
    const allTones = computed<SoneGraphTones>(() => ({
      ...SONE_GRAPH_TONES,
      ...props.tones,
    }));

    const prepared = computed(() => prepareGraph(props.data));
    const request = computed(() =>
      browser.value
        ? graphLayoutRequest(prepared.value, props.layout, props.sizing)
        : null,
    );
    const scene = computed(() =>
      graphScene(laidOut.value, props.layerLabels, clusterLabel.value),
    );
    const state = computed(() =>
      prepared.value.nodes.length === 0
        ? "empty"
        : request.value && laidOut.value?.request === request.value
          ? "ready"
          : "pending",
    );
    const selectedKey = computed(() => {
      const id = selected.value;
      return id !== null && prepared.value.index.has(id) ? id : null;
    });
    const summaryText = computed(() => {
      if (props.summary !== null) return props.summary;
      const p = prepared.value;
      const m = messages.value;
      return `${m.graphNodes(p.nodes.length)} · ${m.graphLinks(p.edges.length)}`;
    });
    const ariaLabel = computed(() => {
      if (props.label !== null) return props.label;
      if (prepared.value.nodes.length === 0) return text.value.empty;
      return messages.value.graphLabel(summaryText.value);
    });
    const cards = computed(() =>
      graphCards(
        prepared.value,
        selectedKey.value,
        anchor.value,
        describe.value,
        allTones.value,
      ),
    );

    onMounted(() => (browser.value = true));
    watch(
      [request, () => props.layoutStrategy],
      ([req, strategy]) => {
        if (!req) return;
        const p = prepared.value;
        const seq = ++layoutSeq;
        runGraphLayoutWith(req, strategy, (layout) => {
          if (seq === layoutSeq) {
            laidOut.value = { prepared: p, request: req, layout };
          }
        });
      },
      { immediate: true },
    );

    const zoomBy = (factor: number): void => canvas.value?.zoomBy(factor);
    const fit = (): void => canvas.value?.fit();
    const exposed: SoneGraphExposed = { zoomBy, fit };
    expose(exposed);

    const onPick = (id: string | null): void => {
      selected.set(id);
      announcement.value = graphPickAnnouncement(
        prepared.value,
        id,
        describe.value,
        text.value.selectionCleared,
      );
    };

    const card = (c: SoneGraphCardModel) => {
      const context: SoneGraphCardContext = {
        node: c.node,
        pinned: c.pinned,
        description: c.meta,
        tone: c.tone,
      };
      return h(
        SoneGraphCard,
        {
          key: c.pinned ? "pinned" : "hover",
          pinned: c.pinned,
          anchor: c.anchor,
          heading: c.heading,
          meta: c.meta,
          tone: c.tone,
          square: c.square,
          openLabel: c.pinned ? text.value.open : null,
          onOpen: () => emit("nodeOpen", c.id),
        },
        slots.card ? { default: () => slots.card?.(context) } : undefined,
      );
    };

    return () => {
      const t = text.value;
      const { hover, pinned } = cards.value;
      const summary = summaryText.value;
      const key = selectedKey.value;
      return h(
        "sone-graph",
        {
          "data-slot": "graph",
          "data-state": state.value,
          "data-layout": props.layout,
        },
        [
          h("div", { class: "g-frame", "data-slot": "graph-frame" }, [
            h(SoneGraphCanvas, {
              ref: canvas,
              class: "g-canvas",
              role: "application",
              "aria-roledescription": t.roleDescription,
              "aria-label": ariaLabel.value,
              "aria-describedby": hintId,
              scene: scene.value,
              tones: allTones.value,
              selectedKey: key,
              onNodePick: onPick,
              onNodeOpen: (id: string) => emit("nodeOpen", id),
              onNodeHover: (id: string | null) => emit("nodeHover", id),
              onZoomChange: (pct: number) => {
                zoomPct.value = pct;
                emit("zoomChange", pct);
              },
              onAnchor: (a: GraphSceneAnchor | null) => (anchor.value = a),
            }),
            h(
              SoneGraphControls,
              {
                label: t.controls,
                zoomPct: zoomPct.value,
                list: props.listToggle ? showList.value : null,
                labels: t,
                onZoomIn: () => zoomBy(GRAPH_ZOOM_STEP),
                onZoomOut: () => zoomBy(1 / GRAPH_ZOOM_STEP),
                onFit: fit,
                onListChange: (v: boolean) => showList.set(v),
              },
              () => [
                slots.default?.(),
                summary
                  ? h("span", { "data-slot": "graph-summary" }, summary)
                  : null,
              ],
            ),
            hover ? card(hover) : null,
            pinned ? card(pinned) : null,
          ]),
          h("span", { class: "sr-only", id: hintId }, t.instructions),
          h(
            "span",
            { class: "sr-only", "aria-live": "polite" },
            announcement.value,
          ),
          showList.value
            ? h(
                "ul",
                {
                  class: "g-list",
                  "data-slot": "graph-list",
                  "aria-label": t.listLabel,
                },
                prepared.value.nodes.map((node, i) => {
                  const on = key === node.id;
                  return h("li", { key: node.id, class: "g-list-item" }, [
                    h(
                      SoneButton,
                      {
                        variant: "ghost",
                        size: "sm",
                        type: "button",
                        class: "g-list-node",
                        "aria-pressed": String(on),
                        onClick: () => onPick(on ? null : node.id),
                      },
                      () => [
                        h("span", {
                          class: [
                            "g-swatch",
                            { "is-square": node.shape === "square" },
                          ],
                          style: {
                            background: graphToneOf(allTones.value, node),
                          },
                          "aria-hidden": "true",
                        }),
                        h("span", { class: "g-list-label" }, node.label),
                        h(
                          "span",
                          { class: "g-list-meta" },
                          describe.value(node, {
                            degree: prepared.value.degree[i],
                          }),
                        ),
                      ],
                    ),
                    on
                      ? h(
                          SoneButton,
                          {
                            variant: "outline",
                            size: "xs",
                            type: "button",
                            onClick: () => emit("nodeOpen", node.id),
                          },
                          () => t.open,
                        )
                      : null,
                  ]);
                }),
              )
            : null,
        ],
      );
    };
  },
});
