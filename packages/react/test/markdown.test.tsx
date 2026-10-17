import { render } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { act } from "react";
import { describe, expect, it } from "vitest";

import { SoneMessagesProvider } from "../src/context/messages";
import { SoneMarkdown } from "../src/components/markdown";

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

describe("SoneMarkdown", () => {
  it("renders the host and one block per markdown block, like sone-markdown", () => {
    const { container } = render(
      <SoneMarkdown
        className="note"
        id="skill"
        source={"# Skill\n\n- one\n- two\n\n```ts\nconst a = 1;\n```"}
      />,
    );
    const host = container.querySelector("sone-markdown")!;
    expect(host.getAttribute("class")).toBe("markdown note");
    expect(host.getAttribute("data-slot")).toBe("markdown");
    expect(host.getAttribute("data-size")).toBe("default");
    expect(host.id).toBe("skill");
    const blocks = host.querySelectorAll(":scope > .markdown-block");
    expect(blocks).toHaveLength(3);
    expect(host.querySelector("h1")?.textContent).toBe("Skill");
    expect(
      [...host.querySelectorAll("ul > li")].map((li) => li.textContent),
    ).toEqual(["one", "two"]);
    const code = host.querySelector(".markdown-code code.language-ts");
    expect(code?.textContent).toBe("const a = 1;\n");
    expect(host.querySelector(".markdown-code-lang")?.textContent).toBe("ts");
  });

  it("takes size and breaks", () => {
    const { container, rerender } = render(
      <SoneMarkdown size="sm" source={"a\nb"} />,
    );
    const host = container.querySelector("sone-markdown")!;
    expect(host.getAttribute("data-size")).toBe("sm");
    expect(host.querySelector("p br")).not.toBeNull();
    rerender(<SoneMarkdown size="sm" breaks={false} source={"a\nb"} />);
    expect(host.querySelector("p br")).toBeNull();
    expect(host.querySelector("p")?.textContent).toBe("a\nb");
  });

  it("shows raw HTML as text and never runs it", () => {
    const { container } = render(
      <SoneMarkdown
        source={'<script>alert(1)</script>\n\nhi <b onclick="x()">bold</b>'}
      />,
    );
    const host = container.querySelector("sone-markdown")!;
    expect(host.querySelector("script")).toBeNull();
    expect(host.querySelector("b")).toBeNull();
    expect(host.textContent).toContain("<script>alert(1)</script>");
    expect(host.textContent).toContain('<b onclick="x()">bold</b>');
  });

  it("drops javascript: links", () => {
    const { container } = render(
      <SoneMarkdown source="[click](javascript:alert(1)) and [docs](https://example.com)" />,
    );
    const links = [...container.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).not.toContain(
      "javascript:alert(1)",
    );
    const docs = links.find((a) => a.textContent === "docs")!;
    expect(docs.getAttribute("href")).toBe("https://example.com");
    expect(docs.getAttribute("target")).toBe("_blank");
    expect(docs.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders only inline data: images, never a remote one", () => {
    const { container } = render(
      <SoneMarkdown
        source={`![Chart](https://example.com/chart.png)\n\n![Dot](${PIXEL})`}
      />,
    );
    const images = [...container.querySelectorAll("img")];
    expect(images.map((img) => img.getAttribute("src"))).toEqual([PIXEL]);
    expect(
      container.querySelector(".markdown-image-blocked")?.textContent,
    ).toBe("Chart — image not loaded");
  });

  it("names task boxes and translates its strings through the messages provider", () => {
    const { container } = render(
      <SoneMessagesProvider
        messages={{
          markdownTask: "Zadanie",
          markdownImageBlocked: (alt) => `${alt} — nie wczytano obrazu`,
        }}
      >
        <SoneMarkdown
          source={
            "- [x] Done\n- [ ] Todo\n\n![Chart](https://example.com/c.png)"
          }
        />
      </SoneMessagesProvider>,
    );
    const boxes = [...container.querySelectorAll(".markdown-task-box")];
    expect(boxes.map((b) => b.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
    ]);
    expect(boxes[0]?.getAttribute("aria-label")).toBe("Zadanie");
    expect(container.querySelector(".markdown-task.is-done")?.textContent).toBe(
      "Done",
    );
    expect(
      container.querySelector(".markdown-image-blocked")?.textContent,
    ).toBe("Chart — nie wczytano obrazu");
  });

  it("follows a changed source", () => {
    const { container, rerender } = render(<SoneMarkdown source="# One" />);
    rerender(<SoneMarkdown source={"# One\n\nTwo"} />);
    const host = container.querySelector("sone-markdown")!;
    expect(host.querySelector("h1")?.textContent).toBe("One");
    expect(host.querySelector("p")?.textContent).toBe("Two");
    rerender(<SoneMarkdown source={null} />);
    expect(container.querySelector("sone-markdown")?.children).toHaveLength(0);
  });

  it("renders the empty host on the server and fills it in after hydration", async () => {
    const html = renderToString(<SoneMarkdown source="# Hello" />);
    expect(html).toContain('class="markdown"');
    expect(html).not.toContain("Hello");
    const root = document.createElement("div");
    root.innerHTML = html;
    document.body.append(root);
    await act(async () => {
      hydrateRoot(root, <SoneMarkdown source="# Hello" />);
    });
    expect(root.querySelector("sone-markdown h1")?.textContent).toBe("Hello");
  });
});
