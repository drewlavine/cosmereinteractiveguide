import G from './rosharGlobe.json'

/**
 * Where the Roshar map sits on the globe (fitted for the engine
 * prototype): an azimuthal equidistant projection about `centre`, an affine
 * onto map pixels, then a smooth warp that lines the coastlines up with
 * Isaac Stewart's map. Globe reprojection after the 17th Shard's "Globe of
 * Roshar".
 */
const RAD = Math.PI / 180
const [p0, l0] = [G.centre[0] * RAD, G.centre[1] * RAD]
const [a, b, c, d] = G.affine
const det = a * d - b * c

function warpAt(x: number, y: number): [number, number] {
  const gx = Math.min(G.warpW - 1, Math.max(0, x / G.warpStep))
  const gy = Math.min(G.warpH - 1, Math.max(0, y / G.warpStep))
  const x0 = Math.min(G.warpW - 2, Math.floor(gx))
  const y0 = Math.min(G.warpH - 2, Math.floor(gy))
  const fx = gx - x0
  const fy = gy - y0
  const at = (i: number, j: number, k: number) =>
    G.warp[((y0 + j) * G.warpW + x0 + i) * 2 + k]
  const lerp2 = (k: number) =>
    (at(0, 0, k) * (1 - fx) + at(1, 0, k) * fx) * (1 - fy) +
    (at(0, 1, k) * (1 - fx) + at(1, 1, k) * fx) * fy
  return [lerp2(0), lerp2(1)]
}

/** Latitude/longitude (degrees) -> Roshar map pixel (2560 x 1600). */
export function latLonToMap(lat: number, lon: number): [number, number] {
  const p = lat * RAD
  const dl = lon * RAD - l0
  const cosc =
    Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(dl)
  const ang = Math.acos(Math.max(-1, Math.min(1, cosc)))
  const k = ang < 1e-9 ? 1 : ang / Math.max(Math.sin(ang), 1e-6)
  const x = k * Math.cos(p) * Math.sin(dl) - G.offset[0]
  const y =
    k *
      (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(dl)) -
    G.offset[1]
  const qx = (d * x - b * y) / det + 1280 - 0.5
  const qy = 800 - (-c * x + a * y) / det - 0.5
  // The warp is stored forward (pixel -> offset), so solve i + warp(i) = q
  let ix = qx
  let iy = qy
  for (let n = 0; n < 3; n++) {
    const [wx, wy] = warpAt(ix, iy)
    ix = qx - wx
    iy = qy - wy
  }
  return [ix + 0.5, iy + 0.5]
}

/**
 * Turns the sphere's own frame (three's SphereGeometry with an
 * equirectangular texture) so the map's centre faces +z, north up.
 */
export const GLOBE_BASIS = G.basis as [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]
