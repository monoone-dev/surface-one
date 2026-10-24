import { flushPromises, mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it, vi } from "vitest";

import {
  SoneMarkdown,
  SoneMarkdownEditor,
  SoneMarkdownEditorFooter,
  SoneMarkdownEditorTools,
  SurfaceOne,
  type MarkdownToolbarCommandEvent,
  type SoneMarkdownEditorExposed,
} from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const area = (w: ReturnType<typeof mount>) =>
  w.find("textarea").element as HTMLTextAreaElement;

describe("SoneMarkdown", () => {
  it("renders the empty host on the server and the blocks once mounted", async () => {
    expect(await ssr(() => h(SoneMarkdown, { source: "# Hello" }))).toBe(
      '<sone-markdown class="markdown" data-slot="markdown" data-size="default"></sone-markdown>',
    );
    const w = mount(SoneMarkdown, {
      props: { source: "# Skill\n\n- one\n- two", size: "sm" },
    });
    await nextTick();
    expect(w.attributes("data-size")).toBe("sm");
    expect(w.findAll(":scope > .markdown-block")).toHaveLength(2);
    expect(w.find("h1").text()).toBe("Skill");
    await w.setProps({ source: null });
    expect(w.findAll(".markdown-block")).toHaveLength(0);
  });

  it("escapes raw HTML, keeps only inline images and translates its strings", async () => {
    const w = mount(SoneMarkdown, {
      props: {
        source:
          '<b onclick="x()">bold</b>\n\n- [x] Done\n\n![Chart](https://example.com/c.png)',
      },
      global: {
        plugins: [
          [
            SurfaceOne,
            {
              messages: {
                markdownTask: "Zadanie",
                markdownImageBlocked: (alt: string) => `${alt} — brak obrazu`,
              },
            },
          ],
        ],
      },
    });
    await nextTick();
    expect(w.find("b").exists()).toBe(false);
    expect(w.text()).toContain('<b onclick="x()">bold</b>');
    expect(w.find(".markdown-task-box").attributes("aria-label")).toBe(
      "Zadanie",
    );
    expect(w.find("img").exists()).toBe(false);
    expect(w.find(".markdown-image-blocked").text()).toBe(
      "Chart — brak obrazu",
    );
    await w.setProps({ breaks: false, source: "a\nb" });
    expect(w.find("p br").exists()).toBe(false);
  });
});

