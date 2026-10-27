import type { Portrait } from './characterPortraits'
import { portraitFaces } from './portraitFaces'

/**
 * A page's portraits as round face thumbnails for map markers and chips,
 * dropping art with no face that reads at that size (a helmet, a distant
 * figure, a group), so a marker falls back to earlier art or initials.
 */
export function facePortraits(
  pageId: string,
  portraits: Portrait[] = [],
): Portrait[] {
  return portraits.flatMap((p) => {
    const shared = portraitFaces[`${pageId} ${p.src}`]
    const face = shared === undefined ? portraitFaces[p.src] : shared
    return face ? [{ ...p, src: face }] : []
  })
}
