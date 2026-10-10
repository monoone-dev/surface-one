import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneCollapsibleSection,
  SoneConfirm,
  SoneConfirmActions,
  SoneConfirmDescription,
  SoneConfirmError,
  SoneConfirmTitle,
  SoneFilterChips,
  SoneLoadMore,
  SoneSearchField,
  SoneSectionHeading,
  provideSoneMessages,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const attach = () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
};

describe("SoneConfirm", () => {
  const confirm = (props: Record<string, unknown> = {}, extra = () => []) =>
    mount(
      () =>
        h(
          SoneConfirm,
          { variant: "destructive", confirmLabel: "Delete", ...props },
          () => [
            h(SoneConfirmTitle, null, () => "Delete “Weekly sync”?"),
            h(SoneConfirmDescription, null, () => "It moves to the trash."),
            ...extra(),
          ],
        ),
      { attachTo: attach() },
    );

  it("is an alertdialog named and described by its parts, Cancel then Confirm", () => {
    const w = confirm();
    const root = w.get('[data-slot="confirm"]');
    expect(root.attributes("role")).toBe("alertdialog");
    expect(root.classes()).toContain("confirm");
    const title = w.get('[data-slot="confirm-title"]');
    const desc = w.get('[data-slot="confirm-description"]');
    expect(root.attributes("aria-labelledby")).toBe(title.attributes("id"));
    expect(root.attributes("aria-describedby")).toBe(desc.attributes("id"));
    const buttons = w.findAll("button");
    expect(buttons.map((b) => b.text())).toEqual(["Cancel", "Delete"]);
    expect(buttons[0]!.classes()).toContain("confirm-cancel");
    expect(buttons[1]!.attributes("data-variant")).toBe("destructive");
  });

  it("focuses Confirm on mount unless autoFocus is off", async () => {
    const w = confirm();
    await nextTick();
    expect(document.activeElement).toBe(w.get(".confirm-action").element);
    w.unmount();
    confirm({ autoFocus: false });
    await nextTick();
    expect(document.activeElement).toBe(document.body);
  });

  it("Escape cancels without bubbling to an enclosing dialog", async () => {
    const outer: string[] = [];
    const cancels: string[] = [];
    const w = mount(
      () =>
        h("div", { onKeydown: () => outer.push("outer") }, [
          h(SoneConfirm, { onCancel: () => cancels.push("cancel") }, () =>
            h(SoneConfirmTitle, null, () => "Leave?"),
          ),
        ]),
      { attachTo: attach() },
    );
    await w.get('[data-slot="confirm"]').trigger("keydown", { key: "Escape" });
    expect(cancels).toEqual(["cancel"]);
    expect(outer).toEqual([]);
  });

  it("while busy: aria-disabled buttons, busy label, no events", async () => {
    const events: string[] = [];
    const w = confirm({
      busy: true,
      busyLabel: "Deleting…",
      onConfirm: () => events.push("confirm"),
      onCancel: () => events.push("cancel"),
    });
    const [cancel, action] = w.findAll("button");
    expect(cancel!.attributes("aria-disabled")).toBe("true");
    expect(action!.attributes("aria-disabled")).toBe("true");
    expect(action!.text()).toBe("Deleting…");
    expect(action!.find("sone-spinner").exists()).toBe(true);
    expect(w.get('[data-slot="confirm"]').attributes("aria-busy")).toBe("true");
    await cancel!.trigger("click");
    await action!.trigger("click");
    await w.get('[data-slot="confirm"]').trigger("keydown", { key: "Escape" });
    expect(events).toEqual([]);
  });

  it("emits confirm and cancel from the buttons", async () => {
    const events: string[] = [];
    const w = confirm({
      onConfirm: () => events.push("confirm"),
      onCancel: () => events.push("cancel"),
    });
    await w.get(".confirm-cancel").trigger("click");
    await w.get(".confirm-action").trigger("click");
    expect(events).toEqual(["cancel", "confirm"]);
  });

  it("describes by the error too, and puts the actions part at the start of the footer", async () => {
    const show = ref(true);
    const w = mount(
      () =>
        h(SoneConfirm, { layout: "card", size: "compact" }, () => [
          h(SoneConfirmTitle, { as: "h3", id: "t" }, () => "Remove the lock?"),
          h(SoneConfirmDescription, { id: "d" }, () => "Notes are decrypted."),
          show.value
            ? h(SoneConfirmError, { id: "e" }, () => "Cancelled.")
            : null,
          h(SoneConfirmActions, null, () => h("label", "Don't ask again")),
        ]),
      { attachTo: attach() },
    );
    const root = w.get('[data-slot="confirm"]');
    expect(root.attributes("aria-labelledby")).toBe("t");
    expect(root.attributes("aria-describedby")).toBe("d e");
    expect(w.get("#t").element.tagName).toBe("H3");
    expect(w.get("#e").attributes("role")).toBe("alert");
    const footer = w.get('[data-slot="confirm-footer"]');
    expect(footer.element.firstElementChild?.getAttribute("data-slot")).toBe(
      "confirm-actions",
    );
    expect(w.findAll("button").map((b) => b.attributes("data-size"))).toEqual([
      "xs",
      "xs",
    ]);
    expect(w.get(".confirm-cancel").attributes("data-variant")).toBe("outline");
    show.value = false;
    await nextTick();
    expect(root.attributes("aria-describedby")).toBe("d");
  });

  it("links a nested part through registration", async () => {
    const w = mount(
      () =>
        h(SoneConfirm, null, () =>
          h(
            "div",
            null,
            h(SoneConfirmTitle, { id: "nested" }, () => "Q?"),
          ),
        ),
      { attachTo: attach() },
    );
    await nextTick();
    expect(w.get('[data-slot="confirm"]').attributes("aria-labelledby")).toBe(
      "nested",
    );
  });

  it("server-renders the ARIA links and keeps them on hydration", async () => {
    const render = () =>
      h(SoneConfirm, null, () => [
        h(SoneConfirmTitle, null, () => "Delete?"),
        h(SoneConfirmDescription, null, () => "Gone for good."),
      ]);
    const html = await renderToString(createSSRApp({ render }));
    const titleId = /data-slot="confirm-title" id="([^"]+)"/.exec(html)?.[1];
    const descId = /data-slot="confirm-description" id="([^"]+)"/.exec(
      html,
    )?.[1];
    expect(titleId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${titleId}"`);
    expect(html).toContain(`aria-describedby="${descId}"`);

    const el = attach();
    el.innerHTML = html;
    const app = createSSRApp({ render });
    app.mount(el);
    await nextTick();
    expect(el.querySelector('[data-slot="confirm-title"]')?.id).toBe(titleId);
    expect(
      el
        .querySelector('[data-slot="confirm"]')
        ?.getAttribute("aria-labelledby"),
    ).toBe(titleId);
  });

  it("translates the built-in labels", () => {
    const w = mount(SoneConfirm, {
      global: {
        plugins: [
          {
            install: (app) =>
              provideSoneMessages(app, {
                confirm: "Potwierdź",
                cancel: "Anuluj",
              }),
          },
        ],
      },
    });
    expect(w.findAll("button").map((b) => b.text())).toEqual([
      "Anuluj",
      "Potwierdź",
    ]);
  });
});

