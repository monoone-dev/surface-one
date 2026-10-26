import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";

import {
  SoneAlert,
  SoneAlertAction,
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneSearchField,
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

  it("SoneToggleGroup: stretch", () => {
    const w = mount(() =>
      h(SoneToggleGroup, { stretch: true }, () => [
        h(SoneToggleGroupItem, null, () => "New folder"),
      ]),
    );
    expect(w.get('[data-slot="toggle-group"]').attributes("data-stretch")).toBe(
      "",
    );
    const plain = mount(SoneToggleGroup);
    expect(plain.attributes("data-stretch")).toBeUndefined();
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

  it("Isles variants: badge info / count, square avatar, accent and soft buttons", () => {
    expect(
      mount(SoneBadge, { props: { variant: "info" } }).attributes(
        "data-variant",
      ),
    ).toBe("info");
    expect(
      mount(SoneBadge, { props: { variant: "count" } }).attributes(
        "data-variant",
      ),
    ).toBe("count");
    const avatar = mount(() =>
      h(SoneAvatar, { shape: "square" }, () =>
        h(SoneAvatarFallback, null, () => "DS"),
      ),
    );
    expect(avatar.get("sone-avatar").attributes("data-shape")).toBe("square");
    expect(mount(SoneAvatar).attributes("data-shape")).toBeUndefined();
    expect(
      mount(SoneButton, { props: { variant: "accent" } }).attributes(
        "data-variant",
      ),
    ).toBe("accent");
    const soft = mount(SoneButton, {
      props: { variant: "soft", size: "icon" },
      attrs: { "aria-pressed": "true", "aria-label": "Star" },
    });
    expect(soft.attributes("data-variant")).toBe("soft");
    expect(soft.attributes("aria-pressed")).toBe("true");
  });

  it("Isles variants: filled input group and search field", () => {
    expect(
      mount(SoneInputGroup, { props: { variant: "filled" } }).attributes(
        "data-variant",
      ),
    ).toBe("filled");
    expect(mount(SoneInputGroup).attributes("data-variant")).toBeUndefined();
    const search = mount(SoneSearchField, { props: { variant: "filled" } });
    expect(
      search.get('[data-slot="input-group"]').attributes("data-variant"),
    ).toBe("filled");
    expect(search.find('[role="searchbox"]').exists()).toBe(true);
  });
});
