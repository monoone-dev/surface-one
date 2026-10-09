export interface SceneDrag {
  dx: number;
  dy: number;
  started: boolean;
  moved: boolean;
}

export type SceneCursor = "grab" | "grabbing" | "pointer";

/** Press / drag / click / hover bookkeeping for one canvas; `onCursor` fires when the cursor changes. */
export class ScenePointer {
  hoverId: string | null = null;
  pressed = false;
  private dragging = false;
  private moved = false;
  private downX = 0;
  private downY = 0;
  private lastX = 0;
  private lastY = 0;
  private cursorNow: SceneCursor = "grab";
  private readonly onCursor: (cursor: SceneCursor) => void;

  constructor(onCursor: (cursor: SceneCursor) => void) {
    this.onCursor = onCursor;
  }

  press(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    this.pressed = true;
    this.moved = false;
    this.downX = event.clientX;
    this.downY = event.clientY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    (event.target as Element).setPointerCapture?.(event.pointerId);
  }

  drag(event: PointerEvent): SceneDrag | null {
    if (!this.pressed) {
      return null;
    }
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    let started = false;
    if (
      !this.moved &&
      Math.hypot(event.clientX - this.downX, event.clientY - this.downY) > 4
    ) {
      this.moved = true;
      started = true;
      this.dragging = true;
      this.syncCursor();
    }
    return { dx, dy, started, moved: this.moved };
  }

  release(event: PointerEvent): boolean {
    const wasClick = this.pressed && !this.moved;
    this.pressed = false;
    this.moved = false;
    this.dragging = false;
    this.syncCursor();
    (event.target as Element).releasePointerCapture?.(event.pointerId);
    return wasClick;
  }

  setHover(id: string | null): boolean {
    if (id === this.hoverId) {
      return false;
    }
    this.hoverId = id;
    this.syncCursor();
    return true;
  }

  private syncCursor(): void {
    const next: SceneCursor = this.dragging
      ? "grabbing"
      : this.hoverId !== null
        ? "pointer"
        : "grab";
    if (next !== this.cursorNow) {
      this.cursorNow = next;
      this.onCursor(next);
    }
  }
}
