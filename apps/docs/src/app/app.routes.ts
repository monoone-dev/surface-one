import { inject, type Type } from "@angular/core";
import type { ResolveFn, Routes } from "@angular/router";

import { loadDemo, type LoadedDemo } from "./demos/registry";
import { I18n } from "./i18n/i18n.service";
import { TEMPLATES, type TemplateSlug } from "./templates/registry";
import { DEFAULT_LOCALE, LOCALES } from "./i18n/locales";

/** Loads the locale's messages before any page of that locale renders. */
const localeResolver: ResolveFn<boolean> = async (route) => {
  await inject(I18n).use(route.data["locale"] as string);
  return true;
};

/** Resolved before render so the prerendered HTML already contains the demo. */
const demoResolver: ResolveFn<LoadedDemo | null> = (route) =>
  loadDemo(route.paramMap.get("slug") ?? "");

const templateResolver: ResolveFn<Type<unknown> | null> = async (route) => {
  const load = TEMPLATES[route.paramMap.get("slug") as TemplateSlug];
  return load ? (await load()).default : null;
};

/** The same page tree under `/` (English) and `/<code>/` for every other locale. */
const pages = (withNotFound: boolean): Routes => [
  {
    path: "",
    pathMatch: "full",
    loadComponent: () => import("./pages/home/home.page"),
  },
  {
    path: "components",
    loadComponent: () => import("./pages/components/components.page"),
  },
  {
    path: "components/:slug",
    loadComponent: () => import("./pages/component/component.page"),
    resolve: { demo: demoResolver },
  },
  { path: "guide", pathMatch: "full", redirectTo: "guide/introduction" },
  {
    path: "guide/:slug",
    loadComponent: () => import("./pages/guide/guide.page"),
  },
  {
    path: "theme",
    loadComponent: () => import("./pages/theme/theme.page"),
  },
  {
    path: "templates",
    loadComponent: () => import("./pages/templates/templates.page"),
  },
  {
    path: "templates/:slug",
    loadComponent: () => import("./pages/template/template.page"),
    resolve: { screen: templateResolver },
  },
  {
    path: "changelog",
    loadComponent: () => import("./pages/changelog/changelog.page"),
  },
  // The page was called Release notes before the changelog came from release-please.
  { path: "release", pathMatch: "full", redirectTo: "changelog" },
  ...(withNotFound
    ? [
        {
          // Prerendered once and copied to /404.html for the static host.
          path: "404",
          loadComponent: () => import("./pages/not-found/not-found.page"),
        },
        {
          path: "**",
          loadComponent: () => import("./pages/not-found/not-found.page"),
        },
      ]
    : []),
];

export const routes: Routes = [
  ...LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map((l) => ({
    path: l.code,
    data: { locale: l.code },
    resolve: { locale: localeResolver },
    runGuardsAndResolvers: "always" as const,
    children: pages(false),
  })),
  {
    path: "",
    data: { locale: DEFAULT_LOCALE },
    resolve: { locale: localeResolver },
    runGuardsAndResolvers: "always" as const,
    children: pages(true),
  },
];
