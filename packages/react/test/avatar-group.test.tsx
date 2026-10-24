import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SoneAvatar, SoneAvatarFallback } from "../src/components/avatar";
import { SoneAvatarGroup } from "../src/components/avatar-group";

describe("SoneAvatarGroup", () => {
  it("draws people as named images with initials, then a named +N, like Angular", () => {
    const out = renderToString(
      <SoneAvatarGroup
        ariaLabel="Project members"
        size="sm"
        max={2}
        people={[
          { name: "Ada Lovelace", src: "/ada.png" },
          { name: "Grace Hopper" },
          { name: "Alan Turing" },
        ]}
      />,
    );
    expect(out).toContain(
      '<sone-avatar-group data-slot="avatar-group" role="group" data-size="sm" aria-label="Project members" class="avatar-group">',
    );
    expect(out).toContain(
      '<sone-avatar data-slot="avatar" data-size="sm" role="img" aria-label="Ada Lovelace" class="avatar"><img src="/ada.png" alt="" class="avatar-image" data-slot="avatar-image"/><span data-slot="avatar-fallback" aria-hidden="true" class="avatar-fallback">AL</span></sone-avatar>',
    );
    expect(out).not.toContain("Alan Turing");
    expect(out).toContain('aria-label="1 more"');
    expect(out).toContain(">+1</span>");
  });

  it("caps and resizes avatar children", () => {
    const out = renderToString(
      <SoneAvatarGroup max={1} size="lg">
        <SoneAvatar role="img" aria-label="Ada">
          <SoneAvatarFallback>A</SoneAvatarFallback>
        </SoneAvatar>
        <SoneAvatar role="img" aria-label="Grace">
          <SoneAvatarFallback>G</SoneAvatarFallback>
        </SoneAvatar>
      </SoneAvatarGroup>,
    );
    expect(out).toContain('aria-label="Ada"');
    expect(out).not.toContain('aria-label="Grace"');
    expect(out).toContain('data-size="lg"');
    expect(out).toContain('aria-label="1 more"');
  });
});
