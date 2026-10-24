import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { SoneAvatar, SoneAvatarFallback } from "../src/components/avatar";
import {
  SoneBubble,
  SoneBubbleContent,
  SoneBubbleGroup,
} from "../src/components/bubble";
import {
  SoneMarker,
  SoneMarkerContent,
  SoneMarkerIcon,
} from "../src/components/marker";
import {
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageFooter,
  SoneMessageGroup,
  SoneMessageHeader,
} from "../src/components/message";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

describe("SoneMessage, SoneBubble and SoneMarker", () => {
  it("render the Angular message parts", () => {
    expect(
      html(
        <SoneMessageGroup>
          <SoneMessage align="end">
            <SoneMessageAvatar as={SoneAvatar} size="sm">
              <SoneAvatarFallback>LR</SoneAvatarFallback>
            </SoneMessageAvatar>
            <SoneMessageContent>
              <SoneMessageHeader>Leo</SoneMessageHeader>
              <SoneMessageFooter>Read</SoneMessageFooter>
            </SoneMessageContent>
          </SoneMessage>
        </SoneMessageGroup>,
      ),
    ).toBe(
      '<div data-slot="message-group"><div data-slot="message" data-align="end">' +
        '<sone-avatar data-slot="message-avatar" data-size="sm" class="avatar">' +
        '<span data-slot="avatar-fallback" class="avatar-fallback">LR</span></sone-avatar>' +
        '<div data-slot="message-content"><div data-slot="message-header">Leo</div>' +
        '<div data-slot="message-footer">Read</div></div></div></div>',
    );
  });

  it("render the bubble variants and alignment", () => {
    expect(
      html(
        <SoneBubbleGroup>
          <SoneBubble>
            <SoneBubbleContent>Hi</SoneBubbleContent>
          </SoneBubble>
          <SoneBubble variant="tinted" align="end" />
        </SoneBubbleGroup>,
      ),
    ).toBe(
      '<div data-slot="bubble-group">' +
        '<div data-slot="bubble" data-variant="default" data-align="start">' +
        '<div data-slot="bubble-content">Hi</div></div>' +
        '<div data-slot="bubble" data-variant="tinted" data-align="end"></div></div>',
    );
  });

  it("render the marker with a decorative icon", () => {
    expect(
      html(
        <SoneMarker variant="separator">
          <SoneMarkerIcon>✓</SoneMarkerIcon>
          <SoneMarkerContent>Compacted</SoneMarkerContent>
        </SoneMarker>,
      ),
    ).toBe(
      '<div data-slot="marker" data-variant="separator">' +
        '<span data-slot="marker-icon" aria-hidden="true">✓</span>' +
        '<span data-slot="marker-content">Compacted</span></div>',
    );
  });
});
