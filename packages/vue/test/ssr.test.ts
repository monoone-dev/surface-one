// @vitest-environment node
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import * as pkg from "../src/index";

const {
  SurfaceOne,
  SoneAvatar,
  SoneAvatarFallback,
  SoneButton,
  SoneCard,
  SoneCardTitle,
  SoneChoiceCard,
  SoneChoiceCardIndicator,
  SoneChoiceGroup,
  SoneDialog,
  SoneDialogTitle,
  SoneIcon,
  SoneSwitch,
  SoneTable,
} = pkg;

describe("server rendering (Nuxt SSR / prerender)", () => {
  it("renders every component without touching window or document", async () => {
    expect(typeof document).toBe("undefined");
    const all = pkg as unknown as Record<string, unknown>;
    const required: Record<string, Record<string, unknown>> = {
      SoneCollapsibleSection: { title: "Section" },
      SoneDockItem: { label: "Undo" },
      SoneFilterChips: { options: [{ value: "a", label: "A" }] },
      SoneIcon: { icon: "check" },
      SoneSectionHeading: { title: "Section" },
      SoneSegmented: { options: [{ value: "a", label: "A" }] },
      SoneTable: { rows: [], columns: [] },
    };
    // Parts that only work inside their root (as in Angular) throw a clear error alone.
    const needsParent = new Set([
      "SoneCollapsibleContent",
      "SoneFlowControls",
      "SoneFlowMinimap",
    ]);
    for (const name of pkg.SONE_COMPONENT_NAMES) {
      if (needsParent.has(name)) continue;
      const app = createSSRApp({
        render: () => h(all[name] as never, required[name] ?? {}, () => "x"),
      });
      app.use(SurfaceOne);
      await expect(renderToString(app), name).resolves.toBeTypeOf("string");
    }
  });

  it("renders the same markup the Angular components do", async () => {
    const app = createSSRApp({
      render: () => [
        h(SoneButton, { variant: "outline", size: "sm" }, () => "Go"),
        h(SoneButton, { as: "a", href: "/x" }, () => "Link"),
        h(SoneCard, null, () => h(SoneCardTitle, null, () => "Title")),
        h(SoneIcon, { icon: "check", label: "Done" }),
        h(SoneSwitch, { modelValue: true, ariaLabel: "On" }),
        h(SoneAvatar, null, () => h(SoneAvatarFallback, null, () => "LU")),
        h(SoneChoiceGroup, null, () => [
          h(SoneChoiceCard, { selected: true }, () =>
            h(SoneChoiceCardIndicator),
          ),
          h(SoneChoiceCard, null, () => "B"),
        ]),
        h(SoneTable, {
          rows: [{ id: 1, name: "Ada" }],
          columns: [{ key: "name", header: "Name" }],
        }),
      ],
    });
    const html = await renderToString(app);
    expect(html).toContain(
      '<button class="btn" data-slot="button" data-variant="outline" data-size="sm">Go</button>',
    );
    expect(html).toContain(
      '<a class="btn" data-slot="button" data-variant="default" data-size="default" href="/x">Link</a>',
    );
    expect(html).toContain(
      '<div class="card" data-slot="card" data-size="default"><h3 class="card-title" data-slot="card-title">Title</h3></div>',
    );
    expect(html).toMatch(
      /<sone-icon data-slot="icon" data-icon="check"><span class="nav-icon" role="img" aria-label="Done"><svg/,
    );
    expect(html).toMatch(
      /<sone-switch><input class="switch" type="checkbox" data-slot="switch" checked data-size="default" data-state="checked" aria-label="On">/,
    );
    // A fallback means no placeholder glyph.
    expect(html).not.toContain("avatar-placeholder");
    // The checked card is the group's one Tab stop.
    expect(html).toMatch(
      /role="radio" data-state="checked"[^>]*aria-checked="true" tabindex="0"/,
    );
    expect(html).toMatch(
      /role="radio" data-state="unchecked"[^>]*aria-checked="false" tabindex="-1"/,
    );
    expect(html).toContain('<td data-slot="table-cell">Ada</td>');
    expect(html).toContain("data-with-indicator aria-checked");
  });

  it("renders the recording twins: elapsed timer, speaker chip and badge dot", async () => {
    const { SoneBadge, SoneElapsedTimer, SoneSpeakerChip } = pkg;
    const app = createSSRApp({
      render: () => [
        h(SoneElapsedTimer, { seconds: 3727 }),
        h(SoneElapsedTimer, {
          seconds: 724,
          live: true,
          size: "sm",
          ariaLabel: "Recording time",
        }),
        h(SoneSpeakerChip, { speaker: "others-0" }),
        h(SoneSpeakerChip, { speaker: "me", label: "Ada Park", size: "sm" }),
        h(SoneSpeakerChip, { speaker: "Anna" }),
        h(SoneBadge, { variant: "live", dot: true }, () => "Recording"),
      ],
    });
    app.use(SurfaceOne);
    const html = await renderToString(app);
    expect(html).toContain(
      '<sone-elapsed-timer data-slot="elapsed-timer" data-size="default"><time datetime="PT1H2M7S">1:02:07</time></sone-elapsed-timer>',
    );
    expect(html).toContain(
      '<sone-elapsed-timer data-slot="elapsed-timer" data-size="sm" role="timer" aria-label="Recording time"><time datetime="PT12M4S">12:04</time></sone-elapsed-timer>',
    );
    expect(html).toMatch(
      /<sone-speaker-chip data-slot="speaker-chip" data-tone="others" data-size="default"><sone-avatar class="avatar speaker-chip-avatar"[^>]*data-tone="others"[^>]*><span class="avatar-fallback" data-slot="avatar-fallback">S1<\/span>(<!---->)?<\/sone-avatar><span class="speaker-chip-label" data-slot="speaker-chip-label">Speaker 1<\/span>/,
    );
    expect(html).toContain(">AP</span>");
    expect(html).toContain(">Ada Park</span>");
    // An unknown key is shown as it is, with no tone.
    expect(html).toContain(
      '<sone-speaker-chip data-slot="speaker-chip" data-size="default">',
    );
    expect(html).toContain(">Anna</span>");
    expect(html).toContain(
      '<span class="badge" data-slot="badge" data-variant="live" data-dot>Recording</span>',
    );
  });

  it("makes a later checked choice card the only Tab stop", async () => {
    const app = createSSRApp({
      render: () =>
        h(SoneChoiceGroup, null, () =>
          ["a", "b", "c"].map((p) =>
            h(SoneChoiceCard, { key: p, selected: p === "b" }, () => p),
          ),
        ),
    });
    const html = await renderToString(app);
    expect([...html.matchAll(/tabindex="(-?\d)"/g)].map((m) => m[1])).toEqual([
      "-1",
      "0",
      "-1",
    ]);
  });

  it("teleports an open dialog and names it by its title", async () => {
    const app = createSSRApp({
      render: () =>
        h(SoneDialog, null, () => h(SoneDialogTitle, null, () => "Hello")),
    });
    const ctx: { teleports?: Record<string, string> } = {};
    const html = await renderToString(app, ctx);
    expect(html).not.toContain("sone-dialog");
    expect(ctx.teleports?.["body"]).toMatch(
      /<sone-dialog class="dialog-overlay" data-slot="dialog-overlay">/,
    );
    expect(ctx.teleports?.["body"]).toContain('role="dialog"');
  });
});
