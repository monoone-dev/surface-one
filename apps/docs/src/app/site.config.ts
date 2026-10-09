/**
 * Everything about where the site lives. `SITE_URL` feeds canonical links, the
 * hreflang alternates, Open Graph tags and the sitemap — change it here (and in
 * `scripts/postbuild-docs.mjs`) when the production domain is final. The site
 * is served from `/surface-one/` on GitHub Pages: keep the path in `url` and the
 * production `baseHref` in `angular.json` in step.
 */
export const SITE = {
  name: "SurfaceOne",
  url: "https://monoone-dev.github.io/surface-one",
  /** The Storybook build is published next to the docs (`npm run build:site`);
   *  relative, so it resolves against the `<base href>`. */
  storybookPath: "storybook/",
  repository: "https://github.com/monoone-dev/surface-one",
  npmScope: "@surface-one",
  version: "0.3.0",
  twitter: "",
} as const;

/** A deep link into Storybook for one story id (`components-actions-button--docs`). */
export function storybookUrl(storyId?: string): string {
  return storyId
    ? `${SITE.storybookPath}?path=/docs/${storyId}`
    : SITE.storybookPath;
}
