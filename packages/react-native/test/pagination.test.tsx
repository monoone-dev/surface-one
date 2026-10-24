import { fireEvent, render, screen } from "@testing-library/react";
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

describe("SonePagination", () => {
  it("draws the range and moves between pages", () => {
    const onPageChange = vi.fn();
    render(
      <SonePagination
        defaultPage={5}
        total={200}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    expect(screen.getAllByRole("img", { name: "More pages" })).toHaveLength(2);
    const current = screen.getByRole("button", { name: "5" });
    expect(current.getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    expect(
      screen.getByRole("button", { name: "6" }).getAttribute("aria-current"),
    ).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "20" }));
    expect(onPageChange).toHaveBeenLastCalledWith(20);
    expect(
      screen
        .getByRole("button", { name: "Go to next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("composes the parts as links", () => {
    const onPress = vi.fn();
    render(
      <SonePaginationNav aria-label="Results pages">
        <SonePaginationContent>
          <SonePaginationItem>
            <SonePaginationPrevious onPress={onPress} />
          </SonePaginationItem>
          <SonePaginationItem>
            <SonePaginationLink isActive>2</SonePaginationLink>
          </SonePaginationItem>
          <SonePaginationItem>
            <SonePaginationEllipsis />
          </SonePaginationItem>
          <SonePaginationItem>
            <SonePaginationNext label="Older" />
          </SonePaginationItem>
        </SonePaginationContent>
      </SonePaginationNav>,
    );
    expect(
      screen.getByRole("navigation", { name: "Results pages" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "2" }).getAttribute("aria-current"),
    ).toBe("page");
    fireEvent.click(screen.getByRole("link", { name: "Go to previous page" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Older")).toBeTruthy();
  });
});