describe("SoneSearchField", () => {
  it("renders a searchbox in an input group; v-model, clear button and Enter", async () => {
    const q = ref("");
    const submitted: string[] = [];
    const w = mount(
      () =>
        h(SoneSearchField, {
          modelValue: q.value,
          "onUpdate:modelValue": (v: string) => (q.value = v),
          onSubmit: (v: string) => submitted.push(v),
          clearable: true,
          ariaLabel: "Search notes",
          class: "wide",
        }),
      { attachTo: attach() },
    );
    const host = w.get("sone-search-field");
    expect(host.classes()).toContain("wide");
    const input = w.get("input");
    expect(input.attributes("role")).toBe("searchbox");
    expect(input.attributes("aria-label")).toBe("Search notes");
    expect(input.attributes("placeholder")).toBe("Search");
    expect(w.find(".search-field-clear").exists()).toBe(false);
    await input.setValue("budget");
    expect(q.value).toBe("budget");
    const clear = w.get(".search-field-clear");
    expect(clear.attributes("aria-label")).toBe("Clear search");
    await input.trigger("keydown", { key: "Enter" });
    expect(submitted).toEqual(["budget"]);
    await clear.trigger("click");
    expect(q.value).toBe("");
    expect(document.activeElement).toBe(input.element);
  });

  it("Escape clears first, then emits escape", async () => {
    const q = ref("x");
    const escapes: number[] = [];
    const outer: number[] = [];
    const w = mount(() =>
      h("div", { onKeydown: () => outer.push(1) }, [
        h(SoneSearchField, {
          modelValue: q.value,
          "onUpdate:modelValue": (v: string) => (q.value = v),
          onEscape: () => escapes.push(1),
          clearable: true,
        }),
      ]),
    );
    await w.get("input").trigger("keydown", { key: "Escape" });
    expect(q.value).toBe("");
    expect(escapes).toEqual([]);
    expect(outer).toEqual([]);
    await w.get("input").trigger("keydown", { key: "Escape" });
    expect(escapes).toEqual([1]);
  });

  it("disabled and size", () => {
    const w = mount(SoneSearchField, {
      props: { modelValue: "x", clearable: true, disabled: true, size: "sm" },
    });
    expect(w.attributes("data-size")).toBe("sm");
    expect(w.get("input").attributes("disabled")).toBe("");
    expect(w.find(".search-field-clear").exists()).toBe(false);
    expect(w.get('[data-slot="input-group"]').attributes("data-disabled")).toBe(
      "true",
    );
  });
});

