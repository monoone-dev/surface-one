import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SoneCheckboxDirective } from "@surface-one/angular/checkbox";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_RADIO_GROUP_PARTS } from "@surface-one/angular/radio-group";
import { SoneSelectComponent } from "@surface-one/angular/select";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

import { $, $$, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

function change(el: HTMLInputElement | HTMLSelectElement): void {
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

@Component({
  imports: [SoneSelectComponent, SoneSwitchComponent, SoneCheckboxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-select
      selectId="lang"
      ariaLabel="Language"
      [(value)]="language"
      [disabled]="locked()"
    >
      <option value="en">English</option>
      <option value="de">Deutsch</option>
    </sone-select>
    <sone-switch
      inputId="captions"
      ariaLabel="Live captions"
      [(checked)]="captions"
    />
    <input
      soneCheckbox
      id="terms"
      aria-label="Terms"
      [(indeterminate)]="partial"
    />
  `,
})
class ControlsHost {
  readonly language = signal("en");
  readonly captions = signal(false);
  readonly partial = signal(true);
  readonly locked = signal(false);
}

@Component({
  imports: [...SONE_RADIO_GROUP_PARTS, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset soneRadioGroup [(value)]="density" [disabled]="locked()">
      <legend>Density</legend>
      <input soneRadio id="d-default" value="default" aria-label="Default" />
      <input soneRadio id="d-compact" value="compact" aria-label="Compact" />
      <input soneRadio id="d-soon" value="soon" aria-label="Soon" disabled />
    </fieldset>
  `,
})
class RadioHost {
  readonly density = signal<string | null>("compact");
  readonly locked = signal(false);
}

@Component({
  imports: [...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div soneField [invalid]="invalid()">
      <label soneFieldLabel for="email">Email</label>
      <input id="email" type="email" aria-describedby="own-hint" />
      <p soneFieldDescription>We never share it.</p>
      @if (invalid()) {
        <p soneFieldError>Enter a valid address.</p>
      }
    </div>
  `,
})
class FieldHost {
  readonly invalid = signal(false);
}

describe("sone-select", () => {
  it("is a native select bound two-way that follows disabled", async () => {
    const fixture = await render(ControlsHost);
    const select = $<HTMLSelectElement>("#lang");
    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("aria-label")).toBe("Language");
    expect(select.value).toBe("en");
    select.value = "de";
    change(select);
    await settle(fixture);
    expect(fixture.componentInstance.language()).toBe("de");
    fixture.componentInstance.language.set("en");
    fixture.componentInstance.locked.set(true);
    await settle(fixture);
    expect(select.value).toBe("en");
    expect(select.disabled).toBe(true);
  });
});

describe("sone-switch", () => {
  it("is a checkbox input that writes [(checked)] and its data-state", async () => {
    const fixture = await render(ControlsHost);
    const box = $<HTMLInputElement>("#captions");
    expect(box.type).toBe("checkbox");
    expect(box.getAttribute("data-state")).toBe("unchecked");
    box.click();
    await settle(fixture);
    expect(fixture.componentInstance.captions()).toBe(true);
    expect(box.getAttribute("data-state")).toBe("checked");
    fixture.componentInstance.captions.set(false);
    await settle(fixture);
    expect(box.checked).toBe(false);
  });
});

describe("soneCheckbox", () => {
  it("shows the mixed state and clears [(indeterminate)] when toggled", async () => {
    const fixture = await render(ControlsHost);
    const box = $<HTMLInputElement>("#terms");
    expect(box.indeterminate).toBe(true);
    box.click();
    await settle(fixture);
    expect(fixture.componentInstance.partial()).toBe(false);
    expect(box.indeterminate).toBe(false);
    expect(box.checked).toBe(true);
  });
});

describe("soneRadioGroup", () => {
  it("shares one name, checks the value and writes the picked one back", async () => {
    const fixture = await render(RadioHost);
    const group = $("[data-slot=radio-group]");
    expect(group.getAttribute("role")).toBe("radiogroup");
    const radios = $$<HTMLInputElement>("input[type=radio]");
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    expect(radios.map((r) => r.checked)).toEqual([false, true, false]);
    radios[0]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.density()).toBe("default");
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
    fixture.componentInstance.locked.set(true);
    await settle(fixture);
    expect(group.getAttribute("aria-disabled")).toBe("true");
    expect(radios.every((r) => r.disabled)).toBe(true);
  });
});

describe("soneField", () => {
  it("points the control at its description and error and marks it invalid", async () => {
    const fixture = await render(FieldHost);
    const input = $<HTMLInputElement>("#email");
    const description = $("[data-slot=field-description]");
    expect(input.getAttribute("aria-describedby")).toBe(
      `own-hint ${description.id}`,
    );
    expect(input.hasAttribute("aria-invalid")).toBe(false);

    fixture.componentInstance.invalid.set(true);
    await settle(fixture);
    const error = $("[data-slot=field-error]");
    expect(error.getAttribute("role")).toBe("alert");
    expect(input.getAttribute("aria-describedby")).toBe(
      `own-hint ${description.id} ${error.id}`,
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect($("[data-slot=field]").getAttribute("data-invalid")).toBe("true");

    fixture.componentInstance.invalid.set(false);
    await settle(fixture);
    expect(input.getAttribute("aria-describedby")).toBe(
      `own-hint ${description.id}`,
    );
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });
});
