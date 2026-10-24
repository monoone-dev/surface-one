import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import {
  SoneBreadcrumb,
  SoneBreadcrumbEllipsis,
  SoneBreadcrumbItem,
  SoneBreadcrumbLink,
  SoneBreadcrumbList,
  SoneBreadcrumbPage,
  SoneBreadcrumbSeparator,
  SurfaceOne,
} from "../src/index";

const trail = (label?: string) =>
  h(SoneBreadcrumb, label ? { "aria-label": label } : null, () =>
    h(SoneBreadcrumbList, null, () => [
      h(SoneBreadcrumbItem, null, () =>
        h(SoneBreadcrumbLink, { href: "/" }, () => "Home"),
      ),
      h(SoneBreadcrumbSeparator),
      h(SoneBreadcrumbItem, null, () => h(SoneBreadcrumbEllipsis)),
      h(SoneBreadcrumbSeparator, null, () => "/"),
      h(SoneBreadcrumbItem, null, () =>
        h(SoneBreadcrumbPage, null, () => "Billing"),
      ),
    ]),
  );

describe("SoneBreadcrumb", () => {
  it("renders the shadcn breadcrumb markup on the server", async () => {
    const html = await renderToString(createSSRApp({ render: () => trail() }));
    expect(html).toContain(
      '<nav data-slot="breadcrumb" aria-label="Breadcrumb"><ol class="breadcrumb-list" data-slot="breadcrumb-list">',
    );
    expect(html).toContain(
      '<a class="breadcrumb-link" data-slot="breadcrumb-link" href="/">Home</a>',
    );
    expect(html).toContain(
      '<span class="breadcrumb-page" data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page">Billing</span>',
    );
    expect(html).toContain(
      '<li class="breadcrumb-separator" data-slot="breadcrumb-separator" role="presentation" aria-hidden="true"><sone-icon',
    );
    expect(html).toContain('aria-hidden="true">/</li>');
    expect(html).toContain('<span class="sr-only">More</span>');
  });

  it("takes your aria-label, a router link through `as`, and translated strings", () => {
    const RouterLink = defineComponent({
      props: { to: { type: String, required: true } },
      setup:
        (props, { slots }) =>
        () =>
          h("a", { href: props.to }, slots.default?.()),
    });
    const wrapper = mount(
      defineComponent({
        render: () =>
          h("div", [
            trail("Folder path"),
            h(
              SoneBreadcrumbLink,
              { as: RouterLink, to: "/docs" },
              () => "Docs",
            ),
          ]),
      }),
      {
        global: {
          plugins: [[SurfaceOne, { messages: { breadcrumbMore: "Więcej" } }]],
        },
      },
    );
    expect(wrapper.find("nav").attributes("aria-label")).toBe("Folder path");
    const link = wrapper.findAll("a").at(-1)!;
    expect(link.attributes("href")).toBe("/docs");
    expect(link.classes()).toContain("breadcrumb-link");
    expect(wrapper.find(".sr-only").text()).toBe("Więcej");
  });
});