describe("SoneCollapsibleSection", () => {
  it("a header button with title, subtitle and count that toggles v-model:open", async () => {
    const open = ref(false);
    const w = mount(() =>
      h(
        SoneCollapsibleSection,
        {
          title: "Action items",
          subtitle: "Last 3 meetings",
          count: 3,
          open: open.value,
          "onUpdate:open": (v: boolean) => (open.value = v),
        },
        {
          default: () => h("p", "Body"),
          actions: () => h("button", { class: "copy" }, "Copy"),
        },
      ),
    );
    const host = w.get("sone-collapsible-section");
    expect(host.attributes("title")).toBeUndefined();
    expect(host.attributes("data-state")).toBe("closed");
    const trigger = w.get("button.collapsible-trigger");
    expect(trigger.text()).toContain("Action items");
    expect(trigger.text()).toContain("Last 3 meetings");
    expect(trigger.get('[data-slot="collapsible-section-count"]').text()).toBe(
      "3",
    );
    expect(trigger.attributes("aria-expanded")).toBe("false");
    const body = w.get('[data-slot="collapsible-section-content"]');
    expect(trigger.attributes("aria-controls")).toBe(body.attributes("id"));
    expect(body.attributes("hidden")).toBeDefined();
    // The actions sit outside the toggle button.
    expect(trigger.find(".copy").exists()).toBe(false);
    expect(w.get(".header > .actions > .copy").exists()).toBe(true);
    await trigger.trigger("click");
    expect(open.value).toBe(true);
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(body.attributes("hidden")).toBeUndefined();
  });
});

