const BASE = import.meta.env.BASE_URL

/**
 * A file in `public/` as the browser should load it. Data keeps root paths
 * like "/portraits/x.webp"; on GitHub Pages the site lives under
 * "/cosmereinteractiveguide/", so they need that prefix. Safe to apply twice;
 * other URLs pass through.
 */
export function assetUrl(path: string): string {
  if (BASE === '/' || !path.startsWith('/') || path.startsWith('//'))
    return path
  if (path.startsWith(BASE)) return path
  return BASE + path.slice(1)
}
