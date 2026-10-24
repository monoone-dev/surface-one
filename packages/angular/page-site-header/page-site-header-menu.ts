// The site header's menu sheet, with no framework in it: the Angular
// `sone-page-site-header`, the Vue and React twins (through @surface-one/core) share it.

/**
 * True when a click inside the menu followed a link: the sheet closes, so a client-side
 * navigation does not leave it open over the new page.
 */
export const pageSiteHeaderClosesMenu = (target: EventTarget | null): boolean =>
  !!(target as Element | null)?.closest?.("a[href]");
