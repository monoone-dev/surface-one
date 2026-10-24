"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CanvasHTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import {
  EMPTY_GRAPH_SCENE,
  SoneGraphEngine,
  type GraphScene,
  type GraphSceneAnchor,
  type SceneCursor,
} from "@surface-one/core";

/** What a `SoneGraphCanvas` ref exposes. */
export interface SoneGraphCanvasHandle {
  /** Zooms about the centre by `factor` (1.25 is one step in). */
  zoomBy(factor: number): void;
  /** Glides back to the view that fits every node. */
  fit(): void;
}

export interface SoneGraphCanvasProps extends Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  "children"
> {
  /** The positioned nodes, edges, columns and clusters to draw. */
  readonly scene?: GraphScene;
  /** Tone name → custom property (or `"--a, --b"` fallback chain). */
  readonly tones?: Readonly<Record<string, string>>;
  readonly selectedKey?: string | null;
  /** The user picked a node with the pointer or keyboard; `null` clears. */
  readonly onNodePick?: (key: string | null) => void;
  /** Double-click, or Enter on the picked node. */
  readonly onNodeOpen?: (key: string) => void;
  readonly onNodeHover?: (key: string | null) => void;
  /** Zoom in percent of the fitted view. */
  readonly onZoomChange?: (percent: number) => void;
  /** Screen position of the hovered (else the picked) node, for a floating card. */
  readonly onAnchor?: (anchor: GraphSceneAnchor | null) => void;
  readonly ref?: Ref<SoneGraphCanvasHandle | null>;
}

const NO_TONES: Readonly<Record<string, string>> = {};

/**
 * `canvas[soneGraphCanvas]` — the canvas part of `<SoneGraph>`: binds a `GraphScene` to
 * the framework-free `SoneGraphEngine`. The engine (and with it `getContext`,
 * `matchMedia` and the observers) is created in an effect, so it is SSR-safe. Use it on
 * its own when you build the scene yourself.
 */
export function SoneGraphCanvas({
  scene = EMPTY_GRAPH_SCENE,
  tones = NO_TONES,
  selectedKey = null,
  onNodePick,
  onNodeOpen,
  onNodeHover,
  onZoomChange,
  onAnchor,
  ref,
  style,
  ...rest
}: SoneGraphCanvasProps): ReactElement {
  const el = useRef<HTMLCanvasElement | null>(null);
  const [engine, setEngine] = useState<SoneGraphEngine | null>(null);
  const [cursor, setCursor] = useState<SceneCursor>("grab");
  const events = useRef({
    onNodePick,
    onNodeOpen,
    onNodeHover,
    onZoomChange,
    onAnchor,
  });
  events.current = {
    onNodePick,
    onNodeOpen,
    onNodeHover,
    onZoomChange,
    onAnchor,
  };

  useEffect(() => {
    const canvas = el.current;
    if (!canvas) return;
    const created = new SoneGraphEngine(canvas, {
      pick: (key) => events.current.onNodePick?.(key),
      open: (key) => events.current.onNodeOpen?.(key),
      hover: (key) => events.current.onNodeHover?.(key),
      zoom: (pct) => events.current.onZoomChange?.(pct),
      anchor: (a) => events.current.onAnchor?.(a),
      cursor: setCursor,
    });
    // React's wheel listener is passive: preventDefault needs a native one.
    const wheel = (e: WheelEvent): void => created.wheel(e);
    canvas.addEventListener("wheel", wheel, { passive: false });
    setEngine(created);
    return () => {
      canvas.removeEventListener("wheel", wheel);
      created.dispose();
      setEngine(null);
    };
  }, []);
  useEffect(() => engine?.setScene(scene), [engine, scene]);
  useEffect(() => engine?.setTones(tones), [engine, tones]);
  useEffect(() => engine?.setSelected(selectedKey), [engine, selectedKey]);

  useImperativeHandle(
    ref,
    () => ({
      zoomBy: (factor) => engine?.zoomBy(factor),
      fit: () => engine?.fit(),
    }),
    [engine],
  );

  return (
    <canvas
      ref={el}
      data-slot="graph-canvas"
      tabIndex={0}
      {...rest}
      style={{ ...style, cursor }}
      onPointerDown={(e) => engine?.pointerDown(e.nativeEvent)}
      onPointerMove={(e) => engine?.pointerMove(e.nativeEvent)}
      onPointerUp={(e) => engine?.pointerUp(e.nativeEvent)}
      onPointerCancel={(e) => engine?.pointerUp(e.nativeEvent)}
      onPointerLeave={() => engine?.pointerLeave()}
      onDoubleClick={(e) => engine?.doubleClick(e.nativeEvent)}
      onKeyDown={(e) => engine?.keydown(e.nativeEvent)}
    />
  );
}
