import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBubble,
  SoneBubbleContent,
  SoneBubbleGroup,
  SoneMarker,
  SoneMarkerContent,
  SoneMarkerIcon,
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageFooter,
  SoneMessageGroup,
  SoneMessageHeader,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const ssr = (render: () => unknown): Promise<string> =>
  renderToString(createSSRApp({ render }));

describe("SoneMessage, SoneBubble and SoneMarker", () => {
  it("render the Angular message parts", async () => {
    const out = await ssr(() =>
      h(SoneMessageGroup, null, () =>
        h(SoneMessage, { align: "end" }, () => [
          h(SoneMessageAvatar, { as: SoneAvatar, size: "sm" }, () =>
            h(SoneAvatarFallback, null, () => "LR"),
          ),
          h(SoneMessageContent, null, () => [
            h(SoneMessageHeader, null, () => "Leo"),
            h(SoneMessageFooter, null, () => "Read"),
          ]),
        ]),
      ),
    );
    expect(out).toBe(
      '<div data-slot="message-group"><div data-slot="message" data-align="end">' +
        '<sone-avatar class="avatar" data-slot="message-avatar" data-size="sm">' +
        '<span class="avatar-fallback" data-slot="avatar-fallback">LR</span><!----></sone-avatar>' +
        '<div data-slot="message-content"><div data-slot="message-header">Leo</div>' +
        '<div data-slot="message-footer">Read</div></div></div></div>',
    );
  });

  it("render the bubble variants and alignment", async () => {
    expect(
      await ssr(() =>
        h(SoneBubbleGroup, null, () => [
          h(SoneBubble, null, () => h(SoneBubbleContent, null, () => "Hi")),
          h(SoneBubble, { variant: "tinted", align: "end" }),
        ]),
      ),
    ).toBe(
      '<div data-slot="bubble-group">' +
        '<div data-slot="bubble" data-variant="default" data-align="start">' +
        '<div data-slot="bubble-content">Hi</div></div>' +
        '<div data-slot="bubble" data-variant="tinted" data-align="end"></div></div>',
    );
  });

  it("render the marker with a decorative icon", async () => {
    expect(
      await ssr(() =>
        h(SoneMarker, { variant: "separator" }, () => [
          h(SoneMarkerIcon, null, () => "✓"),
          h(SoneMarkerContent, null, () => "Compacted"),
        ]),
      ),
    ).toBe(
      '<div data-slot="marker" data-variant="separator">' +
        '<span data-slot="marker-icon" aria-hidden="true">✓</span>' +
        '<span data-slot="marker-content">Compacted</span></div>',
    );
  });
});
