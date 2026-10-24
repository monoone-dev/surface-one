import { describe, expect, it } from "vitest";

import { pageSiteHeaderClosesMenu } from "../src";

describe("pageSiteHeaderClosesMenu", () => {
  it("closes the menu for a click inside a link only", () => {
    document.body.innerHTML =
      '<div><a href="/a"><span id="in">A</span></a><a id="bare">B</a><p id="p">C</p></div>';
    expect(pageSiteHeaderClosesMenu(document.getElementById("in"))).toBe(true);
    expect(pageSiteHeaderClosesMenu(document.getElementById("bare"))).toBe(
      false,
    );
    expect(pageSiteHeaderClosesMenu(document.getElementById("p"))).toBe(false);
    expect(pageSiteHeaderClosesMenu(null)).toBe(false);
  });
});
