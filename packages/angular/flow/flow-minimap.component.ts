import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  numberAttribute,
  viewChild,
} from "@angular/core";

import { flowBounds } from "./flow.geometry";
import { SONE_FLOW } from "./flow.token";
import type { SoneFlowPanelPosition } from "./flow.types";

const PAD = 24;

/**
 * A small overview of the whole `<sone-flow>`: every node as a block and the
 * visible area as a frame. Click or drag in it to move the view there. A pointer
 * shortcut — the keyboard has the controls and Tab between nodes — so it is
 * hidden from assistive technology.
 */
@Component({
  selector: "sone-flow-minimap",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flow-panel",
    "data-slot": "flow-minimap",
    "aria-hidden": "true",
    "[attr.data-position]": "position()",
    "[style.width.px]": "width()",
    "[style.height.px]": "height()",
  },
  template: `
    <svg
      #svg
      class="flow-minimap-svg"
      [attr.viewBox]="view().box"
      preserveAspectRatio="xMidYMid meet"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
    >
      @for (r of flow.rendered(); track r.node.id) {
        <rect
          class="flow-minimap-node"
          [attr.data-tone]="r.node.tone ?? 'neutral'"
          [attr.data-selected]="r.selected ? '' : null"
          [attr.x]="r.rect.x"
          [attr.y]="r.rect.y"
          [attr.width]="r.rect.width"
          [attr.height]="r.rect.height"
          [attr.rx]="r.node.shape === 'circle' ? r.rect.width / 2 : 6"
        />
      }
      @if (view().visible; as v) {
        <rect
          class="flow-minimap-viewport"
          [attr.x]="v.x"
          [attr.y]="v.y"
          [attr.width]="v.width"
          [attr.height]="v.height"
          [attr.stroke-width]="view().stroke"
          rx="4"
        />
      }
    </svg>
  `,
})
export class SoneFlowMinimapComponent {
  protected readonly flow = inject(SONE_FLOW);

  readonly position = input<SoneFlowPanelPosition>("bottom-right");
  readonly width = input(200, { transform: numberAttribute });
  readonly height = input(136, { transform: numberAttribute });

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>("svg");
  private dragging: number | null = null;

  protected readonly view = computed(() => {
    const v = this.flow.viewport();
    const pane = this.flow.paneSize();
    const visible = pane.width
      ? {
          x: -v.x / v.zoom,
          y: -v.y / v.zoom,
          width: pane.width / v.zoom,
          height: pane.height / v.zoom,
        }
      : null;
    const rects = this.flow.rendered().map((r) => r.rect);
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
    const scale = Math.max(box[2] / this.width(), box[3] / this.height());
    return { box: box.join(" "), visible, stroke: 1.5 * scale };
  });

  protected onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    this.dragging = e.pointerId;
    this.svg().nativeElement.setPointerCapture?.(e.pointerId);
    this.moveTo(e);
  }

  protected onPointerMove(e: PointerEvent): void {
    if (this.dragging === e.pointerId) this.moveTo(e);
  }

  protected onPointerUp(e: PointerEvent): void {
    if (this.dragging !== e.pointerId) return;
    this.dragging = null;
    const svg = this.svg().nativeElement;
    if (svg.hasPointerCapture(e.pointerId))
      svg.releasePointerCapture(e.pointerId);
  }

  private moveTo(e: PointerEvent): void {
    const svg = this.svg().nativeElement;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    this.flow.centerOn({ x: p.x, y: p.y });
  }
}
