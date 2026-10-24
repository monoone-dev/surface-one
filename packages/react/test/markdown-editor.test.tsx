import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneMarkdownEditor,
  SoneMarkdownEditorFooter,
  SoneMarkdownEditorTools,
  type MarkdownToolbarCommandEvent,
  type SoneMarkdownEditorHandle,
} from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

describe("SoneMarkdownEditor", () => {
  it("renders the header, the tabs, the toolbar and the textarea", () => {
    const out = html(
      <SoneMarkdownEditor
        defaultValue="Hi"
        ariaLabel="Note"
        placeholder="Write…"
        minRows={5}
      />,
    );
    const id = /id="(sone-md-editor-[^"]+)-area"/.exec(out)![1];
    expect(out).toMatch(
      /^<sone-markdown-editor data-slot="markdown-editor" data-mode="edit" data-appearance="field" data-toolbar-placement="top" class="markdown-editor" style="--markdown-editor-rows:5">/,
    );
    expect(out).toContain(
      `<button data-slot="tabs-trigger" data-state="active" aria-selected="true" tabindex="0" role="tab" type="button" id="${id}-tab-edit" aria-controls="${id}-edit" class="tabs-trigger">Write</button>`,
    );
    expect(out).toContain(
      `<div class="markdown-editor-toolbar" role="toolbar" aria-label="Formatting" aria-controls="${id}-area">`,
    );
    expect(out).toContain(
      '<button data-slot="button" data-variant="ghost" data-size="icon-sm" type="button" aria-label="Bold" aria-keyshortcuts="Control+B" class="btn">',
    );
    expect(out).toContain(
      '<span data-slot="separator" data-orientation="vertical" role="none" class="separator markdown-editor-sep"></span>',
    );
    expect(out).toContain(
      `<div class="markdown-editor-pane markdown-editor-write" id="${id}-edit" role="tabpanel" aria-labelledby="${id}-tab-edit">` +
        '<div class="markdown-editor-grow" data-value="Hi">' +
        `<textarea id="${id}-area" class="markdown-editor-area" aria-label="Note" placeholder="Write…" spellcheck="true" autocapitalize="sentences" autocomplete="off" rows="5">Hi</textarea>`,
    );
  });

  it("applies toolbar commands and shortcuts, unless the event is prevented", () => {
    const onValueChange = vi.fn();
    const onToolbarCommand = vi.fn();
    const { container, rerender } = render(
      <SoneMarkdownEditor
        defaultValue="make bold"
        onValueChange={onValueChange}
        onToolbarCommand={onToolbarCommand}
      />,
    );
    const area = container.querySelector("textarea")!;
    area.setSelectionRange(5, 9);
    fireEvent.click(container.querySelector('button[aria-label="Bold"]')!);
    expect(onValueChange).toHaveBeenLastCalledWith("make **bold**");
    expect(area.value).toBe("make **bold**");
    expect([area.selectionStart, area.selectionEnd]).toEqual([7, 11]);
    expect(
      (onToolbarCommand.mock.calls[0]![0] as MarkdownToolbarCommandEvent)
        .command,
    ).toBe("bold");

    rerender(
      <SoneMarkdownEditor
        defaultValue="make bold"
        onValueChange={onValueChange}
        onToolbarCommand={(e) => e.preventDefault()}
      />,
    );
    fireEvent.click(container.querySelector('button[aria-label="Italic"]')!);
    expect(area.value).toBe("make **bold**");

    area.setSelectionRange(0, 4);
    fireEvent.keyDown(area, { key: "i", ctrlKey: true });
    expect(area.value).toBe("_make_ **bold**");
  });

  it("continues lists on Enter and pastes HTML as markdown", () => {
    const onEditorPaste = vi.fn();
    const { container } = render(
      <SoneMarkdownEditor defaultValue="- one" onEditorPaste={onEditorPaste} />,
    );
    const area = container.querySelector("textarea")!;
    area.setSelectionRange(5, 5);
    fireEvent.keyDown(area, { key: "Enter" });
    expect(area.value).toBe("- one\n- ");
    const data = new Map([
      ["text/html", "<p><strong>Hi</strong> there</p>"],
      ["text/plain", "Hi there"],
    ]);
    fireEvent.paste(area, {
      clipboardData: { getData: (type: string) => data.get(type) ?? "" },
    });
    expect(area.value).toBe("- one\n- **Hi** there");
    expect(onEditorPaste).toHaveBeenCalledTimes(1);
  });

  it("switches to the preview, with the mode pair and a custom preview", () => {
    const onModeChange = vi.fn();
    const { container, rerender } = render(
      <SoneMarkdownEditor defaultValue="# Title" onModeChange={onModeChange} />,
    );
    fireEvent.click(container.querySelectorAll('[role="tab"]')[1]!);
    expect(onModeChange).toHaveBeenCalledWith("preview");
    const host = container.querySelector("sone-markdown-editor")!;
    expect(host.getAttribute("data-mode")).toBe("preview");
    expect(container.querySelector("textarea")).toBeNull();
    expect(
      container.querySelector(".markdown-editor-preview sone-markdown h1")!
        .textContent,
    ).toBe("Title");
    expect(
      container.querySelector<HTMLButtonElement>('button[aria-label="Bold"]')!
        .disabled,
    ).toBe(true);
    rerender(<SoneMarkdownEditor value="  " mode="preview" />);
    expect(container.querySelector(".markdown-editor-empty")!.textContent).toBe(
      "Nothing to preview",
    );

    rerender(
      <SoneMarkdownEditor
        value="x"
        mode="split"
        toolbar="none"
        renderPreview={(source) => <i>{source}</i>}
      />,
    );
    expect(container.querySelector(".markdown-editor-header")).toBeNull();
    expect(container.querySelector("textarea")).not.toBeNull();
    expect(
      container.querySelector(".markdown-editor-preview i")!.textContent,
    ).toBe("x");
    expect(
      container.querySelector(".markdown-editor-write")!.getAttribute("role"),
    ).toBeNull();
  });

  it("lays out the document and minimal toolbars, the tools and the footer", () => {
    const { container, rerender } = render(
      <SoneMarkdownEditor
        toolbar="document"
        tabs={false}
        tools={<SoneMarkdownEditorTools>tools</SoneMarkdownEditorTools>}
        footer={<SoneMarkdownEditorFooter>footer</SoneMarkdownEditorFooter>}
      />,
    );
    const menu = container.querySelector("sone-row-menu")!;
    expect(menu.getAttribute("class")).toBe(
      "is-prominent markdown-editor-menu",
    );
    expect(menu.querySelector("button")!.getAttribute("aria-label")).toBe(
      "Headings",
    );
    expect(menu.querySelector(".markdown-editor-menu-glyph")).not.toBeNull();
    expect(
      Array.from(
        container.querySelectorAll(".markdown-editor-toolbar > button"),
      ).map((b) => b.getAttribute("aria-label")),
    ).toEqual([
      "New section",
      "Bold",
      "Italic",
      "Strikethrough",
      "Inline code",
      "Bulleted list",
      "Numbered list",
      "Task list",
      "Quote",
      "Decrease indent",
      "Increase indent",
      "Link",
      "Wikilink",
    ]);
    expect(container.querySelectorAll(".markdown-editor-sep")).toHaveLength(4);
    expect(container.querySelector(".markdown-editor-tools")!.textContent).toBe(
      "tools",
    );
    expect(
      container.querySelector(".markdown-editor-write .markdown-editor-footer")!
        .textContent,
    ).toBe("footer");
    expect(container.querySelector('[role="tablist"]')).toBeNull();

    rerender(<SoneMarkdownEditor toolbar="minimal" />);
    expect(
      Array.from(container.querySelectorAll('[role="toolbar"] button')).map(
        (b) => b.getAttribute("aria-label"),
      ),
    ).toEqual(["Bold", "Italic", "Link", "Bulleted list", "Task list"]);
  });

  it("exposes the editing methods and reports the selection", () => {
    const onSelectionChange = vi.fn();
    const handle = createRef<SoneMarkdownEditorHandle>();
    const { container } = render(
      <SoneMarkdownEditor
        defaultValue="Hello world"
        onSelectionChange={onSelectionChange}
        handleRef={handle}
      />,
    );
    const area = container.querySelector("textarea")!;
    const editor = handle.current!;
    expect(editor.textarea).toBe(area);
    act(() => editor.setSelection(6, 11));
    expect(onSelectionChange).toHaveBeenLastCalledWith({ start: 6, end: 11 });
    act(() => editor.wrapSelection("[", "](url)"));
    expect(area.value).toBe("Hello [world](url)");
    act(() => {
      editor.setSelection(0);
      editor.insertText("> ");
    });
    expect(area.value).toBe("> Hello [world](url)");
    act(() => editor.applyCommand("heading"));
    expect(area.value).toBe("## > Hello [world](url)");
  });

  it("is disabled while busy and marks the invalid and frameless states", () => {
    const { container } = render(
      <SoneMarkdownEditor busy invalid focusFrame={false} stickyToolbar />,
    );
    const host = container.querySelector("sone-markdown-editor")!;
    expect(host.getAttribute("data-disabled")).toBe("");
    expect(host.getAttribute("data-invalid")).toBe("");
    expect(host.getAttribute("data-focus-frame")).toBe("off");
    expect(host.getAttribute("data-sticky-toolbar")).toBe("");
    const area = container.querySelector("textarea")!;
    expect(area.disabled).toBe(true);
    expect(area.getAttribute("aria-invalid")).toBe("true");
    expect(
      Array.from(
        container.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
      ).every((t) => t.disabled),
    ).toBe(true);
  });

  it("docks the toolbar to the bottom of the view", () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        disconnect = vi.fn();
      },
    );
    const { container, unmount } = render(
      <SoneMarkdownEditor toolbarPlacement="dock" />,
    );
    const host = container.querySelector<HTMLElement>("sone-markdown-editor")!;
    expect(host.getAttribute("data-toolbar-placement")).toBe("dock");
    expect(observe).toHaveBeenCalled();
    window.dispatchEvent(new Event("resize"));
    expect(host.style.getPropertyValue("--markdown-editor-dock-h")).toBe("0px");
    unmount();
    vi.unstubAllGlobals();
  });

  it("renders the live host on the server and mounts CodeMirror in the browser", async () => {
    const out = html(<SoneMarkdownEditor defaultValue="# Live" live />);
    expect(out).toContain(
      '<div class="markdown-editor-live" data-slot="markdown-editor-live"></div>',
    );
    expect(out).not.toContain("<textarea");

    const onValueChange = vi.fn();
    const handle = createRef<SoneMarkdownEditorHandle>();
    const { container, rerender } = render(
      <SoneMarkdownEditor
        value="# Live"
        onValueChange={onValueChange}
        live
        ariaLabel="Live note"
        handleRef={handle}
      />,
    );
    await waitFor(() =>
      expect(
        container.querySelector(".markdown-editor-live .cm-editor"),
      ).not.toBeNull(),
    );
    const content = container.querySelector(".cm-content")!;
    expect(content.classList.contains("markdown-editor-area")).toBe(true);
    expect(content.getAttribute("aria-label")).toBe("Live note");
    expect(handle.current!.textarea?.value).toBe("# Live");
    rerender(
      <SoneMarkdownEditor
        value="Other"
        onValueChange={onValueChange}
        live
        ariaLabel="Live note"
        handleRef={handle}
      />,
    );
    expect(handle.current!.textarea?.value).toBe("Other");
    act(() => {
      handle.current!.setSelection(0, 5);
      handle.current!.applyCommand("bold");
    });
    expect(onValueChange).toHaveBeenLastCalledWith("**Other**");
  });
});
