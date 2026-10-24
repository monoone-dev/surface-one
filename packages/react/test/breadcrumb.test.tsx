import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

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

const Trail = ({ label }: { label?: string }) => (
  <SoneBreadcrumb aria-label={label}>
    <SoneBreadcrumbList>
      <SoneBreadcrumbItem>
        <SoneBreadcrumbLink href="/">Home</SoneBreadcrumbLink>
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
);

describe("SoneBreadcrumb", () => {
  it("renders the shadcn breadcrumb markup on the server", () => {
    const html = renderToString(<Trail />);
    expect(html).toContain(
      '<nav data-slot="breadcrumb" aria-label="Breadcrumb"><ol data-slot="breadcrumb-list" class="breadcrumb-list">',
    );
    expect(html).toContain(
      '<a data-slot="breadcrumb-link" href="/" class="breadcrumb-link">Home</a>',
    );
    expect(html).toContain(
      '<span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" class="breadcrumb-page">Billing</span>',
    );
    expect(html).toContain(
      '<li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class="breadcrumb-separator"><sone-icon',
    );
    expect(html).toContain('class="breadcrumb-separator">/</li>');
    expect(html).toContain('<span class="sr-only">More</span>');
  });

  it("takes your aria-label, a router link through `as`, and translated strings", () => {
    function RouterLink({
      to,
      children,
    }: {
      to: string;
      children?: ReactNode;
    }) {
      return <a href={to}>{children}</a>;
    }
    render(
      <SoneMessagesProvider messages={{ breadcrumbMore: "Więcej" }}>
        <Trail label="Folder path" />
        <SoneBreadcrumbLink as={RouterLink} to="/docs">
          Docs
        </SoneBreadcrumbLink>
      </SoneMessagesProvider>,
    );
    expect(
      screen.getByRole("navigation", { name: "Folder path" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Docs" }).getAttribute("href"),
    ).toBe("/docs");
    expect(
      screen
        .getByRole("link", { name: "Billing" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByText("Więcej").className).toBe("sr-only");
  });
});
