import { type Type } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

/** Renders a host component into the document (focus and portals need it) and settles it. */
export async function render<T>(host: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  return fixture;
}

/** Lets signals, effects and after-render hooks run. */
export async function settle(
  fixture: ComponentFixture<unknown>,
): Promise<void> {
  await fixture.whenStable();
  await fixture.whenStable();
}

export function key(
  target: Element,
  k: string,
  init: KeyboardEventInit = {},
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: k,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

export const $ = <E extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): E => root.querySelector<E>(selector) as E;

export const $$ = <E extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): E[] => Array.from(root.querySelectorAll<E>(selector));