describe("SoneMarkdownEditor", () => {
  it("renders the header, the tabs, the toolbar and the textarea", async () => {
    const out = await ssr(() =>
      h(SoneMarkdownEditor, {
        modelValue: "Hi",
        ariaLabel: "Note",
        placeholder: "Write…",
        minRows: 5,
      }),
    );
    const id = /id="(sone-md-editor-[^"]+)-area"/.exec(out)![1];
    expect(out).toMatch(
      /^<sone-markdown-editor class="markdown-editor" data-slot="markdown-editor" data-mode="edit" data-appearance="field" data-toolbar-placement="top" style="--markdown-editor-rows:5;">/,
    );
    expect(out).toContain(
      `<div class="tabs-list markdown-editor-tabs" data-slot="tabs-list"`,
    );
    expect(out).toContain(
      `<button class="tabs-trigger" data-slot="tabs-trigger" data-state="active" aria-selected="true" tabindex="0" role="tab" type="button" id="${id}-tab-edit" aria-controls="${id}-edit">Write</button>`,
    );
    expect(out).toContain(
      `<div class="markdown-editor-toolbar" role="toolbar" aria-label="Formatting" aria-controls="${id}-area">`,
    );
    expect(out).toContain(
      '<button class="btn" data-slot="button" data-variant="ghost" data-size="icon-sm" type="button" aria-label="Bold" aria-keyshortcuts="Control+B">',
    );
    expect(out).toContain(
      '<span class="separator markdown-editor-sep" data-slot="separator" data-orientation="vertical" role="none"></span>',
    );
    expect(out).toContain(
      `<div class="markdown-editor-pane markdown-editor-write" id="${id}-edit" role="tabpanel" aria-labelledby="${id}-tab-edit">` +
        '<div class="markdown-editor-grow" data-value="Hi">' +
        `<textarea id="${id}-area" class="markdown-editor-area" aria-label="Note" placeholder="Write…" spellcheck="true" autocapitalize="sentences" autocomplete="off" rows="5">Hi</textarea>`,
    );
  });

  it("applies toolbar commands and shortcuts, unless the event is prevented", async () => {
    const w = mount(SoneMarkdownEditor, {
      props: { modelValue: "make bold" },
      attachTo: document.body,
    });
    area(w).setSelectionRange(5, 9);
    await w.find('button[aria-label="Bold"]').trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["make **bold**"]);
    expect(area(w).value).toBe("make **bold**");
    expect([area(w).selectionStart, area(w).selectionEnd]).toEqual([7, 11]);
    const commands = w.emitted("toolbarCommand")!;
    expect((commands[0]![0] as MarkdownToolbarCommandEvent).command).toBe(
      "bold",
    );

    await w.setProps({
      onToolbarCommand: (e: MarkdownToolbarCommandEvent) => e.preventDefault(),
    });
    await w.find('button[aria-label="Italic"]').trigger("click");
    expect(area(w).value).toBe("make **bold**");

    area(w).setSelectionRange(0, 4);
    await w.find("textarea").trigger("keydown", { key: "i", ctrlKey: true });
    expect(area(w).value).toBe("_make_ **bold**");
    w.unmount();
  });

  it("continues lists on Enter and pastes HTML as markdown", async () => {
    const w = mount(SoneMarkdownEditor, {
      props: { modelValue: "- one" },
      attachTo: document.body,
    });
    area(w).setSelectionRange(5, 5);
    await w.find("textarea").trigger("keydown", { key: "Enter" });
    expect(area(w).value).toBe("- one\n- ");
    const data = new Map([
      ["text/html", "<p><strong>Hi</strong> there</p>"],
      ["text/plain", "Hi there"],
    ]);
    const paste = new Event("paste", { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, "clipboardData", {
      value: { getData: (type: string) => data.get(type) ?? "" },
    });
    area(w).dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(true);
    expect(area(w).value).toBe("- one\n- **Hi** there");
    expect(w.emitted("editorPaste")).toHaveLength(1);
    w.unmount();
  });

  it("switches to the preview, with v-model:mode and a custom preview", async () => {
    const w = mount(SoneMarkdownEditor, {
      props: { modelValue: "# Title" },
      attachTo: document.body,
    });
    await w.findAll('[role="tab"]')[1]!.trigger("click");
    expect(w.emitted("update:mode")).toEqual([["preview"]]);
    expect(w.attributes("data-mode")).toBe("preview");
    expect(w.find("textarea").exists()).toBe(false);
    await nextTick();
    expect(w.find(".markdown-editor-preview sone-markdown h1").text()).toBe(
      "Title",
    );
    expect(
      w.find('button[aria-label="Bold"]').attributes("disabled"),
    ).toBeDefined();
    await w.setProps({ modelValue: "  " });
    expect(w.find(".markdown-editor-empty").text()).toBe("Nothing to preview");

    const split = mount(SoneMarkdownEditor, {
      props: { modelValue: "x", mode: "split", toolbar: "none" },
      slots: { preview: ({ source }: { source: string }) => h("i", source) },
    });
    expect(split.find(".markdown-editor-header").exists()).toBe(false);
    expect(split.find("textarea").exists()).toBe(true);
    expect(split.find(".markdown-editor-preview i").text()).toBe("x");
    expect(split.find(".markdown-editor-write").attributes("role")).toBe(
      undefined,
    );
    w.unmount();
  });

  it("lays out the document and minimal toolbars, the tools and the footer", async () => {
    const doc = mount(SoneMarkdownEditor, {
      props: { toolbar: "document", tabs: false },
      slots: {
        tools: () => h(SoneMarkdownEditorTools, () => "tools"),
        footer: () => h(SoneMarkdownEditorFooter, () => "footer"),
      },
    });
    const menu = doc.find("sone-row-menu");
    expect(menu.classes()).toEqual(["is-prominent", "markdown-editor-menu"]);
    expect(menu.find("button").attributes("aria-label")).toBe("Headings");
    expect(menu.find(".markdown-editor-menu-glyph").exists()).toBe(true);
    expect(
      doc
        .findAll(".markdown-editor-toolbar > button")
        .map((b) => b.attributes("aria-label")),
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
    expect(doc.findAll(".markdown-editor-sep")).toHaveLength(4);
    expect(doc.find(".markdown-editor-tools").text()).toBe("tools");
    expect(
      doc.find(".markdown-editor-write .markdown-editor-footer").text(),
    ).toBe("footer");
    expect(doc.find('[role="tablist"]').exists()).toBe(false);

    const minimal = mount(SoneMarkdownEditor, {
      props: { toolbar: "minimal" },
    });
    expect(
      minimal
        .findAll('[role="toolbar"] button')
        .map((b) => b.attributes("aria-label")),
    ).toEqual(["Bold", "Italic", "Link", "Bulleted list", "Task list"]);
  });

  it("exposes the editing methods and reports the selection", async () => {
    const w = mount(SoneMarkdownEditor, {
      props: { modelValue: "Hello world" },
      attachTo: document.body,
    });
    const editor = w.vm as unknown as SoneMarkdownEditorExposed;
    expect(editor.textarea).toBe(area(w));
    editor.setSelection(6, 11);
    expect(w.emitted("selectionChange")!.at(-1)).toEqual([
      { start: 6, end: 11 },
    ]);
    editor.wrapSelection("[", "](url)");
    expect(area(w).value).toBe("Hello [world](url)");
    editor.setSelection(0);
    editor.insertText("> ");
    expect(area(w).value).toBe("> Hello [world](url)");
    editor.applyCommand("heading");
    expect(area(w).value).toBe("## > Hello [world](url)");
    w.unmount();
  });

  it("is disabled while busy and marks the invalid and frameless states", async () => {
    const w = mount(SoneMarkdownEditor, {
      props: {
        busy: true,
        invalid: true,
        focusFrame: false,
        stickyToolbar: true,
      },
    });
    expect(w.attributes()).toMatchObject({
      "data-disabled": "",
      "data-invalid": "",
      "data-focus-frame": "off",
      "data-sticky-toolbar": "",
    });
    expect(area(w).disabled).toBe(true);
    expect(w.find("textarea").attributes("aria-invalid")).toBe("true");
    expect(
      w
        .findAll('[role="tab"]')
        .every((t) => t.attributes("disabled") !== undefined),
    ).toBe(true);
  });

  it("docks the toolbar to the bottom of the view", async () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        disconnect = vi.fn();
      },
    );
    const w = mount(SoneMarkdownEditor, {
      props: { toolbarPlacement: "dock" },
      attachTo: document.body,
    });
    await nextTick();
    expect(w.attributes("data-toolbar-placement")).toBe("dock");
    expect(observe).toHaveBeenCalled();
    window.dispatchEvent(new Event("resize"));
    expect(
      (w.element as HTMLElement).style.getPropertyValue(
        "--markdown-editor-dock-h",
      ),
    ).toBe("0px");
    w.unmount();
    vi.unstubAllGlobals();
  });

  it("renders the live host on the server and mounts CodeMirror in the browser", async () => {
    const out = await ssr(() =>
      h(SoneMarkdownEditor, { modelValue: "# Live", live: true }),
    );
    expect(out).toContain(
      '<div class="markdown-editor-live" data-slot="markdown-editor-live"></div>',
    );
    expect(out).not.toContain("<textarea");

    const w = mount(SoneMarkdownEditor, {
      props: { modelValue: "# Live", live: true, ariaLabel: "Live note" },
      attachTo: document.body,
    });
    await vi.waitFor(() =>
      expect(w.find(".markdown-editor-live .cm-editor").exists()).toBe(true),
    );
    await flushPromises();
    const content = w.find(".cm-content");
    expect(content.classes()).toContain("markdown-editor-area");
    expect(content.attributes("aria-label")).toBe("Live note");
    const editor = w.vm as unknown as SoneMarkdownEditorExposed;
    expect(editor.textarea?.value).toBe("# Live");
    await w.setProps({ modelValue: "Other" });
    expect(editor.textarea?.value).toBe("Other");
    editor.setSelection(0, 5);
    editor.applyCommand("bold");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["**Other**"]);
    w.unmount();
  });
});
