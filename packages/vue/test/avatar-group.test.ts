import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneAvatarGroup,
  soneInitials,
} from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

describe("SoneAvatarGroup", () => {
  it("draws people as named images with initials, then a named +N, like Angular", async () => {
    const out = await ssr(() =>
      h(SoneAvatarGroup, {
        ariaLabel: "Project members",
        size: "sm",
        max: 2,
        people: [
          { name: "Ada Lovelace", src: "/ada.png" },
          { name: "Grace Hopper" },
          { name: "Alan Turing" },
        ],
      }),
    );
    expect(out).toContain(
      '<sone-avatar-group class="avatar-group" data-slot="avatar-group" role="group" data-size="sm" aria-label="Project members">',
    );
    expect(out).toContain(
      '<sone-avatar class="avatar" data-slot="avatar" data-size="sm" role="img" aria-label="Ada Lovelace"><img class="avatar-image" data-slot="avatar-image" src="/ada.png" alt><span class="avatar-fallback" data-slot="avatar-fallback" aria-hidden="true">AL</span></sone-avatar>',
    );
    expect(out).toContain('aria-label="Grace Hopper"');
    expect(out).not.toContain("Alan Turing");
    expect(out).toMatch(
      /<sone-avatar class="avatar avatar-group-overflow" data-slot="avatar-group-overflow" data-size="sm" role="img" aria-label="1 more">/,
    );
    expect(out).toContain(">+1</span>");
    expect(soneInitials("Ada Lovelace")).toBe("AL");
  });

  it("caps and resizes avatar children", async () => {
    const child = (name: string) =>
      h(SoneAvatar, { role: "img", "aria-label": name }, () =>
        h(SoneAvatarFallback, null, () => name[0]),
      );
    const out = await ssr(() =>
      h(SoneAvatarGroup, { max: 1, size: "lg" }, () => [
        child("Ada"),
        child("Grace"),
      ]),
    );
    expect(out).toContain('aria-label="Ada"');
    expect(out).not.toContain('aria-label="Grace"');
    expect(out).toContain('data-size="lg"');
    expect(out).toContain('aria-label="1 more"');
  });
});
