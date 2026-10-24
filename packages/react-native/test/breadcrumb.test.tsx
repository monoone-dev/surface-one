import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SoneMessagesProvider } from "../src/context/messages";
import {
  SoneBreadcrumb,
  SoneBreadcrumbEllipsis,
  SoneBreadcrumbItem,
  SoneBreadcrumbLink,
  SoneBreadcrumbList,
  SoneBreadcrumbPage,
  SoneBreadcrumbSeparator,
} from "../src/components/breadcrumb";

describe("SoneBreadcrumb", () => {
  it("a named navigation list of links ending on the current page", () => {
    const onHome = vi.fn();
    render(
      <SoneMessagesProvider messages={{ breadcrumbMore: "Więcej" }}>
        <SoneBreadcrumb>
          <SoneBreadcrumbList>
            <SoneBreadcrumbItem>
              <SoneBreadcrumbLink onPress={onHome}>Home</SoneBreadcrumbLink>
            </SoneBreadcrumbItem>
            <SoneBreadcrumbSeparator />
            <SoneBreadcrumbItem>
              <SoneBreadcrumbEllipsis />
            </SoneBreadcrumbItem>
            <SoneBreadcrumbSeparator>/</SoneBreadcrumbSeparator>
            <SoneBreadcrumbItem>
              <SoneBreadcrumbPage>Billing</SoneBreadcrumbPage>
            </SoneBreadcrumbItem>
          </SoneBreadcrumbList>
        </SoneBreadcrumb>
      </SoneMessagesProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(onHome).toHaveBeenCalledTimes(1);
    const page = screen.getByRole("link", { name: "Billing" });
    expect(page.getAttribute("aria-current")).toBe("page");
    expect(page.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("img", { name: "Więcej" })).toBeTruthy();
  });

  it("takes your aria-label", () => {
    render(<SoneBreadcrumb aria-label="Folder path" />);
    expect(
      screen.getByRole("navigation", { name: "Folder path" }),
    ).toBeTruthy();
  });
});
