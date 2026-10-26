import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SoneAvatar, SoneAvatarFallback } from "../src/components/avatar";
import { SoneBadge } from "../src/components/badge";
import { SoneButton } from "../src/components/button";
import { SoneInputGroup } from "../src/components/input";
import { SoneSearchField } from "../src/components/search-field";

// The React twins render the same attributes as the Angular variants, so the shared
// stylesheets apply unchanged.
describe("Isles variants shared with @surface-one/angular", () => {
  it("badge info / count, square avatar, accent and soft buttons", () => {
    const { container } = render(
      <>
        <SoneBadge variant="info" id="info">
          Beta
        </SoneBadge>
        <SoneBadge variant="count" id="count">
          12
        </SoneBadge>
        <SoneAvatar shape="square" id="square">
          <SoneAvatarFallback>DS</SoneAvatarFallback>
        </SoneAvatar>
        <SoneAvatar id="circle" />
        <SoneButton variant="accent" id="accent">
          Send
        </SoneButton>
        <SoneButton
          variant="soft"
          size="icon"
          aria-label="Star"
          aria-pressed
          id="soft"
        >
          *
        </SoneButton>
      </>,
    );
    const q = (s: string) => container.querySelector(s)!;
    expect(q("#info").getAttribute("data-variant")).toBe("info");
    expect(q("#count").getAttribute("data-variant")).toBe("count");
    expect(q("#square").getAttribute("data-shape")).toBe("square");
    expect(q("#circle").hasAttribute("data-shape")).toBe(false);
    expect(q("#accent").getAttribute("data-variant")).toBe("accent");
    expect(q("#soft").getAttribute("data-variant")).toBe("soft");
    expect(q("#soft").getAttribute("aria-pressed")).toBe("true");
  });

  it("filled input group and search field", () => {
    const { container } = render(
      <>
        <SoneInputGroup variant="filled" id="group" />
        <SoneInputGroup id="plain" />
        <SoneSearchField variant="filled" className="search" />
      </>,
    );
    const q = (s: string) => container.querySelector(s)!;
    expect(q("#group").getAttribute("data-variant")).toBe("filled");
    expect(q("#plain").hasAttribute("data-variant")).toBe(false);
    expect(
      q('.search [data-slot="input-group"]').getAttribute("data-variant"),
    ).toBe("filled");
    expect(q('.search [role="searchbox"]')).toBeTruthy();
  });
});
