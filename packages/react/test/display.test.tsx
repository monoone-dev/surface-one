import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SoneMessagesProvider } from "../src/context/messages";
import { SoneLogoAssetsContext } from "../src/context/logo-assets";
import {
  SoneAlert,
  SoneAlertAction,
  SoneAlertDescription,
  SoneAlertTitle,
} from "../src/components/alert";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneAvatarImage,
} from "../src/components/avatar";
import { SoneBadge, SoneBadgeRemove } from "../src/components/badge";
import { SoneBanner } from "../src/components/banner";
import {
  SoneEmpty,
  SoneEmptyMedia,
  SoneEmptyTitle,
} from "../src/components/empty-state";
import {
  SoneItem,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemSeparator,
  SoneItemTitle,
} from "../src/components/item";
import { SoneKbd, SoneKbdGroup } from "../src/components/kbd";
import {
  SonePageHeader,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
} from "../src/components/page-header";
import { SoneSeparator } from "../src/components/separator";
import { SoneSkeleton } from "../src/components/skeleton";
import { SoneSpinner } from "../src/components/spinner";
import { SoneLogo } from "../src/components/logo";
import { SoneSectionHeading } from "../src/components/section-heading";
import { SoneSpeakerChip } from "../src/components/speaker-chip";
import { SoneElapsedTimer } from "../src/components/elapsed-timer";
import { SoneLoadMore } from "../src/components/load-more";
import { SoneIcon } from "../src/components/icon";

