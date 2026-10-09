import { clamp } from "./scene-math";

/** The camera: world → screen is `centre + pan + world * scale`. */
export interface SceneView {
  scale: number;
  panX: number;
  panY: number;
}

export function canvasPoint(
  el: Element,
  clientX: number,
  clientY: number,
): [number, number] {
  const rect = el.getBoundingClientRect();
  return [clientX - rect.left, clientY - rect.top];
}

export function wheelFocus(
  el: Element,
  event: WheelEvent,
): { ox: number; oy: number; step: number } {
  const rect = el.getBoundingClientRect();
  return {
    ox: event.clientX - rect.left - rect.width / 2,
    oy: event.clientY - rect.top - rect.height / 2,
    step: clamp(event.deltaY, -80, 80) * 0.0016,
  };
}

/** The pan that keeps the screen offset `o` fixed while the scale changes by `k`. */
export function zoomPanAbout(o: number, pan: number, k: number): number {
  return o - (o - pan) * k;
}
