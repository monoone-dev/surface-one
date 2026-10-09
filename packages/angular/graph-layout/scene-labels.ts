import { rgba, type Rgb } from "./scene-color";

export interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The boxes already claimed on one frame, so labels never overlap or leave the canvas. */
export class LabelField {
  private readonly boxes: LabelBox[] = [];
  private readonly width: number;
  private readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  fits(box: LabelBox): boolean {
    if (
      box.x < 2 ||
      box.y < 2 ||
      box.x + box.w > this.width - 2 ||
      box.y + box.h > this.height - 2
    ) {
      return false;
    }
    for (const o of this.boxes) {
      if (
        box.x < o.x + o.w &&
        box.x + box.w > o.x &&
        box.y < o.y + o.h &&
        box.y + box.h > o.y
      ) {
        return false;
      }
    }
    return true;
  }

  claim(box: LabelBox): void {
    this.boxes.push(box);
  }
}

export function clipLabel(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export function boxHitsDisc(
  box: LabelBox,
  cx: number,
  cy: number,
  r: number,
): boolean {
  const nx = cx < box.x ? box.x : cx > box.x + box.w ? box.x + box.w : cx;
  const ny = cy < box.y ? box.y : cy > box.y + box.h ? box.y + box.h : cy;
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export function drawPlateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: LabelBox,
  padX: number,
  plate: Rgb,
  color: string,
): void {
  ctx.fillStyle = rgba(plate, 0.88);
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.fillStyle = color;
  ctx.fillText(text, box.x + padX, box.y + box.h / 2 + 0.5);
}

export function setTracking(
  ctx: CanvasRenderingContext2D,
  value: string,
): void {
  // letterSpacing is absent from older WebKit canvases; untracked caps are an acceptable fallback.
  if ("letterSpacing" in ctx) {
    ctx.letterSpacing = value;
  }
}
