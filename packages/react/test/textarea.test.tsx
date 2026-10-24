import { fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SoneTextarea } from "../src/components/textarea";

const BOX = {
  lineHeight: "20px",
  padding: "8px 0",
  border: "1px solid",
  boxSizing: "border-box",
} as const;

afterEach(() => vi.restoreAllMocks());

describe("SoneTextarea", () => {
  it("renders the native textarea and the counter like Angular", () => {
    const out = renderToString(
      <SoneTextarea
        id="bio"
        defaultValue="Hello"
        maxLength={20}
        autosize
        invalid
        showCount
      />,
    );
    expect(out).toContain('data-slot="textarea"');
    expect(out).toContain('data-autosize=""');
    expect(out).toContain('maxLength="20"');
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain(
      '<sone-textarea-count class="textarea-count" data-slot="textarea-count" data-state="default"><span aria-hidden="true">5/20</span><span class="sr-only" aria-live="polite"></span></sone-textarea-count>',
    );
  });

  it("is controlled or not, autosizes and speaks the characters left near the limit", () => {
    let content = 36;
    vi.spyOn(
      HTMLTextAreaElement.prototype,
      "scrollHeight",
      "get",
    ).mockImplementation(() => content);
    const onValueChange = vi.fn();
    const { container } = render(
      <SoneTextarea
        autosize
        minRows={2}
        maxRows={4}
        maxLength={20}
        showCount
        style={BOX}
        onValueChange={onValueChange}
      />,
    );
    const ta = container.querySelector("textarea")!;
    expect(ta.style.height).toBe("58px");
    content = 200;
    fireEvent.change(ta, { target: { value: "x".repeat(19) } });
    expect(onValueChange).toHaveBeenLastCalledWith("x".repeat(19));
    expect(ta.style.height).toBe("98px");
    expect(ta.style.overflowY).toBe("auto");
    expect(container.querySelector('[aria-live="polite"]')!.textContent).toBe(
      "1 character left",
    );
    expect(
      container
        .querySelector("sone-textarea-count")!
        .getAttribute("data-state"),
    ).toBe("near");
  });
});
