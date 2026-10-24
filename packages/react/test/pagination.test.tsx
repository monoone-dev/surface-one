import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SonePagination,
  SonePaginationContent,
  SonePaginationEllipsis,
  SonePaginationItem,
  SonePaginationLink,
  SonePaginationNav,
  SonePaginationNext,
  SonePaginationPrevious,
} from "../src/components/pagination";

const items = () =>
  Array.from(document.querySelectorAll("li")).map((li) =>
    li.querySelector('[data-slot="pagination-ellipsis"]')
      ? "…"
      : li.textContent?.trim(),
  );

describe("SonePagination", () => {
  it("draws the range with the current page outlined and aria-current", () => {
    const onPageChange = vi.fn();
    render(
      <SonePagination
        defaultPage={5}
        total={200}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
    expect(items()).toEqual([
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
    const current = screen.getByRole("button", { current: "page" });
    expect(current.textContent).toBe("5");
    expect(current.getAttribute("data-variant")).toBe("outline");
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    expect(screen.getByRole("button", { current: "page" }).textContent).toBe(
      "6",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Go to previous page" }),
    );
    expect(onPageChange).toHaveBeenLastCalledWith(5);
  });

  it("disables Previous and Next at the ends, and everything when disabled", () => {
    const { rerender } = render(<SonePagination page={1} pageCount={3} />);
    const previous = screen.getByRole("button", {
      name: "Go to previous page",
    });
    const next = screen.getByRole("button", { name: "Go to next page" });
    expect(previous).toHaveProperty("disabled", true);
    expect(next).toHaveProperty("disabled", false);
    rerender(<SonePagination page={3} pageCount={3} />);
    expect(next).toHaveProperty("disabled", true);
    rerender(<SonePagination page={2} pageCount={3} disabled />);
    expect(
      screen
        .getAllByRole("button")
        .every((b) => (b as HTMLButtonElement).disabled),
    ).toBe(true);
  });

  it("renders the shadcn parts on the server", () => {
    const html = renderToString(
      <SonePaginationNav>
        <SonePaginationContent>
          <SonePaginationItem>
            <SonePaginationPrevious href="#" />
          </SonePaginationItem>
          <SonePaginationItem>
            <SonePaginationLink href="#" isActive>
              2
            </SonePaginationLink>
          </SonePaginationItem>
          <SonePaginationItem>
            <SonePaginationEllipsis />
          </SonePaginationItem>
          <SonePaginationItem>
            <SonePaginationNext as="button" type="button" />
          </SonePaginationItem>
        </SonePaginationContent>
      </SonePaginationNav>,
    );
    expect(html).toContain(
      '<nav data-slot="pagination" aria-label="Pagination" class="pagination"><ul data-slot="pagination-content" class="pagination-content">',
    );
    expect(html).toContain(
      '<a data-slot="pagination-link" data-variant="outline" data-size="icon" data-active="" aria-current="page" href="#" class="btn pagination-link">2</a>',
    );
    expect(html).toContain(
      '<a data-slot="pagination-previous" data-variant="ghost" data-size="default" aria-label="Go to previous page" href="#" class="btn pagination-link pagination-previous">',
    );
    expect(html).toContain('<button data-slot="pagination-next"');
    expect(html).toContain('<span class="sr-only">More pages</span>');
  });
});
