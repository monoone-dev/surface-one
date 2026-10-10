import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";

import {
  SoneAlert,
  SoneAlertAction,
  SoneBadge,
  SoneFieldLabel,
  SoneFieldLabelOptional,
  SoneInputGroup,
  SoneStat,
  SoneTabsList,
  SoneTabsTrigger,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "../src/index";

// The Vue twins render the same attributes as the Angular variants, so the shared
// stylesheets apply unchanged.
describe("variants shared with @surface-one/angular", () => {
  it("SoneBadge: dashed variant and interactive flag", () => {
    const w = mount(SoneBadge, {
      props: { variant: "dashed", interactive: true },
      slots: { default: () => "Local" },
    });
    expect(w.attributes("data-variant")).toBe("dashed");
    expect(w.attributes("data-interactive")).toBe("");
    const plain = mount(SoneBadge, { slots: { default: () => "x" } });
    expect(plain.attributes("data-interactive")).toBeUndefined();
  });

  it("SoneToggleGroup: dashed reaches the items", () => {
    const w = mount(() =>
      h(SoneToggleGroup, { variant: "dashed" }, () => [
        h(SoneToggleGroupItem, { pressed: true }, () => "New folder"),
      ]),
    );
    expect(
      w.get('[data-slot="toggle-group-item"]').attributes("data-variant"),
    ).toBe("dashed");
  });

  it("SoneTabsList: stretch", () => {
    const w = mount(() =>
      h(SoneTabsList, { stretch: true }, () => [
        h(SoneTabsTrigger, { active: true }, () => "Folder"),
      ]),
    );
    expect(w.get('[data-slot="tabs-list"]').attributes("data-stretch")).toBe(
      "",
    );
  });

  it("SoneStat: align center", () => {
    const w = mount(SoneStat, { props: { align: "center" } });
    expect(w.attributes("data-align")).toBe("center");
    expect(mount(SoneStat).attributes("data-align")).toBeUndefined();
  });

  it("SoneInputGroup: fill", () => {
    const w = mount(SoneInputGroup, { props: { fill: true } });
    expect(w.attributes("data-fill")).toBe("");
  });

  it("SoneFieldLabelOptional: the quiet marker inside a label", () => {
    const w = mount(() =>
      h(SoneFieldLabel, null, () => [
        "Guidance ",
        h(SoneFieldLabelOptional, null, () => "Optional"),
      ]),
    );
    const marker = w.get('[data-slot="field-label-optional"]');
    expect(marker.element.tagName).toBe("SPAN");
    expect(marker.text()).toBe("Optional");
  });

  it("SoneAlert: actionsAlign", () => {
    const w = mount(SoneAlert, {
      props: { actionsAlign: "center" },
      slots: { default: () => h(SoneAlertAction, null, () => "Retry") },
    });
    expect(w.attributes("data-actions-align")).toBe("center");
    expect(mount(SoneAlert).attributes("data-actions-align")).toBeUndefined();
  });
});