describe("SoneAlert", () => {
  it("renders no close button unless dismissible", () => {
    const { container } = render(<SoneAlert>Hi</SoneAlert>);
    const alert = container.firstElementChild as HTMLElement;
    expect(alert.className).toBe("alert");
    expect(alert.dataset["slot"]).toBe("alert");
    expect(alert.dataset["variant"]).toBe("default");
    expect(container.querySelector("button")).toBeNull();
    expect(alert.hasAttribute("data-dismissible")).toBe(false);
  });

  it("calls onDismissed from a named close button", () => {
    const onDismissed = vi.fn();
    const { container } = render(
      <SoneAlert dismissible variant="info" onDismissed={onDismissed}>
        Hi
      </SoneAlert>,
    );
    const alert = container.firstElementChild as HTMLElement;
    expect(alert.getAttribute("data-dismissible")).toBe("");
    const close =
      container.querySelector<HTMLButtonElement>("button.alert-close")!;
    expect(close.className).toBe("btn alert-close");
    expect(close.getAttribute("aria-label")).toBe("Dismiss");
    expect(close.title).toBe("Dismiss");
    expect(close.dataset["slot"]).toBe("alert-close");
    expect(close.dataset["variant"]).toBe("ghost");
    expect(close.dataset["size"]).toBe("icon-xs");
    fireEvent.click(close);
    expect(onDismissed).toHaveBeenCalledTimes(1);
  });

  it("translates and overrides the close label", () => {
    render(
      <SoneMessagesProvider messages={{ dismiss: "Zamknij" }}>
        <SoneAlert dismissible>A</SoneAlert>
        <SoneAlert dismissible closeLabel="Hide">
          B
        </SoneAlert>
      </SoneMessagesProvider>,
    );
    expect(screen.getByRole("button", { name: "Zamknij" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Hide" })).toBeTruthy();
  });

  it("actionsAlign and the parts", () => {
    const { container } = render(
      <SoneAlert actionsAlign="center" as="section">
        <SoneAlertTitle>Title</SoneAlertTitle>
        <SoneAlertDescription>Body</SoneAlertDescription>
        <SoneAlertAction>Retry</SoneAlertAction>
      </SoneAlert>,
    );
    const alert = container.querySelector("section")!;
    expect(alert.dataset["actionsAlign"]).toBe("center");
    expect(
      alert.querySelector("p.alert-title[data-slot=alert-title]"),
    ).not.toBeNull();
    expect(
      alert.querySelector("p.alert-description[data-slot=alert-description]"),
    ).not.toBeNull();
    expect(
      alert.querySelector("div.alert-action[data-slot=alert-action]"),
    ).not.toBeNull();
    const plain = render(<SoneAlert />).container.firstElementChild!;
    expect(plain.hasAttribute("data-actions-align")).toBe(false);
  });
});

describe("SoneAvatar", () => {
  it("shows the placeholder glyph with neither image nor fallback", () => {
    const { container } = render(<SoneAvatar size="lg" />);
    const host = container.querySelector("sone-avatar")!;
    expect(host.getAttribute("class")).toBe("avatar");
    expect(host.getAttribute("data-size")).toBe("lg");
    expect(host.querySelector("[data-slot=avatar-placeholder]")).not.toBeNull();
  });

  it("shows the fallback until the image loads, then hides it", () => {
    const { container } = render(
      <SoneAvatar>
        <SoneAvatarImage src="/a.png" alt="Ada" />
        <SoneAvatarFallback>AL</SoneAvatarFallback>
      </SoneAvatar>,
    );
    const img = container.querySelector("img")!;
    expect(img.className).toBe("avatar-image");
    expect(img.dataset["slot"]).toBe("avatar-image");
    expect(img.alt).toBe("Ada");
    expect(
      container.querySelector("[data-slot=avatar-placeholder]"),
    ).toBeNull();
    expect(container.querySelector(".avatar-fallback")?.textContent).toBe("AL");
    fireEvent.load(img);
    expect(container.querySelector(".avatar-fallback")).toBeNull();
  });

  it("keeps the fallback when the image fails", () => {
    const { container } = render(
      <SoneAvatar>
        <SoneAvatarImage src="/missing.png" alt="" />
      </SoneAvatar>,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(
      container.querySelector("[data-slot=avatar-placeholder]"),
    ).not.toBeNull();
  });
});

describe("SoneBadge", () => {
  it("dashed variant and interactive flag", () => {
    const { container } = render(
      <SoneBadge variant="dashed" interactive>
        Local
      </SoneBadge>,
    );
    const badge = container.querySelector("span")!;
    expect(badge.className).toBe("badge");
    expect(badge.dataset["variant"]).toBe("dashed");
    expect(badge.getAttribute("data-interactive")).toBe("");
    expect(badge.hasAttribute("interactive")).toBe(false);
    const plain = render(<SoneBadge>x</SoneBadge>).container.firstElementChild!;
    expect(plain.hasAttribute("data-interactive")).toBe(false);
    expect(plain.getAttribute("data-variant")).toBe("default");
  });

  it("renders the same remove button as button[soneBadgeRemove]", () => {
    const { container } = render(
      <SoneBadge variant="secondary">
        design
        <SoneBadgeRemove aria-label="Remove design">
          <SoneIcon icon="close" />
        </SoneBadgeRemove>
      </SoneBadge>,
    );
    const b = container.querySelector("button")!;
    expect(b.className).toBe("badge-remove");
    expect(b.getAttribute("type")).toBe("button");
    expect(b.dataset["slot"]).toBe("badge-remove");
    expect(b.getAttribute("aria-label")).toBe("Remove design");
  });
});

describe("SoneBanner", () => {
  it("is a status by default, an alert for danger / warning, and marks floating", () => {
    const { container } = render(
      <>
        <SoneBanner>Saved</SoneBanner>
        <SoneBanner kind="danger" floating>
          Failed
        </SoneBanner>
      </>,
    );
    const [info, danger] = container.querySelectorAll("sone-banner");
    expect(info!.getAttribute("class")).toBe("alert");
    expect(info!.getAttribute("role")).toBe("status");
    expect(info!.getAttribute("data-variant")).toBe("info");
    expect(info!.hasAttribute("data-floating")).toBe(false);
    expect(info!.querySelector(".banner-body")?.textContent).toBe("Saved");
    expect(info!.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(danger!.getAttribute("role")).toBe("alert");
    expect(danger!.getAttribute("data-variant")).toBe("destructive");
    expect(danger!.getAttribute("data-floating")).toBe("");
  });
});

describe("SoneEmpty", () => {
  it("renders only its children when no composed prop is set", () => {
    const { container } = render(<SoneEmpty>Projected</SoneEmpty>);
    const el = container.firstElementChild!;
    expect(el.className).toBe("empty-state");
    expect(el.getAttribute("data-slot")).toBe("empty");
    expect(el.querySelector('[data-slot="empty-header"]')).toBeNull();
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.getAttribute("data-tone")).toBe("default");
    expect(el.textContent).toBe("Projected");
  });

  it("draws the header from props and keeps the children after it", () => {
    const { container } = render(
      <SoneEmpty tone="locked" title="Locked" description="Unlock it.">
        <button type="button">Unlock</button>
      </SoneEmpty>,
    );
    const el = container.firstElementChild!;
    expect(el.querySelector('sone-icon[data-icon="lock"]')).not.toBeNull();
    expect(el.querySelector(".empty-title")?.textContent).toBe("Locked");
    expect(el.querySelector(".empty")?.textContent).toBe("Unlock it.");
    expect(el.hasAttribute("title")).toBe(false);
    expect(el.lastElementChild?.tagName).toBe("BUTTON");
  });

  it("announces an error as an alert and loading as a status", () => {
    const error = render(<SoneEmpty tone="error" title="Failed" />).container
      .firstElementChild!;
    expect(error.getAttribute("role")).toBe("alert");
    expect(
      error.querySelector('sone-icon[data-icon="alert-circle"]'),
    ).not.toBeNull();
    const busy = render(<SoneEmpty icon="search" busy />).container
      .firstElementChild!;
    expect(busy.getAttribute("role")).toBe("status");
    expect(busy.getAttribute("data-tone")).toBe("loading");
    expect(busy.querySelector("sone-spinner")).not.toBeNull();
    expect(busy.querySelector("sone-icon")).toBeNull();
    expect(busy.querySelector(".sr-only")?.textContent).toBe("Loading");
  });

  it("composes the parts", () => {
    const { container } = render(
      <SoneEmpty>
        <SoneEmptyMedia variant="icon">i</SoneEmptyMedia>
        <SoneEmptyTitle>None</SoneEmptyTitle>
      </SoneEmpty>,
    );
    expect(
      container.querySelector(".empty-media")?.getAttribute("data-variant"),
    ).toBe("icon");
    expect(container.querySelector("h3.empty-title")?.textContent).toBe("None");
  });
});

describe("SoneItem", () => {
  it("renders the item parts with their data attributes", () => {
    const { container } = render(
      <SoneItemGroup size="sm">
        <SoneItem variant="outline" size="sm" as="a" href="/x">
          <SoneItemMedia variant="icon">i</SoneItemMedia>
          <SoneItemTitle>Title</SoneItemTitle>
        </SoneItem>
        <SoneItemSeparator />
      </SoneItemGroup>,
    );
    const group = screen.getByRole("list");
    expect(group.className).toBe("item-group");
    expect(group.dataset["size"]).toBe("sm");
    const item = container.querySelector("a.item")!;
    expect(item.getAttribute("data-variant")).toBe("outline");
    expect(item.getAttribute("data-size")).toBe("sm");
    expect(
      item.querySelector(".item-media")?.getAttribute("data-variant"),
    ).toBe("icon");
    const sep = container.querySelector("[data-slot=item-separator]")!;
    expect(sep.className).toBe("separator item-separator");
    expect(sep.getAttribute("role")).toBe("none");
    expect(sep.getAttribute("data-orientation")).toBe("horizontal");
  });
});

describe("SoneKbd", () => {
  it("wraps the keys in a <kbd> inside the host", () => {
    const { container } = render(
      <SoneKbdGroup>
        <SoneKbd>⌘</SoneKbd>
        <SoneKbd>K</SoneKbd>
      </SoneKbdGroup>,
    );
    const group = container.querySelector("sone-kbd-group")!;
    expect(group.getAttribute("data-slot")).toBe("kbd-group");
    expect(group.firstElementChild?.tagName).toBe("KBD");
    const keys = group.querySelectorAll("sone-kbd[data-slot=kbd] > kbd");
    expect([...keys].map((k) => k.textContent)).toEqual(["⌘", "K"]);
  });
});

describe("SonePageHeader", () => {
  it("renders a header with its parts", () => {
    const { container } = render(
      <SonePageHeader>
        <SonePageHeaderEyebrow>Settings</SonePageHeaderEyebrow>
        <SonePageHeaderTitle>Profile</SonePageHeaderTitle>
      </SonePageHeader>,
    );
    const header = container.querySelector("header.page-header")!;
    expect(header.getAttribute("data-slot")).toBe("page-header");
    expect(header.querySelector("p")?.className).toBe(
      "page-header-eyebrow section-label",
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Profile",
    );
  });
});

describe("SoneSeparator", () => {
  it("is decorative by default and semantic on request", () => {
    const { container } = render(
      <>
        <SoneSeparator />
        <SoneSeparator orientation="vertical" decorative={false} />
      </>,
    );
    const [a, b] = container.querySelectorAll(".separator");
    expect(a!.getAttribute("role")).toBe("none");
    expect(a!.getAttribute("data-orientation")).toBe("horizontal");
    expect(a!.hasAttribute("aria-orientation")).toBe(false);
    expect(b!.getAttribute("role")).toBe("separator");
    expect(b!.getAttribute("aria-orientation")).toBe("vertical");
    expect(b!.hasAttribute("decorative")).toBe(false);
  });
});

describe("SoneSkeleton", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<SoneSkeleton className="h-4" />);
    const el = container.firstElementChild!;
    expect(el.className).toBe("skeleton h-4");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("SoneSpinner", () => {
  it("is a named status by default, decorative with label null", () => {
    const { container } = render(
      <>
        <SoneSpinner size={24} />
        <SoneSpinner label={null} />
        <SoneSpinner label="Saving" />
      </>,
    );
    const [named, plain, custom] =
      container.querySelectorAll("sone-spinner svg");
    expect(named!.getAttribute("role")).toBe("status");
    expect(named!.getAttribute("aria-label")).toBe("Loading");
    expect((named as SVGElement).style.width).toBe("24px");
    expect(plain!.hasAttribute("role")).toBe(false);
    expect(plain!.getAttribute("aria-hidden")).toBe("true");
    expect(custom!.getAttribute("aria-label")).toBe("Saving");
  });
});

describe("SoneLogo", () => {
  it("loads the light and dark files from the asset base", () => {
    const { container } = render(
      <SoneLogoAssetsContext.Provider value="/assets/">
        <SoneLogo brand="ivy" kind="mark" size="lg" label="Ivy" />
      </SoneLogoAssetsContext.Provider>,
    );
    const host = container.querySelector("sone-logo")!;
    expect(host.getAttribute("class")).toBe("logo");
    expect(host.getAttribute("data-brand")).toBe("ivy");
    expect(host.getAttribute("data-kind")).toBe("mark");
    expect(host.getAttribute("data-size")).toBe("lg");
    const [light, dark] = host.querySelectorAll("img");
    expect(light!.getAttribute("src")).toBe("/assets/ivy-light-mark.svg");
    expect(dark!.getAttribute("src")).toBe("/assets/ivy-dark-mark.svg");
    expect(light!.className).toBe("logo-image logo-image-light");
    expect(light!.alt).toBe("Ivy");
    expect(light!.hasAttribute("aria-hidden")).toBe(false);
  });

  it("is decorative without a label and defaults to /brand/", () => {
    const { container } = render(<SoneLogo />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/brand/surface-one-light-icon.svg");
    expect(img.getAttribute("aria-hidden")).toBe("true");
    expect(img.getAttribute("alt")).toBe("");
  });
});

describe("SoneSectionHeading", () => {
  it("renders a real heading of the given level with a count and actions", () => {
    const { container } = render(
      <SoneSectionHeading
        title="Meetings"
        count={24}
        actions={<button type="button">New meeting</button>}
      />,
    );
    const host = container.querySelector("sone-section-heading")!;
    expect(host.getAttribute("data-level")).toBe("2");
    expect(host.hasAttribute("title")).toBe(false);
    expect(host.querySelector("h2.heading")?.textContent).toBe("Meetings24");
    expect(host.querySelector("h2 .count")?.getAttribute("data-variant")).toBe(
      "secondary",
    );
    expect(host.querySelector("h2 .count")?.className).toBe("badge count");
    expect(host.querySelector(".actions > button")?.textContent).toBe(
      "New meeting",
    );
    for (const level of [3, 4] as const) {
      const x = render(<SoneSectionHeading title="T" level={level} />);
      expect(x.container.querySelector(`h${level}`)).not.toBeNull();
    }
    const bad = render(<SoneSectionHeading title="T" level={6 as never} />);
    expect(bad.container.querySelector("h2")).not.toBeNull();
  });

  it("names the heading by its title alone; the count describes it", () => {
    const { container } = render(
      <>
        <SoneSectionHeading title="Meetings" count={12} />
        <SoneSectionHeading title="Pinned" level={3} />
      </>,
    );
    const text = (heading: Element, attr: string) =>
      (heading.getAttribute(attr) ?? "")
        .split(" ")
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .join(" ");
    const counted = container.querySelector("h2")!;
    expect(text(counted, "aria-labelledby")).toBe("Meetings");
    expect(text(counted, "aria-describedby")).toBe("12");
    const plain = container.querySelector("h3")!;
    expect(text(plain, "aria-labelledby")).toBe("Pinned");
    expect(plain.hasAttribute("aria-describedby")).toBe(false);
  });

  it("keeps the server's ids on hydration", async () => {
    const tree = <SoneSectionHeading title="Meetings" count={12} />;
    const el = document.createElement("div");
    el.innerHTML = renderToString(tree);
    document.body.append(el);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(el, tree);
    });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    const heading = el.querySelector("h2")!;
    const ref = (attr: string) =>
      el.querySelector(`[id="${heading.getAttribute(attr)}"]`)?.textContent;
    expect(ref("aria-labelledby")).toBe("Meetings");
    expect(ref("aria-describedby")).toBe("12");
  });
});

describe("SoneSpeakerChip", () => {
  function Switcher() {
    const [speaker, setSpeaker] = useState("others-1");
    return (
      <>
        <SoneSpeakerChip speaker={speaker} />
        <button type="button" onClick={() => setSpeaker("me")}>
          me
        </button>
      </>
    );
  }

  it("names a speaker key from the messages and follows a prop change", () => {
    const { container } = render(
      <SoneMessagesProvider
        messages={{ speakerMe: "Ja", speakerNumbered: (n) => `Mówca ${n}` }}
      >
        <Switcher />
      </SoneMessagesProvider>,
    );
    const chip = container.querySelector("sone-speaker-chip")!;
    expect(chip.querySelector(".speaker-chip-label")?.textContent).toBe(
      "Mówca 2",
    );
    expect(chip.querySelector(".avatar-fallback")?.textContent).toBe("M2");
    expect(chip.getAttribute("data-tone")).toBe("others");
    fireEvent.click(screen.getByRole("button", { name: "me" }));
    expect(chip.querySelector(".speaker-chip-label")?.textContent).toBe("Ja");
    expect(chip.getAttribute("data-tone")).toBe("me");
  });

  it("renders nothing inside without a name", () => {
    const { container } = render(<SoneSpeakerChip />);
    expect(
      container.querySelector("sone-speaker-chip")?.childElementCount,
    ).toBe(0);
  });
});

describe("SoneElapsedTimer", () => {
  it("is a timer only while live", () => {
    const { container } = render(
      <>
        <SoneElapsedTimer seconds={65} ariaLabel="ignored" />
        <SoneElapsedTimer seconds={724} live ariaLabel="Recording time" />
      </>,
    );
    const [still, live] = container.querySelectorAll("sone-elapsed-timer");
    expect(still!.hasAttribute("role")).toBe(false);
    expect(still!.hasAttribute("aria-label")).toBe(false);
    expect(still!.querySelector("time")?.textContent).toBe("1:05");
    expect(live!.getAttribute("role")).toBe("timer");
    expect(live!.getAttribute("aria-label")).toBe("Recording time");
  });
});

describe("SoneLoadMore", () => {
  function Paged({ onLoad }: { onLoad: () => void }) {
    const [remaining, setRemaining] = useState(12);
    return (
      <>
        <SoneLoadMore remaining={remaining} onLoad={onLoad} />
        <button type="button" onClick={() => setRemaining(0)}>
          end
        </button>
      </>
    );
  }

  it("adds the remaining count, calls onLoad and hides at 0", () => {
    const onLoad = vi.fn();
    const { container } = render(<Paged onLoad={onLoad} />);
    const host = container.querySelector("sone-load-more")!;
    const button = host.querySelector("button")!;
    expect(button.textContent).toBe("Show more (12)");
    expect(button.className).toBe("btn button");
    expect(host.hasAttribute("hidden")).toBe(false);
    fireEvent.click(button);
    expect(onLoad).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "end" }));
    expect(host.hasAttribute("hidden")).toBe(true);
  });

  it("busy: aria-disabled with a spinner, no load", () => {
    const onLoad = vi.fn();
    const { container } = render(
      <SoneLoadMore busy remaining={0} onLoad={onLoad} />,
    );
    const host = container.querySelector("sone-load-more")!;
    const button = host.querySelector("button")!;
    expect(host.hasAttribute("hidden")).toBe(false);
    expect(host.getAttribute("data-state")).toBe("loading");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.textContent).toBe("Loading…");
    expect(
      button.querySelector("sone-spinner")?.getAttribute("data-icon"),
    ).toBe("inline-start");
    fireEvent.click(button);
    expect(onLoad).not.toHaveBeenCalled();
  });

  it("error: an alert above a retry button", () => {
    const onLoad = vi.fn();
    const { container } = render(
      <SoneLoadMore
        error="Could not load."
        remaining={0}
        align="start"
        onLoad={onLoad}
      />,
    );
    const host = container.querySelector("sone-load-more")!;
    expect(host.hasAttribute("hidden")).toBe(false);
    expect(host.getAttribute("data-align")).toBe("start");
    expect(host.getAttribute("data-state")).toBe("error");
    expect(screen.getByRole("alert").textContent).toBe("Could not load.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });
});

describe("server rendering", () => {
  it("renders the same markup the Angular components do", () => {
    const html = renderToString(
      <>
        <SoneAlert variant="warning">A</SoneAlert>
        <SoneAvatar>
          <SoneAvatarFallback>LU</SoneAvatarFallback>
        </SoneAvatar>
        <SoneBadge variant="live" dot>
          Recording
        </SoneBadge>
        <SoneBanner kind="success">Saved</SoneBanner>
        <SoneEmpty title="Empty" />
        <SoneItem>i</SoneItem>
        <SoneKbd>K</SoneKbd>
        <SonePageHeader>p</SonePageHeader>
        <SoneSeparator />
        <SoneSkeleton />
        <SoneSpinner />
        <SoneLogo />
        <SoneSectionHeading title="Section" />
        <SoneElapsedTimer seconds={3727} />
        <SoneElapsedTimer
          seconds={724}
          live
          size="sm"
          ariaLabel="Recording time"
        />
        <SoneSpeakerChip speaker="others-0" />
        <SoneSpeakerChip speaker="me" label="Ada Park" size="sm" />
        <SoneSpeakerChip speaker="Anna" />
        <SoneLoadMore remaining={3} />
      </>,
    );
    expect(html).toContain(
      '<div data-slot="alert" data-variant="warning" class="alert">A</div>',
    );
    // A fallback means no placeholder glyph.
    expect(html).toContain(
      '<sone-avatar data-slot="avatar" data-size="default" class="avatar"><span data-slot="avatar-fallback" class="avatar-fallback">LU</span></sone-avatar>',
    );
    expect(html).not.toContain("avatar-placeholder");
    expect(html).toContain(
      '<span data-slot="badge" data-variant="live" data-dot="" class="badge">Recording</span>',
    );
    expect(html).toMatch(
      /<sone-banner data-slot="alert" data-variant="success" role="status" class="alert"><svg/,
    );
    expect(html).toMatch(
      /<div data-slot="empty" data-tone="default" class="empty-state">/,
    );
    expect(html).toContain(
      '<div data-slot="item" data-variant="default" data-size="default" class="item">i</div>',
    );
    expect(html).toContain('<sone-kbd data-slot="kbd"><kbd>K</kbd></sone-kbd>');
    expect(html).toContain(
      '<header data-slot="page-header" class="page-header">p</header>',
    );
    expect(html).toContain(
      '<div data-slot="separator" data-orientation="horizontal" role="none" class="separator"></div>',
    );
    expect(html).toContain(
      '<div data-slot="skeleton" aria-hidden="true" class="skeleton"></div>',
    );
    expect(html).toMatch(
      /<sone-spinner data-slot="spinner"><svg class="spinner-glyph"[^>]*role="status" aria-label="Loading"/,
    );
    expect(html).toMatch(
      /<sone-logo data-slot="logo" data-size="default" data-brand="surface-one" data-kind="tile" class="logo"><img class="logo-image logo-image-light" src="\/brand\/surface-one-light-icon.svg"/,
    );
    expect(html).toMatch(
      /<sone-section-heading data-slot="section-heading" data-level="2"><h2 class="heading" aria-labelledby="[^"]+-title">/,
    );
    // HTML attribute names are case-insensitive; React prints `dateTime`.
    expect(html.replaceAll("dateTime=", "datetime=")).toContain(
      '<sone-elapsed-timer data-slot="elapsed-timer" data-size="default"><time datetime="PT1H2M7S">1:02:07</time></sone-elapsed-timer>',
    );
    expect(html.replaceAll("dateTime=", "datetime=")).toContain(
      '<sone-elapsed-timer data-slot="elapsed-timer" data-size="sm" role="timer" aria-label="Recording time"><time datetime="PT12M4S">12:04</time></sone-elapsed-timer>',
    );
    expect(html).toMatch(
      /<sone-speaker-chip data-slot="speaker-chip" data-tone="others" data-size="default"><sone-avatar[^>]*class="avatar speaker-chip-avatar"[^>]*><span data-slot="avatar-fallback" class="avatar-fallback">S1<\/span><\/sone-avatar><span class="speaker-chip-label" data-slot="speaker-chip-label">Speaker 1<\/span>/,
    );
    expect(html).toContain(">AP</span>");
    expect(html).toContain(">Ada Park</span>");
    // An unknown key is shown as it is, with no tone.
    expect(html).toContain(
      '<sone-speaker-chip data-slot="speaker-chip" data-size="default">',
    );
    expect(html).toContain(">Anna</span>");
    expect(html).toMatch(
      /<sone-load-more data-slot="load-more" data-align="center" data-state="idle"><button data-slot="button" data-variant="ghost" data-size="sm"[^>]*class="btn button"[^>]*>Show more \(3\)<\/button><\/sone-load-more>/,
    );
  });
});
