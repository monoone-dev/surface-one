import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";

import {
  SoneStat,
  SoneStatGroup,
  SoneStatLabel,
  SoneStatTrend,
  SoneStatValue,
} from "../src/index";

describe("SoneStat", () => {
  it("renders a dl with dt before dd and the group's columns", () => {
    const w = mount(() =>
      h(SoneStatGroup, { columns: 3, separated: true }, () =>
        h(SoneStat, { variant: "inset", labelPosition: "bottom" }, () => [
          h(SoneStatLabel, null, () => "Meetings"),
          h(SoneStatValue, null, () => "128"),
        ]),
      ),
    );
    const dl = w.find("dl");
    expect(dl.attributes("data-slot")).toBe("stat-group");
    expect(dl.attributes("data-columns")).toBe("3");
    expect(dl.attributes("data-separated")).toBe("");
    expect(dl.attributes("style")).toContain("--stat-columns: 3");
    const stat = w.find('[data-slot="stat"]');
    expect(stat.attributes("data-variant")).toBe("inset");
    expect(stat.attributes("data-label-position")).toBe("bottom");
    expect(stat.element.children[0]!.tagName).toBe("DT");
    expect(stat.element.children[1]!.tagName).toBe("DD");
  });

  it("speaks the trend's direction and colours it by sign", () => {
    const up = mount(SoneStatTrend, {
      props: { delta: 0.12 },
      slots: { default: () => "12%" },
    });
    expect(up.attributes("data-tone")).toBe("positive");
    expect(up.attributes("data-direction")).toBe("up");
    expect(up.find(".sr-only").text()).toBe("up");
    expect(up.find("svg").attributes("aria-hidden")).toBe("true");
    expect(up.text()).toContain("12%");

    const down = mount(SoneStatTrend, {
      props: { delta: -3, tone: "neutral" },
    });
    expect(down.attributes("data-tone")).toBe("neutral");
    expect(down.attributes("data-direction")).toBe("down");

    const none = mount(SoneStatTrend, { props: { delta: null } });
    expect(none.find("svg").exists()).toBe(false);
    expect(none.attributes("data-tone")).toBe("neutral");
  });
});
