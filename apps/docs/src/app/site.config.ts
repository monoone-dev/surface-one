/**
 * Everything about where the site lives. `SITE_URL` feeds canonical links, the
 * hreflang alternates, Open Graph tags and the sitemap — change it here (and in
 * `scripts/postbuild-docs.mjs`) when the production domain is final.
 */
export const SITE = {
  name: "Surface One",
  url: "https://surface-one.dev",
  /** The Storybook build is published next to the docs (`npm run build:site`). */
  storybookPath: "/storybook/",
  repository: "https://github.com/monoone-dev/surface-one",
  npmScope: "@surface-one",
  version: "0.1.0",
  twitter: "",
} as const;

/** A deep link into Storybook for one story id (`components-actions-button--docs`). */
export function storybookUrl(storyId?: string): string {
  return storyId
    ? `${SITE.storybookPath}?path=/docs/${storyId}`
    : SITE.storybookPath;
}
