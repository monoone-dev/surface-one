import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import {
  SonePagination,
  SonePaginationContent,
  SonePaginationEllipsis,
  SonePaginationItem,
  SonePaginationLink,
  SonePaginationNav,
  SonePaginationNext,
  SonePaginationPrevious,
} from "../src/index";

const pages = (wrapper: ReturnType<typeof mount>) =>
  wrapper
    .findAll("li")
    .map((li) =>
      li.find('[data-slot="pagination-ellipsis"]').exists() ? "…" : li.text(),
    );

describe("SonePagination", () => {
  it("draws the range with the current page outlined and aria-current", async () => {
    const wrapper = mount(SonePagination, {
      props: { page: 5, total: 200, pageSize: 10 },
    });
    expect(wrapper.find("sone-pagination > nav").attributes("aria-label")).toBe(
      "Pagination",
    );
    expect(pages(wrapper)).toEqual([
      "Previous",
      "1",
      "…",
      "4",
      "5",
      "6",
      "…",
      "20",
      "Next",
    ]);
    const current = wrapper.find('[aria-current="page"]');
    expect(current.text()).toBe("5");
    expect(current.attributes("data-variant")).toBe("outline");
    await wrapper.findAll("button")[4]!.trigger("click");
    expect(wrapper.emitted("update:page")).toEqual([[6]]);
    expect(wrapper.find('[aria-current="page"]').text()).toBe("6");
    await wrapper.find('[data-slot="pagination-previous"]').trigger("click");
    expect(wrapper.emitted("update:page")!.at(-1)).toEqual([5]);
  });

  it("disables Previous and Next at the ends, and everything when disabled", async () => {
    const wrapper = mount(SonePagination, { props: { page: 1, pageCount: 3 } });
    const previous = wrapper.find('[data-slot="pagination-previous"]');
    const next = wrapper.find('[data-slot="pagination-next"]');
    expect(previous.attributes("disabled")).toBeDefined();
    expect(previous.attributes("aria-label")).toBe("Go to previous page");
    expect(next.attributes("disabled")).toBeUndefined();
    await wrapper.setProps({ page: 3 });
    expect(next.attributes("disabled")).toBeDefined();
    await wrapper.setProps({ disabled: true });
    expect(
      wrapper
        .findAll("button")
        .every((b) => b.attributes("disabled") !== undefined),
    ).toBe(true);
  });

  it("renders the shadcn parts on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(SonePaginationNav, null, () =>
            h(SonePaginationContent, null, () => [
              h(SonePaginationItem, null, () =>
                h(SonePaginationPrevious, { href: "#" }),
              ),
              h(SonePaginationItem, null, () =>
                h(SonePaginationLink, { href: "#", isActive: true }, () => "2"),
              ),
              h(SonePaginationItem, null, () => h(SonePaginationEllipsis)),
              h(SonePaginationItem, null, () =>
                h(SonePaginationNext, { as: "button", type: "button" }),
              ),
            ]),
          ),
      }),
    );
    expect(html).toContain(
      '<nav class="pagination" data-slot="pagination" aria-label="Pagination"><ul class="pagination-content" data-slot="pagination-content">',
    );
    expect(html).toContain(
      '<a class="btn pagination-link" data-slot="pagination-link" data-variant="outline" data-size="icon" data-active aria-current="page" href="#">2</a>',
    );
    expect(html).toContain(
      'data-slot="pagination-previous" data-variant="ghost" data-size="default" aria-label="Go to previous page" href="#">',
    );
    expect(html).toContain(
      '<button class="btn pagination-link pagination-next" data-slot="pagination-next"',
    );
    expect(html).toContain('<span class="sr-only">More pages</span>');
  });
});