describe("SoneFilterChips", () => {
  const OPTIONS = [
    { value: "all", label: "All", count: 128 },
    { value: "error", label: "Errors", count: 3, tone: "danger" as const },
    { value: "warn", label: "Warnings", disabled: true },
    { value: "info", label: "Info" },
  ];

  it("toggle chips: a labelled group of aria-pressed buttons with tinted counts", async () => {
    const v = ref("all");
    const w = mount(
      () =>
        h(SoneFilterChips, {
          options: OPTIONS,
          modelValue: v.value,
          "onUpdate:modelValue": (x: string) => (v.value = x),
          ariaLabel: "Filter by level",
        }),
      { attachTo: attach() },
    );
    const group = w.get('[role="group"]');
    expect(group.attributes("aria-label")).toBe("Filter by level");
    expect(group.attributes("data-variant")).toBe("outline");
    const buttons = w.findAll("button");
    expect(buttons.map((b) => b.attributes("aria-pressed"))).toEqual([
      "true",
      "false",
      "false",
      "false",
    ]);
    expect(buttons[1]!.get(".count").attributes("data-variant")).toBe(
      "destructive",
    );
    expect(buttons[2]!.attributes("disabled")).toBe("");
    await buttons[1]!.trigger("click");
    expect(v.value).toBe("error");

    // Arrows skip the disabled chip; Home / End jump to the ends.
    (buttons[1]!.element as HTMLElement).focus();
    await group.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[3]!.element);
    await group.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]!.element);
    await group.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(buttons[3]!.element);
  });

  it("tabs: a group of pressed buttons, not a tablist", () => {
    const w = mount(SoneFilterChips, {
      props: { options: OPTIONS, modelValue: "info", variant: "tabs" },
    });
    expect(w.attributes("data-variant")).toBe("tabs");
    const list = w.get('[data-slot="tabs-list"]');
    expect(list.attributes("role")).toBe("group");
    const buttons = w.findAll("button");
    expect(buttons.map((b) => b.attributes("aria-pressed"))).toEqual([
      "false",
      "false",
      "false",
      "true",
    ]);
    expect(buttons[0]!.attributes("aria-selected")).toBeUndefined();
  });
});

describe("SoneSectionHeading", () => {
  it("renders a real heading of the given level with a count and actions", () => {
    const w = mount(SoneSectionHeading, {
      props: { title: "Meetings", count: 24 },
      slots: { actions: () => h("button", "New meeting") },
    });
    expect(w.attributes("data-level")).toBe("2");
    expect(w.attributes("title")).toBeUndefined();
    expect(w.get("h2.heading").text()).toBe("Meetings24");
    expect(w.get("h2 .count").attributes("data-variant")).toBe("secondary");
    expect(w.get(".actions > button").text()).toBe("New meeting");
    for (const level of [3, 4] as const) {
      const x = mount(SoneSectionHeading, { props: { title: "T", level } });
      expect(x.find(`h${level}`).exists()).toBe(true);
    }
    const bad = mount(SoneSectionHeading, {
      props: { title: "T", level: 6 as never },
    });
    expect(bad.find("h2").exists()).toBe(true);
  });
});

describe("SoneLoadMore", () => {
  it("adds the remaining count, emits load and hides at 0", async () => {
    const w = mount(SoneLoadMore, { props: { remaining: 12 } });
    expect(w.get("button").text()).toBe("Show more (12)");
    expect(w.attributes("hidden")).toBeUndefined();
    await w.get("button").trigger("click");
    expect(w.emitted("load")).toHaveLength(1);
    await w.setProps({ remaining: 0 });
    expect(w.attributes("hidden")).toBeDefined();
  });

  it("busy: aria-disabled with a spinner, no load", async () => {
    const w = mount(SoneLoadMore, { props: { busy: true, remaining: 0 } });
    const button = w.get("button");
    expect(w.attributes("hidden")).toBeUndefined();
    expect(w.attributes("data-state")).toBe("loading");
    expect(button.attributes("aria-disabled")).toBe("true");
    expect(button.text()).toBe("Loading…");
    expect(button.find("sone-spinner").exists()).toBe(true);
    await button.trigger("click");
    expect(w.emitted("load")).toBeUndefined();
  });

  it("error: an alert above a retry button", async () => {
    const w = mount(SoneLoadMore, {
      props: { error: "Could not load.", remaining: 0, align: "start" },
    });
    expect(w.attributes("hidden")).toBeUndefined();
    expect(w.attributes("data-align")).toBe("start");
    expect(w.attributes("data-state")).toBe("error");
    expect(w.get('[role="alert"]').text()).toBe("Could not load.");
    expect(w.get("button").text()).toBe("Try again");
    await w.get("button").trigger("click");
    expect(w.emitted("load")).toHaveLength(1);
  });
});
