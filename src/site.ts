/** Absolute URL for a site-relative href, based on wherever the app is served from. */
export function absoluteUrl(href: string): string {
  return new URL(href, window.location.origin).toString();
}
