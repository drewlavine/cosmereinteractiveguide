/* Three.js objects (materials, the camera) are mutated every frame, as
   React Three Fiber intends; the React Compiler's rules don't apply. */
/* oxlint-disable react/immutability, react/use-memo */
import { useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import {
  Component,
  Fragment,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import * as THREE from 'three'
import { Cam, type CamTarget, type CamWorld } from './camera'
import styles from './Explorer.module.css'
import { fromCentre, GLOBE_BASIS, latLonToMap } from './globe'
import {
  distFor,
  FOV,
  levelFades,
  MAP_H,
  MAP_VIEW_H,
  mapPoint,
  mapSize,
  PIN_H,
  PLANE_Z,
  PLANET_R,
  SKY,
  SKY_Z,
  skyScale,
  type Fades,
  type Level,
} from './sky'
import type { TimelineEffect } from '../../data/timeline'
import { ShatteringBurst } from './ShatteringBurst'
import {
  edgeSpot,
  hits,
  nearest,
  placeGroups,
  spotFor,
  type Box,
  type FlagGroup,
  type FlagSpot,
} from './flags'
import paintedNames from './paintedNames.json'
import { reducedMotion } from './webgl'
import type {
  Around,
  ExplorerPin,
  ExplorerWorld,
  InsetMap,
  YolenLook,
} from './worlds'
import { drillFades, INSET_K, tagsFade } from './drill'

/** Where the explorer should be: the sky, or a world and how close. */
export interface ExplorerGoal {
  /** None: the whole Cosmere. */
  world?: string
  view?: 'globe' | 'map' | 'pin'
  pin?: readonly [number, number]
  /**
   * A map handing over to another: cut there instead of flying (at this
   * view height, if given), and the reader's zoom carries on from there.
   */
  cut?: true | number
  /** Changes whenever the camera should go there again. */
  key: string
}

export interface ExplorerCanvasProps {
  worlds: ExplorerWorld[]
  pins: ExplorerPin[]
  goal: ExplorerGoal
  /** The pin to ring (the current event's). */
  current?: string
  /** A star was picked, or the reader zoomed out past a world (none). */
  onExplore: (world?: string) => void
  onPin?: (id: string) => void
  /** A click on the scene itself, not on a button over it. */
  onBackground?: () => void
  /** What's in view: a world, or the sky. */
  onView?: (view: { world: string; level: Level }) => void
  /** Whether a world's globe (not its unrolled map) is in view. */
  onGlobe?: (on: boolean) => void
  /** A special effect for the current event, e.g. the Shattering's burst. */
  effect?: ExplorerEffect
  /**
   * Notable characters: on their world's map, a face pin where they are,
   * else in a "location unknown" list.
   */
  people?: ExplorerFloatPerson[]
  onPerson?: (id: string) => void
  /** A place's map button (on its flag or roster) was clicked: open it. */
  onPlace?: (world: string, mapId: string, zoomed?: boolean) => void
  /** Cities with maps of their own, on each world's map: zoom in to open. */
  cities?: ExplorerCity[]
  /** Back to the default view of what's being looked at. */
  onReset?: () => void
  /** More controls, above the zoom buttons. */
  children?: ReactNode
  /**
   * A title just above the globe in view, fading out as it unrolls. The
   * globe view makes room for it.
   */
  globeTitle?: ReactNode
  /** A box to fit the globe into at its globe view (e.g. beside a panel). */
  dock?: HTMLElement | null
  /** Bumped to zoom into the globe in view, as a click on it does. */
  zoomIn?: number
}

export interface ExplorerCity {
  world: string
  mapId: string
  title: string
  at: readonly [number, number]
  src: string
  map?: InsetMap
}

export interface ExplorerFloatPerson {
  id: string
  name: string
  world: string
  /** Where on its map, if known. */
  at?: readonly [number, number]
  /** Placed on a map not drawn (another city's): not "location unknown". */
  elsewhere?: boolean
  face?: string
  initials: string
  /** Where they are: one flag per place, naming it. */
  place?: ExplorerPlace
  /** What they're doing there. */
  note?: string
}

export interface ExplorerPlace {
  name: string
  /** Its own map, to open. */
  mapId?: string
}

export interface ExplorerEffect {
  kind: TimelineEffect
  /** Its world, once the reader knows it; else it's out in open space. */
  world?: string
  /** Changes whenever it should play again. */
  key: string
}

type Ref<T> = { current: T }

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, '#fff')
  grad.addColorStop(0.25, 'rgba(255,240,210,.8)')
  grad.addColorStop(1, 'rgba(255,220,160,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/** Far stars behind everything, seen once the painting fades. */
function Stars() {
  const geo = useMemo(() => {
    const r = rng(3)
    const n = 4000
    const pos = new Float32Array(n * 3)
    const size = new Float32Array(n)
    const tw = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2
      const d = 6000 + Math.pow(r(), 0.6) * 140000
      const t = r()
      pos.set([Math.cos(a) * d, Math.sin(a) * d, -20000 - t * 160000], i * 3)
      size[i] = 0.4 + r() * r() * 3
      tw[i] = t * 6.28
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('size', new THREE.BufferAttribute(size, 1))
    g.setAttribute('tw', new THREE.BufferAttribute(tw, 1))
    return g
  }, [])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: glowTexture() }, time: { value: 0 } },
        vertexShader: `attribute float size; attribute float tw; uniform float time; varying float a;
          void main(){ a = 0.65 + 0.35*sin(time*1.7+tw); vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = size*3.2; gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform sampler2D map; varying float a; void main(){ gl_FragColor = texture2D(map, gl_PointCoord)*a*1.2; }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useFrame(({ clock }) => (mat.uniforms.time.value = clock.elapsedTime))
  return <points geometry={geo} material={mat} renderOrder={-2} />
}

/**
 * The constellation painting (Isaac Stewart) as the sky, pinned so the
 * anchor world's star lies on the line from the camera to its globe, with
 * a live star over each system the reader knows.
 */
function Sky({
  cam,
  fade,
  stars,
  hovered,
}: {
  cam: Cam
  fade: Ref<Fades>
  stars: (readonly [number, number])[]
  hovered: Ref<readonly [number, number] | undefined>
}) {
  const tex = useTexture(SKY.src)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const glow = useMemo(glowTexture, [])
  const group = useRef<THREE.Group>(null)
  const art = useRef<THREE.Mesh>(null)
  const sprites = useRef<(THREE.Sprite | null)[]>([])
  const amt = useRef(0)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          opacity: { value: 1 },
          hoverUv: { value: new THREE.Vector2(-9, -9) },
          hoverAmt: { value: 0 },
          aspect: { value: SKY.w / SKY.h },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `uniform sampler2D map; uniform float opacity, hoverAmt, aspect; uniform vec2 hoverUv; varying vec2 vUv;
          void main(){
            vec3 c = texture2D(map, vUv).rgb;
            vec2 d = (vUv - hoverUv) * vec2(aspect, 1.0);
            float near = exp(-dot(d, d) / 0.07);
            float lum = dot(c, vec3(0.299, 0.587, 0.114));
            float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
            float figure = smoothstep(0.12, 0.4, lum) * (1.0 - smoothstep(0.25, 0.5, sat / max(lum, 0.05)));
            vec3 col = c * (1.0 - 0.6 * hoverAmt * (1.0 - near));
            col += hoverAmt * near * (figure * 3.5 * c + 0.04) * vec3(0.85, 0.95, 1.0);
            gl_FragColor = vec4(col, opacity);
            #include <colorspace_fragment>
          }`,
        transparent: true,
        depthWrite: false,
      }),
    [tex],
  )
  useFrame(({ camera }, dt) => {
    const f = fade.current
    const g = group.current!
    g.visible = f.sky > 0.01
    if (!g.visible) return
    const [ax, ay] = cam.worlds[cam.anchor]?.star ?? [SKY.w / 2, SKY.h / 2]
    const camZ = camera.position.z
    const rho = (camZ - SKY_Z) / camZ
    const k = skyScale(cam.h) * rho
    g.position.set(cam.cx * (1 - rho), cam.cy * (1 - rho), SKY_Z)
    g.scale.setScalar(k)
    art.current!.position.set(SKY.w / 2 - ax, ay - SKY.h / 2, 0)
    // One screen pixel, in art pixels.
    const px = ((cam.h / cam.H) * (camZ - SKY_Z)) / (camZ - PLANE_Z) / k
    const on = hovered.current
    amt.current += ((on ? 1 : 0) - amt.current) * Math.min(1, dt * 8)
    mat.uniforms.opacity.value = f.sky
    mat.uniforms.hoverAmt.value = amt.current
    if (on) mat.uniforms.hoverUv.value.set(on[0] / SKY.w, 1 - on[1] / SKY.h)
    const t = performance.now() / 1000
    stars.forEach((s, i) => {
      const sprite = sprites.current[i]
      if (!sprite) return
      const lit = on === s
      // The anchor's star becomes its globe.
      const here = s[0] === ax && s[1] === ay ? 1 - f.planetIn : 1
      sprite.position.set(s[0] - ax, ay - s[1], 2)
      sprite.scale.setScalar(
        px * (lit ? 46 : 30) * (1 + 0.06 * Math.sin(t * 2 + i)),
      )
      ;(sprite.material as THREE.SpriteMaterial).opacity = f.sky * here
    })
  })
  return (
    <group ref={group}>
      <mesh ref={art} material={mat} renderOrder={-1}>
        <planeGeometry args={[SKY.w, SKY.h]} />
      </mesh>
      {stars.map((s, i) => (
        <sprite
          key={s.join()}
          ref={(r) => void (sprites.current[i] = r)}
          renderOrder={1}
        >
          <spriteMaterial
            map={glow}
            color={[2.2, 1.9, 1.3]}
            transparent
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}

const ATM_SCALE = 1.06

function Atmosphere({ color, o }: { color: string; o: () => number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          o: { value: 1 },
          tint: { value: new THREE.Color(color) },
          limb: { value: Math.sqrt(1 - 1 / ATM_SCALE ** 2) },
        },
        vertexShader: `varying vec3 n; varying vec3 v; void main(){ n = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); v = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform float o, limb; uniform vec3 tint; varying vec3 n; varying vec3 v; void main(){ float f = pow(clamp(abs(dot(n,v)) / limb, 0., 1.), 2.6); gl_FragColor = vec4(mix(vec3(0.3,0.6,1.0), tint, 0.5),1.0)*f*0.7*o; }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [color],
  )
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    mat.uniforms.o.value = o()
    ref.current!.visible = o() > 0.01
  })
  return (
    <mesh ref={ref} material={mat} scale={ATM_SCALE}>
      <sphereGeometry args={[PLANET_R, 64, 48]} />
    </mesh>
  )
}

/** Between the globe's top and the title above it, px. */
const TITLE_GAP = 6
/** Above the title, px. */
const TITLE_TOP = 14
const smooth = (m: number) => m * m * (3 - 2 * m)
const planetOpacity = (f: Fades) => Math.max(f.planet, f.flat) * f.planetIn

/** Roshar's globe, textured, unrolling into its map as you close in. */
function RosharGlobe({
  fade,
  map,
  city,
}: {
  fade: Ref<Fades>
  map: NonNullable<ExplorerWorld['globe']>
  /** Unrolling into a city's map: the city's map takes over. */
  city?: boolean
}) {
  const tex = useTexture(map.texture)
  const gl = useThree((s) => s.gl)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = gl.capabilities.getMaxAnisotropy()
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(PLANET_R, 256, 160)
    const uv = g.getAttribute('uv')
    const flat = new Float32Array(uv.count * 3)
    const far = new Float32Array(uv.count)
    for (let i = 0; i < uv.count; i++) {
      const lat = uv.getY(i) * 180 - 90
      const lon = uv.getX(i) * 360 - 180
      const [rx, ry] = latLonToMap(lat, lon)
      const [a, b, c, d, e, f] = map.fromRoshar ?? [1, 0, 0, 1, 0, 0]
      const [x, y] = mapPoint(map, [a * rx + b * ry + e, c * rx + d * ry + f])
      flat.set([x, y, PLANE_Z - 3], i * 3)
      far[i] = smooth(
        Math.min(1, Math.max(0, (fromCentre(lat, lon) - 2.3) / 0.4)),
      )
    }
    g.setAttribute('flatPos', new THREE.BufferAttribute(flat, 3))
    g.setAttribute('far', new THREE.BufferAttribute(far, 1))
    return g
  }, [map])
  const basis = useMemo(() => new THREE.Matrix3().set(...GLOBE_BASIS), [])
  const spinM = useMemo(() => new THREE.Matrix3(), [])
  const spin = useRef(0)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          opacity: { value: 1 },
          morph: { value: 0 },
          orient: { value: new THREE.Matrix3() },
          lightDir: { value: new THREE.Vector3(-3, 2, 4).normalize() },
          ...unchartedUniforms(map, map.edge),
        },
        vertexShader: `attribute vec3 flatPos; attribute float far; uniform mat3 orient; uniform float morph;
          varying vec2 vUv; varying vec3 vN; varying vec3 vView;
          varying vec2 vFlat; varying vec3 vS; varying float vFar;
          void main(){
            vUv = uv;
            vFlat = flatPos.xy; vS = normalize(position); vFar = far;
            vec3 p = mix(orient * position, flatPos, morph);
            vN = mix(orient * normal, vec3(0., 0., 1.), morph);
            vView = cameraPosition - p;
            gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.);
          }`,
        fragmentShader: `uniform sampler2D map; uniform float opacity, morph; uniform vec3 lightDir;
          varying vec2 vUv; varying vec3 vN; varying vec3 vView;
          varying vec2 vFlat; varying vec3 vS; varying float vFar;
          ${FBM}
          ${UNCHARTED}
          void main(){
            vec3 n = normalize(vN), v = normalize(vView);
            vec3 col = texture2D(map, vUv).rgb;
            vec2 e = edgeField(vFlat);
            float u = edgeOn * max(smoothstep(edgeBand.x, edgeBand.y, e.x), vFar);
            col = uncharted(col, u);
            col *= mix(0.5 + 0.7 * max(dot(n, lightDir), 0.), 1., morph);
            vec2 g = vUv * vec2(36., 18.);
            vec2 f = abs(fract(g - .5) - .5) / max(fwidth(g), 1e-4);
            float line = 1. - min(min(f.x, f.y) * 1.4, 1.);
            col = mix(col, vec3(.8, .9, 1.), line * .13 * (1. - morph) * (1. - u));
            col = unchartedHaze(col, u, line, e.y, vFlat, vS, vFar);
            float rim = pow(1. - max(dot(n, v), 0.), 2.5);
            col = mix(col, vec3(.35, .62, 1.), rim * .45 * (1. - morph));
            gl_FragColor = vec4(col, opacity);
            #include <colorspace_fragment>
          }`,
        transparent: true,
      }),
    [tex, map],
  )
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }, dt) => {
    // Spins in space; turns to face you, then unrolls, as you close in.
    mat.uniforms.time.value = drift(clock)
    const f = fade.current
    const o = planetOpacity(f) * (city ? 1 - f.map : 1)
    const k = smooth(f.flat)
    if (f.flat > 0 || o < 0.98) spin.current *= Math.exp(-dt * 4)
    else
      spin.current =
        ((spin.current + dt * 0.05 + Math.PI) % (2 * Math.PI)) - Math.PI
    const s = spin.current * (1 - k)
    spinM.set(
      Math.cos(s),
      0,
      Math.sin(s),
      0,
      1,
      0,
      -Math.sin(s),
      0,
      Math.cos(s),
    )
    mat.uniforms.orient.value.multiplyMatrices(basis, spinM)
    mat.uniforms.morph.value = k
    mat.uniforms.opacity.value = o
    mesh.current!.visible = o > 0.01
  })
  return (
    <group>
      <mesh ref={mesh} geometry={geo} material={mat} frustumCulled={false} />
      <Atmosphere
        color="#5aa0ff"
        o={() =>
          planetOpacity(fade.current) * (1 - smooth(fade.current.flat)) ** 2
        }
      />
    </group>
  )
}

/** Value noise and fractal noise on the unit sphere, for drawn globes. */
const FBM = `
  float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  float noise(vec3 p){
    vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(mix(h(i), h(i+vec3(1,0,0)), f.x), mix(h(i+vec3(0,1,0)), h(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(h(i+vec3(0,0,1)), h(i+vec3(1,0,1)), f.x), mix(h(i+vec3(0,1,1)), h(i+vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a*noise(p); p *= 2.03; a *= .5; } return s; }
`

/**
 * The uncharted, past the map a globe is drawn by: the sea dims to slate, a
 * gold survey grid shows, a faint haze drifts over it and a dotted gold line
 * wanders round. Its edge is one field on the map's plane (vFlat: world
 * units, origin at the map's centre), so the globe and the flat map agree
 * on it all through the unroll: a rounded box the size of the map's frame,
 * domain-warped into lazy lobes and frayed with fractal noise. It knows
 * only the frame, so it's the same on every world and hints at no land.
 * Needs FBM.
 */
const UNCHARTED = `
  uniform vec2 edgeHalf, edgeBand; uniform float edgeOn, time;
  float eh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(vec2 p){
    vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(eh(i), eh(i + vec2(1., 0.)), f.x), mix(eh(i + vec2(0., 1.)), eh(i + vec2(1., 1.)), f.x), f.y);
  }
  // Fractal noise on the plane, about mean 0 and spread 1.
  float nf(vec2 p){
    float a = .5, s = 0.;
    for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; }
    return (s - .47) * 8.;
  }
  float sdBox(vec2 p, vec2 b, float r){
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r;
  }
  // How far out of the map's frame, in map heights: x frayed, y its core.
  // The core (where the dotted line runs) wanders in lazy lobes from just
  // past the frame to .06 beyond, and the fray only reaches outward from it,
  // so however the noise falls (it differs by GPU) the uncharted starts past
  // the frame and the dotted line, never over the map.
  vec2 edgeField(vec2 fp){
    vec2 p = fp / ${MAP_H}.;
    float box = sdBox(p, edgeHalf, 0.);
    float low = box + edgeBand.x - .006 - .055 * smoothstep(-1.2, 1.2, nf(p * 2.2 + 41.3));
    float rag = low + .026 * nf(p * 5.5 + 7.7) + .012 * nf(p * 14. + 1.9)
      + .005 * nf(p * 34. + 3.1);
    return vec2(max(min(rag, low), box - .06), low);
  }
  vec3 toS(vec3 c){ return pow(max(c, 0.), vec3(1. / 2.2)); }
  vec3 toL(vec3 c){ return pow(max(c, 0.), vec3(2.2)); }
  // Dim slate; land and sea converge, leaving a ghost of a coast at most.
  vec3 uncharted(vec3 lin, float u){
    if (u <= 0.) return lin;
    vec3 c = toS(lin);
    float grey = dot(c, vec3(.299, .587, .114));
    float ghost = .21 + .3 * (grey - .21);
    vec3 dim = (mix(vec3(grey), c, .25) * .25 + ghost * .75) * .45 + vec3(.10, .13, .18) * .55;
    return toL(mix(c, dim, u));
  }
  const vec3 GOLD = vec3(.83, .65, .25);
  // Over it, on the sphere: the gold grid, the haze, and the dotted line
  // where it begins (the fog lies only outside it).
  vec3 unchartedHaze(vec3 lin, float u, float line, float low, vec2 fp, vec3 s, float far){
    float d = abs(low - edgeBand.x) / max(fwidth(low), 1e-7);
    float dash = 1. - smoothstep(.12, .24, abs(fract(atan(fp.y, fp.x) / 6.2832 * 320.) - .5));
    float dots = edgeOn * (1. - smoothstep(.4, 1.3, d)) * dash * (1. - far) * .38;
    if (u <= 0. && dots <= 0.) return lin;
    vec3 c = toS(lin);
    if (u > 0.) {
      c = mix(c, GOLD, line * u * .24);
      vec3 q = s * 2.6 + vec3(time * .011, time * .003, -time * .008);
      float n = fbm(q + vec3(fbm(q * 1.7 + 5.), fbm(q * 1.7 + 9.), 0.) * .9);
      c = mix(c, vec3(.55, .62, .72), u * clamp(.02 + .6 * (n - .32), .01, .36));
    }
    c = mix(c, GOLD, dots);
    return toL(c);
  }
`

/** Uniforms for UNCHARTED, by the map a globe is drawn by. */
const unchartedUniforms = (
  map: { width: number; height: number },
  edge?: readonly [number, number],
) => ({
  edgeHalf: { value: new THREE.Vector2(map.width / map.height / 2, 0.5) },
  edgeBand: { value: new THREE.Vector2(...(edge ?? [0, 1])) },
  edgeOn: { value: edge ? 1 : 0 },
  time: { value: 0 },
})

/** The haze's clock: still for readers who'd rather nothing moved. */
const drift = (clock: THREE.Clock) => (reducedMotion() ? 0 : clock.elapsedTime)

/** A drawn globe's spin about its axis, shared by the plain and Yolen's. */
const SPIN_VERTEX = `uniform float spin; varying vec3 vP; varying vec3 vN; varying vec3 vView;
  void main(){
    float c = cos(spin), s = sin(spin);
    vP = mat3(c, 0., -s, 0., 1., 0., s, 0., c) * normalize(position);
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`

/**
 * A world with no globe art yet: a shaded sphere in its colour, with
 * cloudy noise so it reads as a planet.
 */
function PlainGlobe({ fade, color }: { fade: Ref<Fades>; color: string }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tint: { value: new THREE.Color(color) },
          opacity: { value: 1 },
          spin: { value: 0 },
          lightDir: { value: new THREE.Vector3(-3, 2, 4).normalize() },
        },
        vertexShader: SPIN_VERTEX,
        fragmentShader: `uniform vec3 tint, lightDir; uniform float opacity; varying vec3 vP; varying vec3 vN; varying vec3 vView;
          ${FBM}
          void main(){
            vec3 n = normalize(vN), v = normalize(vView);
            float land = smoothstep(.45, .55, fbm(vP * 2.4));
            vec3 col = mix(tint * .45, tint * 1.05, land);
            col = mix(col, vec3(1.), smoothstep(.62, .8, fbm(vP * 4. + 7.)) * .35);
            col *= .35 + .8 * max(dot(n, lightDir), 0.);
            float rim = pow(1. - max(dot(n, v), 0.), 2.5);
            col = mix(col, tint * .7 + .3, rim * .4);
            gl_FragColor = vec4(col, opacity);
            #include <colorspace_fragment>
          }`,
        transparent: true,
      }),
    [color],
  )
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    const f = fade.current
    // Fades out as its map takes over (it has no unrolling texture).
    const o = planetOpacity(f) * (1 - f.map)
    mat.uniforms.opacity.value = o
    mat.uniforms.spin.value += dt * 0.05 * (1 - f.flat)
    ref.current!.visible = o > 0.01
  })
  return (
    <group>
      <mesh ref={ref} material={mat}>
        <sphereGeometry args={[PLANET_R, 96, 64]} />
      </mesh>
      <Atmosphere
        color={color}
        o={() => planetOpacity(fade.current) * (1 - fade.current.flat) ** 2}
      />
    </group>
  )
}

/**
 * Yolen. No art of it exists, so it's drawn like the other plain globes: a
 * neutral, Earth-like world (its gravity and size are the cosmere standard),
 * with each feature the books describe added once the reader has read it.
 */
function YolenGlobe({
  fade,
  color,
  look,
  shatter,
}: {
  fade: Ref<Fades>
  color: string
  look: YolenLook
  /** When the Shattering started here (performance.now()), if it has. */
  shatter?: Ref<number | undefined>
}) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          opacity: { value: 1 },
          spin: { value: 0 },
          fain: { value: look.fain ? 1 : 0 },
          greatstar: { value: look.greatstar ? 1 : 0 },
          shatterT: { value: -1 },
          shatterAt: { value: new THREE.Vector3(0, 0, 1) },
          starDir: { value: new THREE.Vector3(-0.3, 0.5, 0.81).normalize() },
          lightDir: { value: new THREE.Vector3(-3, 2, 4).normalize() },
        },
        vertexShader: SPIN_VERTEX,
        fragmentShader: `uniform vec3 lightDir, starDir, shatterAt; uniform float opacity, fain, greatstar, shatterT;
          varying vec3 vP; varying vec3 vN; varying vec3 vView;
          ${FBM}
          void main(){
            vec3 n = normalize(vN), v = normalize(vView);
            float e = fbm(vP * 2.2 + 3.);
            float land = smoothstep(.47, .52, e);
            vec3 sea = mix(vec3(.04, .12, .26), vec3(.08, .24, .38), smoothstep(.3, .47, e));
            vec3 ground = mix(vec3(.2, .36, .18), vec3(.42, .4, .26), smoothstep(.55, .7, e));
            float white = fain * land * smoothstep(.54, .6, fbm(vP * 3.1 + 19.));
            ground = mix(ground, vec3(.9, .88, .82) - .08 * fbm(vP * 14.), white);
            vec3 col = mix(sea, ground, land);
            col = mix(col, vec3(1.), smoothstep(.6, .82, fbm(vP * 4. + 7.)) * .4);
            col *= .3 + .85 * max(dot(n, lightDir), 0.);
            float rim = pow(1. - max(dot(n, v), 0.), 2.5);
            col = mix(col, vec3(.55, .75, 1.), rim * .45);
            float d = 1. - dot(normalize(vP), starDir);
            col += greatstar * (vec3(1.6, 1.5, 1.25) * exp(-d * 900.) + vec3(.55, .5, .4) * exp(-d * 60.));
            if (shatterT >= 0.) {
              // The Shattering: fissures of light tear out across the land
              // from where it happened, then cool to glowing scars.
              vec3 p = normalize(vP), o = shatterAt;
              vec3 tu = normalize(cross(o, vec3(0., 1., .01))), tv = cross(o, tu);
              float r = acos(clamp(dot(p, o), -1., 1.));
              float a = atan(dot(p, tv), dot(p, tu)) / 6.2832 * 16.;
              a += (fbm(p * 5.) - .5) * 2.2 * r + (noise(p * 30.) - .5) * .25;
              float w = abs(fract(a + .5) - .5) / 16. * 6.2832 * sin(r);
              float reach = 1.5 * smoothstep(0., 1.4, shatterT);
              float along = smoothstep(reach, reach - .25, r) * smoothstep(1.6, .5, r);
              float heat = mix(3., .45, smoothstep(.8, 5., shatterT));
              vec3 fire = vec3(1., .78, .45);
              col += fire * heat * along * (smoothstep(.012, .002, w) + .35 * smoothstep(.06, .0, w));
              col += vec3(1., .92, .75) * exp(-r * r * 60.) * (5. * exp(-shatterT * 1.2) + .6);
            }
            gl_FragColor = vec4(col, opacity);
            #include <colorspace_fragment>
          }`,
        transparent: true,
      }),
    [look.fain, look.greatstar],
  )
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    const f = fade.current
    const o = planetOpacity(f) * (1 - f.map)
    mat.uniforms.opacity.value = o
    const u = mat.uniforms
    u.spin.value += dt * 0.05 * (1 - f.flat)
    const start = shatter?.current
    if (start === undefined) u.shatterT.value = -1
    else {
      // Fixed to the land that faced the camera as it began.
      if (u.shatterT.value < 0)
        u.shatterAt.value.set(Math.sin(u.spin.value), 0, Math.cos(u.spin.value))
      u.shatterT.value = (performance.now() - start) / 1000
    }
    ref.current!.visible = o > 0.01
  })
  return (
    <group>
      <mesh ref={ref} material={mat}>
        <sphereGeometry args={[PLANET_R, 128, 96]} />
      </mesh>
      <Atmosphere
        color={color}
        o={() => planetOpacity(fade.current) * (1 - fade.current.flat) ** 2}
      />
    </group>
  )
}

function FlatMap({
  fade,
  map,
  uncharted,
  place,
  alpha,
  dim,
}: {
  fade: Ref<Fades>
  map: InsetMap
  /** Drawn inside or around another map: its centre, scale and order. */
  place?: { x: number; y: number; s: number; order: number }
  /** Faded further, e.g. while zooming between a city and its map. */
  alpha?: () => number
  /** Darkened, e.g. around a city's map: 1 as drawn, 0 black. */
  dim?: () => number
  /**
   * The map its globe is drawn by: it hands over to the globe's uncharted
   * at its frame, in the same place on both.
   */
  uncharted?: readonly [number, number]
}) {
  const tex = useTexture(map.src)
  const gl = useThree((s) => s.gl)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = gl.capabilities.getMaxAnisotropy()
  // Upload now, not on the first frame it shows, mid-zoom.
  useEffect(() => gl.initTexture(tex), [gl, tex])
  const m = useRef<THREE.MeshBasicMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const [w, h] = mapSize(map)
  const edge = useMemo(
    () =>
      map.inner
        ? edgeFade(map, map.inner)
        : place && place.s < 1
          ? edgeFade(map, [0, 0, map.width, map.height])
          : undefined,
    [map, place],
  )
  const fog = useMemo(
    () =>
      uncharted &&
      new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          opacity: { value: 1 },
          ...unchartedUniforms(map, uncharted),
        },
        vertexShader: `varying vec2 vUv, vFlat;
          void main(){
            vUv = uv; vFlat = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          }`,
        fragmentShader: `uniform sampler2D map; uniform float opacity; varying vec2 vUv, vFlat;
          ${FBM}
          ${UNCHARTED}
          void main(){
            vec2 e = edgeField(vFlat);
            vec3 col = uncharted(texture2D(map, vUv).rgb, smoothstep(edgeBand.x, edgeBand.y, e.x));
            float a = 1. - smoothstep(edgeBand.x - .015, edgeBand.x + .02, e.x);
            gl_FragColor = vec4(col, opacity * a);
            #include <colorspace_fragment>
          }`,
        transparent: true,
        depthWrite: false,
      }),
    [tex, map, uncharted],
  )
  useFrame(() => {
    const o = fade.current.map * (alpha?.() ?? 1)
    if (fog) fog.uniforms.opacity.value = o
    else {
      m.current!.opacity = o
      if (dim) m.current!.color.set(map.tint ?? '#fff').multiplyScalar(dim())
    }
    mesh.current!.visible = o > 0.01
  })
  return (
    <mesh
      // Remounted between the two materials: dropping `material` would
      // leave a default white one in place of the child.
      key={fog ? 'fog' : 'plain'}
      ref={mesh}
      position={[place?.x ?? 0, place?.y ?? 0, PLANE_Z]}
      scale={[place?.s ?? 1, place?.s ?? 1, 1]}
      renderOrder={place?.order ?? 1}
      {...(fog && { material: fog })}
    >
      <planeGeometry args={[w, h]} />
      {!fog && (
        <meshBasicMaterial
          ref={m}
          map={tex}
          alphaMap={edge || null}
          color={map.tint ?? '#fff'}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      )}
    </mesh>
  )
}

/**
 * Hides a map's frame: opaque inside `inner` (image pixels), fading out
 * softly at its edges into space.
 */
function edgeFade(
  map: { width: number; height: number },
  [x0, y0, x1, y1]: readonly number[],
) {
  const N = 256
  const data = new Uint8Array(N * N * 4)
  const feather = 0.07 * Math.min(x1 - x0, y1 - y0)
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = ((i + 0.5) / N) * map.width
      // Rows run bottom-up in a texture.
      const y = (1 - (j + 0.5) / N) * map.height
      const d = Math.min(x - x0, x1 - x, y - y0, y1 - y) / feather
      const a = Math.max(0, Math.min(1, d))
      data.fill(
        Math.round(255 * smooth(a)),
        (j * N + i) * 4,
        (j * N + i) * 4 + 4,
      )
    }
  const t = new THREE.DataTexture(data, N, N)
  t.magFilter = t.minFilter = THREE.LinearFilter
  t.needsUpdate = true
  return t
}

/** Drops a part that fails to load (a map image offline, say). */
class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError = () => ({ failed: true })
  render = () => (this.state.failed ? null : this.props.children)
}

function World({
  world,
  fade,
  shatter,
  cam,
  insets = [],
}: {
  world: ExplorerWorld
  fade: Ref<Fades>
  shatter?: Ref<number | undefined>
  cam: Cam
  /** Cities on its map, drawn in place as you zoom in to them. */
  insets?: ExplorerCity[]
}) {
  const map = world.map
  const parent = map?.parent
  // Around a city's map, the map it's on, scaled up about it, and so on
  // out: in a city in a city, the world's map stays in place too.
  const around = useMemo(() => {
    if (!map || !parent) return []
    const size = mapSize(map)
    const dim = () =>
      drillFades(
        cam.h * INSET_K,
        cam.fitFor(size) * INSET_K,
        cam.range('world')[0],
      ).parent
    const out = []
    let [x, y, s] = [0, 0, 1]
    for (let p: Around | undefined = parent; p; p = p.parent) {
      const [ax, ay] = mapPoint(p.map, p.at)
      s /= INSET_K
      x -= ax * s
      y -= ay * s
      out.push({ map: p.map, place: { x, y, s, order: -out.length }, dim })
    }
    return out
  }, [map, parent, cam])
  // Only the city nearest the middle of the screen: some overlap.
  const nearest = useRef<string>(undefined)
  const inside = useMemo(
    () =>
      map
        ? insets.flatMap((c) => {
            if (!c.map) return []
            const [ax, ay] = mapPoint(map, c.at)
            const size = mapSize(c.map)
            return [
              {
                c,
                ax,
                ay,
                place: { x: ax, y: ay, s: INSET_K, order: 2 },
                alpha: () =>
                  nearest.current === c.mapId
                    ? drillFades(
                        cam.h,
                        cam.fitFor(size) * INSET_K,
                        cam.range('world')[0],
                      ).city
                    : 0,
              },
            ]
          })
        : [],
    [map, insets, cam],
  )
  useFrame(() => {
    nearest.current = inside
      .map((o) => ({
        id: o.c.mapId,
        d: Math.hypot(o.ax - cam.cx, o.ay - cam.cy),
      }))
      .sort((a, b) => a.d - b.d)[0]?.id
  })
  return (
    <>
      {world.yolen ? (
        <YolenGlobe
          fade={fade}
          color={world.color}
          look={world.yolen}
          shatter={shatter}
        />
      ) : world.globe ? (
        <Optional>
          <Suspense fallback={<PlainGlobe fade={fade} color={world.color} />}>
            <RosharGlobe fade={fade} map={world.globe} city={map?.city} />
          </Suspense>
        </Optional>
      ) : (
        <PlainGlobe fade={fade} color={world.color} />
      )}
      {around.map((a) => (
        <Optional key={a.map.src}>
          <Suspense fallback={null}>
            <FlatMap fade={fade} map={a.map} place={a.place} dim={a.dim} />
          </Suspense>
        </Optional>
      ))}
      {inside.map(({ c, place, alpha }) => (
        <Optional key={c.mapId}>
          <Suspense fallback={null}>
            <FlatMap fade={fade} map={c.map!} place={place} alpha={alpha} />
          </Suspense>
        </Optional>
      ))}
      {map && (
        <Optional>
          <Suspense fallback={null}>
            <FlatMap
              fade={fade}
              map={map}
              uncharted={
                world.globe &&
                !map.city &&
                map.width === world.globe.width &&
                map.height === world.globe.height
                  ? world.globe.edge
                  : undefined
              }
            />
          </Suspense>
        </Optional>
      )}
    </>
  )
}

/**
 * Moves the camera for a new goal, and between a city's map and the map
 * it's on. Inside the canvas, so it lands in the same commit as the meshes
 * it matches: from outside, a frame could draw the new camera on the old map.
 */
function Handover({
  cam,
  worlds,
  camWorlds,
  goal,
  host,
}: {
  cam: Cam
  worlds: ExplorerWorld[]
  camWorlds: Record<string, CamWorld>
  goal: ExplorerGoal
  host: RefObject<HTMLDivElement | null>
}) {
  // Between a city's map and the map it's on, the view stays put: the
  // camera moves into the other's units before the frame is drawn.
  const shownMap = useRef<{ world: string; map?: ExplorerWorld['map'] }>(
    undefined,
  )
  const rebased = useRef(false)
  useLayoutEffect(() => {
    // Only with the camera moved to match: a frame between would clamp the
    // old view to the new map.
    cam.worlds = camWorlds
    const w = worlds.find((o) => o.id === cam.anchor)
    const was = shownMap.current
    shownMap.current = w && { world: w.id, map: w.map }
    if (!w?.map || !was?.map || was.world !== w.id || was.map.src === w.map.src)
      return
    if (cam.level !== 'world') return
    if (w.map.parent && w.map.parent.map.src === was.map.src)
      cam.rebase('city', camWorlds[w.id].inset!)
    else if (was.map.parent && was.map.parent.map.src === w.map.src)
      cam.rebase('parent', {
        k: INSET_K,
        at: mapPoint(w.map, was.map.parent.at),
      })
    else return
    rebased.current = true
  }, [worlds, cam, camWorlds])

  // Fly whenever the goal changes; cut to the first one.
  const first = useRef(true)
  // Before the frame is drawn, so a flight from a rebase starts at once.
  useLayoutEffect(() => {
    // A zoom between a city and its map: the camera's already there.
    if (rebased.current && goal.cut && !first.current) {
      rebased.current = false
      return
    }
    rebased.current = false
    const h = host.current
    if (h) {
      cam.W = h.clientWidth || cam.W
      cam.H = h.clientHeight || cam.H
    }
    const target = targetFor(goal, worlds, cam)
    if (first.current) cam.jump(target)
    else if (goal.cut)
      cam.jump(goal.cut === true ? target : { ...target, h: goal.cut })
    else cam.planTo(target)
    first.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam, goal.key])

  return null
}

function Rig({ cam, fade }: { cam: Cam; fade: Ref<Fades> }) {
  const { camera, size } = useThree()
  useFrame(() => {
    cam.W = size.width
    cam.H = size.height
    cam.tick(performance.now())
    const d = distFor(cam.h)
    const pc = camera as THREE.PerspectiveCamera
    pc.position.set(cam.cx, cam.cy, PLANE_Z + d)
    pc.near = d * 0.05
    pc.far = d + 400000
    // The globe's framing (see Cam.frame): a lens shift and zoom, so the
    // camera itself stays where its bounds keep it.
    const { k, x, y } = cam.frame
    const { width: W, height: H } = size
    if (k !== 1 || x || y)
      pc.setViewOffset(
        W,
        H,
        W / 2 - (W / 2 + x) / k,
        H / 2 - (H / 2 + y) / k,
        W / k,
        H / k,
      )
    else if (pc.view?.enabled) pc.clearViewOffset()
    pc.updateProjectionMatrix()
    fade.current = cam.fades()
  })
  return null
}

/** Moves the HTML labels and pins with the view, every frame. */
function Projector({
  cam,
  fade,
  place,
}: {
  cam: Cam
  fade: Ref<Fades>
  place: (cam: Cam, f: Fades) => void
}) {
  useFrame(() => place(cam, fade.current))
  return null
}

/** On a city's map, people nearer than this on screen fan out together. */
const CLUSTER_PX = 36
/** Space between fanned-out faces. */
const FACE_GAP = 48
/** On a city's map, this many at one spot get a flag instead of a fan. */
const CITY_FLAG_MIN = 6
/** Off-screen places flagged at the edge, the most crowded first. */
const MAX_EDGE_FLAGS = 4
/** How far from its place a flag may stand, nearest first. */
const GAPS = [14, 40, 70]
/** The arrow an edge flag gains, pointing to its place. */
const EDGE_ARROW = 16
/** Phones and touch screens: smaller flags, the roster as a sheet. */
const PHONE = '(max-width: 639px), (pointer: coarse)'

type FlagParts = {
  flag: HTMLElement
  stem: HTMLElement
  dot: HTMLElement
  ring: HTMLElement | null
  count: HTMLElement
  plus: HTMLElement
}

const MapIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path
      d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
)

/** A face, or its initials (dashed, so it never reads as a count). */
const Face = ({ p }: { p: ExplorerFloatPerson }) => (
  <span className={styles.f} data-letter={p.face ? undefined : ''}>
    {p.face ? <img src={p.face} alt="" decoding="async" /> : p.initials}
  </span>
)

const show = (el: HTMLElement, x: number, y: number, o: number) => {
  // `translate`, not `transform`: it applies outside a CSS `rotate`, so the
  // pins' diamond turn doesn't swing them across the map.
  el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
  el.style.opacity = String(o)
  el.style.visibility = o > 0.05 ? 'visible' : 'hidden'
}

/** Moves a flag's part; flags fade in together, with their layer. */
const put = (el: HTMLElement, x: number, y: number, on = true) => {
  el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
  el.style.visibility = on ? 'visible' : 'hidden'
}

/** How much a map's flags show while it swaps with a city's map. */
const drillFlags = (
  cam: Cam,
  map: NonNullable<ExplorerWorld['map']>,
  cities: ExplorerCity[],
) => {
  const lo = cam.range('world')[0]
  if (map.parent)
    return drillFades(cam.h * INSET_K, cam.fitFor(mapSize(map)) * INSET_K, lo)
      .inside
  // On the map a city's on: close in by one.
  const near = cities.some((c) => {
    if (c.world !== cam.anchor || !c.map) return false
    const [x, y] = cam.toScreen(...mapPoint(map, c.at), PLANE_Z)
    return x > 0 && x < cam.W && y > 0 && y < cam.H
  })
  return near ? drillFades(cam.h, 1, lo).outside : 1
}

/** Sets an attribute only when it changes. */
const attr = (el: HTMLElement, name: string, value?: string) => {
  if (value === undefined) {
    if (el.hasAttribute(name)) el.removeAttribute(name)
  } else if (el.getAttribute(name) !== value) el.setAttribute(name, value)
}

/** Where a goal puts the camera. */
function targetFor(
  goal: ExplorerGoal,
  worlds: ExplorerWorld[],
  cam: Cam,
): CamTarget {
  const world = worlds.find((w) => w.id === goal.world)
  if (!world) return {}
  const map = world.map
  return goal.view === 'pin' && map && goal.pin
    ? { world: world.id, c: mapPoint(map, goal.pin), h: PIN_H }
    : goal.view !== 'globe' && map
      ? {
          world: world.id,
          c: [0, 0],
          h: cam.fillH(world.id) ?? MAP_VIEW_H,
          // Into a city: one even glide down onto it.
          ...(map.city && { ms: 1000 }),
        }
      : { world: world.id }
}

/**
 * The explorer: one continuous zoom from the painted sky of the Cosmere
 * down to a world and its map (Three.js + React Three Fiber; see
 * docs/state-of-my-cosmere.md §6 and docs/cosmere-timeline.md).
 */
export function ExplorerCanvas({
  worlds,
  pins,
  goal,
  current,
  onExplore,
  onPin,
  onBackground,
  onView,
  onGlobe,
  effect,
  people = [],
  onPerson,
  onPlace,
  cities = [],
  onReset,
  children,
  globeTitle,
  dock,
  zoomIn,
}: ExplorerCanvasProps) {
  const camWorlds = useMemo(
    () =>
      Object.fromEntries(
        worlds.map((w): [string, CamWorld] => [
          w.id,
          {
            star: w.star,
            ...(w.map && { map: mapSize(w.map), city: w.map.city }),
            ...(w.map?.parent && {
              inset: {
                k: INSET_K,
                at: mapPoint(w.map.parent.map, w.map.parent.at),
              },
            }),
          },
        ]),
      ),
    [worlds],
  )
  const cam = useMemo(
    () => new Cam(camWorlds, goal.world ?? worlds[0]?.id ?? ''),
    // The camera lives as long as the canvas; worlds update below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const fade = useRef<Fades>(levelFades('sky', cam.h))
  const globeOn = useRef<boolean>(undefined)
  const hovered = useRef<readonly [number, number] | undefined>(undefined)
  const [anchor, setAnchor] = useState(cam.anchor)
  const [level, setLevel] = useState(cam.level)
  const labels = useRef<Map<string, HTMLElement>>(new Map())
  const pinEls = useRef<Map<string, HTMLElement>>(new Map())
  const burstEl = useRef<HTMLDivElement>(null)
  // When the burst started playing, for a globe to show it on its land.
  const shatter = useRef<number>(undefined)
  useEffect(() => () => void (shatter.current = undefined), [effect?.key])
  const faceEls = useRef(new Map<string, HTMLElement>())
  // On a city's map, people close together fan out with leader lines.
  const leadEls = useRef(new Map<string, HTMLElement>())
  // One flag per place: its parts, its spot last frame (to keep it there)
  // and its size, measured once.
  const flagEls = useRef(new Map<string, FlagParts>())
  const flagSpots = useRef(new Map<string, FlagSpot>())
  const flagSizes = useRef(new WeakMap<HTMLElement, number[]>())
  const flagsLayer = useRef<HTMLDivElement>(null)
  // Places folded into another's flag, for lack of room: host -> theirs.
  const merged = useRef(new Map<string, string[]>())
  const chipEls = useRef(new Map<string, HTMLElement>())
  const canvasEl = useRef<HTMLCanvasElement>(undefined)
  const cityEls = useRef(new Map<string, HTMLElement>())
  const rosterEl = useRef<HTMLDivElement>(null)
  const phone = useMemo(
    () => (typeof matchMedia === 'function' ? matchMedia(PHONE) : undefined),
    [],
  )
  const host = useRef<HTMLDivElement>(null)
  const titleEl = useRef<HTMLDivElement>(null)
  const latest = useRef({
    onExplore,
    onView,
    onGlobe,
    goal,
    worlds,
    cities,
    onPlace,
  })
  useEffect(() => {
    latest.current = {
      onExplore,
      onView,
      onGlobe,
      goal,
      worlds,
      cities,
      onPlace,
    }
  })

  useEffect(() => {
    cam.reduced = reducedMotion()
    cam.onZoomOutEdge = () => latest.current.onExplore(undefined)
    // Zoomed all the way in by a city with its own map: open it.
    cam.onZoomInEdge = (sx, sy) => {
      const { worlds, cities, onPlace } = latest.current
      const map = worlds.find((w) => w.id === cam.anchor)?.map
      if (!map) return
      const near = cities
        .filter((c) => c.world === cam.anchor)
        .map((c) => {
          const [x, y] = cam.toScreen(...mapPoint(map, c.at), PLANE_Z)
          return { c, d: Math.hypot(x - sx, y - sy) }
        })
        .sort((a, b) => a.d - b.d)[0]
      if (near && near.d < Math.min(cam.W, cam.H) / 2)
        onPlace?.(near.c.world, near.c.mapId, true)
    }
    const report = () =>
      latest.current.onView?.({ world: cam.anchor, level: cam.level })
    cam.onLevel = (l) => {
      setLevel(l)
      report()
    }
    cam.onAnchor = (a) => {
      setAnchor(a)
      report()
    }
  }, [cam, setAnchor])

  // The globe's framing: in the dock's box, else clear of the title.
  const titled = !!globeTitle
  useEffect(() => {
    const h = host.current
    if (!h) return
    const measure = () => {
      const b = dock?.getBoundingClientRect()
      // A dock not shown (no room for it) leaves the globe where it is.
      if (b && b.width >= 1 && b.height >= 1) {
        const a = h.getBoundingClientRect()
        cam.dock = {
          x: b.left - a.left + b.width / 2,
          y: b.top - a.top + b.height / 2,
          r: Math.min(b.width, b.height) / 2,
        }
      } else if (titled && !dock)
        cam.dock = {
          top: (titleEl.current?.offsetHeight ?? 0) + TITLE_GAP + TITLE_TOP,
        }
      else cam.dock = undefined
    }
    measure()
    if (typeof ResizeObserver !== 'function') return
    const ro = new ResizeObserver(measure)
    for (const el of [h, dock, titleEl.current]) if (el) ro.observe(el)
    return () => ro.disconnect()
  }, [cam, dock, titled])
  useEffect(() => () => void (cam.dock = undefined), [cam])
  const zoomedIn = useRef(zoomIn)
  useEffect(() => {
    if (zoomIn === zoomedIn.current) return
    zoomedIn.current = zoomIn
    const { worlds } = latest.current
    if (worlds.find((w) => w.id === cam.anchor)?.map)
      cam.planTo(targetFor({ world: cam.anchor, key: '' }, worlds, cam))
  }, [cam, zoomIn])

  // The cities' maps on the world in view, ready to zoom into.
  useEffect(() => {
    for (const c of cities) if (c.world === anchor) useTexture.preload(c.src)
  }, [cities, anchor])

  // The cities with maps of their own: their footprint, and a tag to open.
  const placeCities = (cam: Cam, f: Fades) => {
    const w = latest.current.worlds.find((o) => o.id === cam.anchor)
    const map = w?.map
    for (const [id, el] of cityEls.current) {
      const c = latest.current.cities.find((o) => o.mapId === id)
      if (!c?.map || !map || c.world !== cam.anchor || cam.level !== 'world') {
        el.style.visibility = 'hidden'
        continue
      }
      const [x, y] = cam.toScreen(...mapPoint(map, c.at), PLANE_Z)
      const s = cam.scale(PLANE_Z)
      const [mw, mh] = mapSize(c.map)
      const fw = mw * INSET_K * s
      const fh = mh * INSET_K * s
      // The tag stays; the footprint shows once there's room for it, and
      // both give way as the city's own map fades in over it.
      const o =
        f.map *
        tagsFade(cam.h, !!cam.worlds[cam.anchor]?.inset) *
        (1 -
          drillFades(
            cam.h,
            cam.fitFor([mw, mh]) * INSET_K,
            cam.range('world')[0],
          ).city)
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
      el.style.setProperty('--fw', `${fw.toFixed(1)}px`)
      el.style.setProperty('--fh', `${fh.toFixed(1)}px`)
      el.style.setProperty(
        '--foot',
        Math.max(0, Math.min(1, (fh - 36) / 30)).toFixed(2),
      )
      attr(el, 'data-foot', fh >= 44 ? '' : undefined)
      el.style.opacity = o.toFixed(3)
      el.style.visibility = o > 0.05 ? 'visible' : 'hidden'
    }
  }

  const stars = useMemo(() => {
    const seen = new Map<string, readonly [number, number]>()
    for (const w of worlds) seen.set(w.star.join(), w.star)
    return [...seen.values()]
  }, [worlds])

  // Second and later worlds at one star sit a line lower.
  const row = (w: ExplorerWorld) =>
    worlds.filter((o) => o.star === w.star).indexOf(w)

  // The person being shown leads their place's stack.
  const shownId = goal.key.startsWith('person:')
    ? goal.key.slice(7).split('#')[0]
    : undefined
  const places = useMemo(() => placeGroups(people, shownId), [people, shownId])
  const onCity = !!worlds.find((w) => w.id === anchor)?.map?.city
  // On a world's map, every place is a flag; on a city's, only crowds.
  const flagged = (g: FlagGroup) => !onCity || g.members.length >= CITY_FLAG_MIN
  const inFlags = new Set(
    places.filter(flagged).flatMap((g) => g.members.map((p) => p.id)),
  )
  // The current event's place: the flag nearest its pin, if close.
  const eventPin = pins.find((p) => p.id === current)
  const eventKey = onCity
    ? undefined
    : places
        .filter((g) => eventPin && g.world === eventPin.world)
        .map((g) => ({
          g,
          d: Math.hypot(g.at[0] - eventPin!.at[0], g.at[1] - eventPin!.at[1]),
        }))
        .filter((o) => o.d < 40)
        .sort((a, b) => a.d - b.d)[0]?.g.key
  const lostOn = (world: string) =>
    people.filter((p) => p.world === world && !p.at && !p.elsewhere)
  // Who's at a place (or two, folded together), or in no known place.
  const [roster, setRoster] = useState<{
    keys: string[]
    goal: string
    anchor: string
  }>()
  const open =
    roster && roster.goal === goal.key && roster.anchor === anchor
      ? roster
      : undefined
  const toggleRoster = (key: string) =>
    setRoster(
      open?.keys[0] === key
        ? undefined
        : {
            keys: [key, ...(merged.current.get(key) ?? [])],
            goal: goal.key,
            anchor,
          },
    )
  const shownRoster = (() => {
    const [first] = open?.keys ?? []
    if (!first) return undefined
    const lost = worlds.find((w) => first === `unknown:${w.id}`)
    const sections = lost
      ? [{ key: first, name: undefined, members: lostOn(lost.id) }]
      : open!.keys.flatMap((k) => places.filter((g) => g.key === k))
    if (!sections[0]?.members.length) return undefined
    const head = lost ? undefined : places.find((g) => g.key === first)
    return {
      title: lost
        ? `On ${lost.name}, location unknown`
        : (head?.name ?? "Who's here"),
      total: sections.reduce((n, s) => n + s.members.length, 0),
      sections,
      world: head?.world ?? '',
      mapId: head?.mapId,
    }
  })()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setRoster(undefined)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])
  // Flags are measured again once fonts load and when phone sizes apply.
  useEffect(() => {
    const remeasure = () => void (flagSizes.current = new WeakMap())
    void document.fonts?.ready.then(remeasure)
    phone?.addEventListener('change', remeasure)
    return () => phone?.removeEventListener('change', remeasure)
  }, [phone])

  /** A flag's (or chip's) width, compact width and height, measured once. */
  const sizeOf = (el: HTMLElement) => {
    let s = flagSizes.current.get(el)
    if (!s) {
      const edge = el.getAttribute('data-edge')
      const compact = el.hasAttribute('data-compact')
      el.removeAttribute('data-edge')
      el.removeAttribute('data-compact')
      const w = el.offsetWidth
      const h = el.offsetHeight
      el.setAttribute('data-compact', '')
      s = [w, el.offsetWidth, h]
      if (!compact) el.removeAttribute('data-compact')
      if (edge) el.setAttribute('data-edge', edge)
      flagSizes.current.set(el, s)
    }
    return s
  }

  const place = (cam: Cam, f: Fades) => {
    // The controls over the map, which flags keep clear of: read first,
    // before this frame moves anything, so it costs no extra layout.
    const ui: Box[] = []
    let below = 176
    const h = host.current
    if (h && f.map > 0.5) {
      const hr = h.getBoundingClientRect()
      const els = [...(h.parentElement?.children ?? [])].filter((e) => e !== h)
      els.push(...h.querySelectorAll(`.${styles.zoom}, .${styles.credit}`))
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) continue
        const b: Box = [
          r.left - hr.left,
          r.top - hr.top,
          r.right - hr.left,
          r.bottom - hr.top,
        ]
        ui.push([b[0] - 4, b[1] - 4, b[2] + 4, b[3] + 4])
        if (el.tagName === 'NAV') below = b[3] + 8
      }
    }
    for (const w of worlds) {
      const el = labels.current.get(w.id)
      if (!el) continue
      const [x, y] = cam.starOnScreen(w.star)
      const o = f.sky > 0.4 ? Math.min(1, (f.sky - 0.4) / 0.3) : 0
      show(el, x, y, w.id === cam.anchor ? o * (1 - f.planetIn) : o)
    }
    const world = worlds.find((w) => w.id === cam.anchor)
    const drill = world?.map
      ? drillFlags(cam, world.map, latest.current.cities)
      : 1
    for (const p of pins) {
      const el = pinEls.current.get(p.id)
      if (!el) continue
      if (p.world !== cam.anchor || !world?.map) {
        show(el, -999, -999, 0)
        continue
      }
      const [x, y] = mapPoint(world.map, p.at)
      const [sx, sy] = cam.toScreen(x, y, PLANE_Z)
      show(el, sx, sy, f.map > 0.5 ? Math.min(1, (f.map - 0.5) * 3) * drill : 0)
    }
    const map = world?.map
    const mapO = f.map > 0.5 ? Math.min(1, (f.map - 0.5) * 3) * drill : 0
    const W = cam.W
    const H = cam.H
    const view: Box = [0, 0, W, H]
    const inView = (b: Box) => b[0] >= 0 && b[1] >= 0 && b[2] <= W && b[3] <= H
    const toScreen = (at: readonly [number, number]) =>
      cam.toScreen(...mapPoint(map!, at), PLANE_Z)
    const pad = (b: Box, d: number): Box => [
      b[0] - d,
      b[1] - d,
      b[2] + d,
      b[3] + d,
    ]
    const small = !!phone?.matches
    const layer = flagsLayer.current
    if (layer) layer.style.opacity = mapO.toFixed(3)
    const taken = [...ui]
    // Who's on the map, but nobody knows where: a chip under the controls.
    let chip: Box | undefined
    for (const [id, el] of chipEls.current) {
      const on = id === cam.anchor && !!map && mapO > 0
      show(el, 12, below, on ? mapO : 0)
      if (!on) continue
      const [w, , ch] = sizeOf(el)
      chip = [12, below, 12 + w, below + ch]
      taken.push(pad(chip, 4))
    }
    // The faces on a city's map: alone, or fanned out around their spot.
    const groups: {
      at: [number, number]
      ids: string[]
      spots: [number, number][]
    }[] = []
    for (const p of people) {
      const el = faceEls.current.get(p.id)
      if (!el) continue
      const lead = leadEls.current.get(p.id)
      if (lead) show(lead, -999, -999, 0)
      if (inFlags.has(p.id) || p.world !== cam.anchor || !map || !p.at) {
        show(el, -999, -999, 0)
        continue
      }
      const spot = toScreen(p.at)
      const g = groups.find(
        (o) => Math.hypot(o.at[0] - spot[0], o.at[1] - spot[1]) < CLUSTER_PX,
      )
      if (g) {
        g.ids.push(p.id)
        g.spots.push(spot)
      } else groups.push({ at: spot, ids: [p.id], spots: [spot] })
    }
    const faceBox = (x: number, y: number): Box => [
      x - 24,
      y - 24,
      x + 24,
      y + 24,
    ]
    for (const g of groups) {
      if (g.ids.length === 1) {
        show(faceEls.current.get(g.ids[0])!, g.at[0], g.at[1], mapO)
        taken.push(faceBox(...g.at))
        continue
      }
      const cx = g.spots.reduce((a, s) => a + s[0], 0) / g.spots.length
      const cy = g.spots.reduce((a, s) => a + s[1], 0) / g.spots.length
      // Rings around the group, each as full as a face's width allows.
      let r = FACE_GAP
      let ring = 0
      g.ids.forEach((id, k) => {
        const cap = Math.floor((2 * Math.PI * r) / FACE_GAP)
        if (k - ring >= cap) {
          ring = k
          r += FACE_GAP
        }
        const n = Math.min(cap, g.ids.length - ring)
        const a =
          -Math.PI / 2 + ((k - ring) * 2 * Math.PI) / n + (ring ? 0.3 : 0)
        const fx = cx + r * Math.cos(a)
        const fy = cy + r * Math.sin(a)
        show(faceEls.current.get(id)!, fx, fy, mapO)
        taken.push(faceBox(fx, fy))
        const [sx, sy] = g.spots[k]
        const lead = leadEls.current.get(id)!
        lead.style.width = `${Math.hypot(fx - sx, fy - sy).toFixed(1)}px`
        lead.style.rotate = `${Math.atan2(fy - sy, fx - sx).toFixed(4)}rad`
        show(lead, sx, sy, mapO)
      })
    }
    // One flag per place, around it on a stem, clear of the controls, the
    // names painted on the map, the places themselves and other flags.
    const live =
      map && mapO > 0
        ? places.filter((g) => g.world === cam.anchor && flagged(g))
        : []
    const anchors = new Map(live.map((g) => [g.key, toScreen(g.at)]))
    if (live.length) {
      const boxes = (paintedNames as Record<string, Record<string, number[]>>)[
        world?.mapId ?? ''
      ]
      for (const [x0, y0, x1, y1] of Object.values(boxes ?? {}))
        taken.push([...toScreen([x0, y0]), ...toScreen([x1, y1])])
      for (const [x, y] of anchors.values())
        taken.push([x - 6, y - 6, x + 6, y + 6])
      if (eventPin?.world === cam.anchor) {
        const [x, y] = toScreen(eventPin.at)
        taken.push([x - 14, y - 14, x + 14, y + 14])
      }
    }
    const stem = (el: HTMLElement, a: readonly [number, number], b: Box) => {
      const [x, y] = nearest(a, b)
      const len = Math.hypot(x - a[0], y - a[1])
      el.style.width = `${len.toFixed(1)}px`
      el.style.rotate = `${Math.atan2(y - a[1], x - a[0]).toFixed(4)}rad`
      put(el, a[0], a[1], len > 2)
    }
    const drawFlag = (
      parts: FlagParts,
      b: Box,
      compact: boolean,
      edge?: string,
    ) => {
      attr(parts.flag, 'data-compact', compact ? '' : undefined)
      attr(parts.flag, 'data-edge', edge)
      put(parts.flag, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2)
    }
    const hide = (parts: FlagParts) => {
      for (const el of [parts.flag, parts.stem, parts.dot, parts.ring])
        if (el) put(el, -999, -999, false)
    }
    const shown = new Set<string>()
    const placed = new Map<string, Box>()
    const folded = new Map<string, string[]>()
    const off: FlagGroup[] = []
    const order = [...live].sort(
      (a, b) =>
        Number(b.key === eventKey) - Number(a.key === eventKey) ||
        b.members.length - a.members.length ||
        (a.name ?? '').localeCompare(b.name ?? ''),
    )
    for (const g of order) {
      const parts = flagEls.current.get(g.key)
      if (!parts) continue
      shown.add(g.key)
      const a = anchors.get(g.key)!
      if (!inView([...a, ...a])) {
        off.push(g)
        continue
      }
      put(parts.dot, ...a)
      if (parts.ring) put(parts.ring, ...a)
      const [w, cw, fh] = sizeOf(parts.flag)
      const spot = spotFor(
        a,
        w,
        cw,
        fh,
        view,
        taken,
        GAPS,
        flagSpots.current.get(g.key),
      )
      if (spot) {
        flagSpots.current.set(g.key, spot)
        placed.set(g.key, spot.box)
        taken.push(pad(spot.box, 4))
        drawFlag(parts, spot.box, spot.compact)
        stem(parts.stem, a, spot.box)
        continue
      }
      flagSpots.current.delete(g.key)
      put(parts.flag, -999, -999, false)
      // No room: folded into the nearest flag, its stem leading there.
      const to = [...placed.keys()].sort(
        (x, y) =>
          Math.hypot(
            ...(anchors.get(x)!.map((v, i) => v - a[i]) as [number, number]),
          ) -
          Math.hypot(
            ...(anchors.get(y)!.map((v, i) => v - a[i]) as [number, number]),
          ),
      )[0]
      if (!to) {
        hide(parts)
        continue
      }
      folded.set(to, [...(folded.get(to) ?? []), g.key])
      stem(parts.stem, a, placed.get(to)!)
    }
    // Places off screen: a flag at the edge, toward them (a click goes
    // there), slid along the edge clear of the controls.
    off.sort((a, b) => b.members.length - a.members.length)
    off.forEach((g, i) => {
      const parts = flagEls.current.get(g.key)!
      hide(parts)
      if (i >= MAX_EDGE_FLAGS) return
      const [w, , fh] = sizeOf(parts.flag)
      const ew = w + EDGE_ARROW
      const { x, y, arrow } = edgeSpot(anchors.get(g.key)!, ew, fh, view)
      const along = arrow === '▲' || arrow === '▼'
      for (let k = 0; k <= 20; k++) {
        const d = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 20
        const bx = along ? x + d : x
        const by = along ? y : y + d
        const b: Box = [bx - ew / 2, by - fh / 2, bx + ew / 2, by + fh / 2]
        if (!inView(b) || taken.some((t) => hits(b, t))) continue
        taken.push(pad(b, 4))
        drawFlag(parts, b, false, arrow)
        placed.set(g.key, b)
        return
      }
    })
    for (const [key, parts] of flagEls.current) {
      if (!shown.has(key)) {
        hide(parts)
        continue
      }
      // A flag counts the places folded into it, too.
      const extra = folded.get(key) ?? []
      const n = [key, ...extra].reduce(
        (s, k) => s + (places.find((o) => o.key === k)?.members.length ?? 0),
        0,
      )
      const plus = extra.length
        ? ` +${extra.length} place${extra.length > 1 ? 's' : ''}`
        : ''
      if (
        parts.count.dataset.n !== String(n) ||
        (parts.plus.dataset.plus ?? '') !== plus
      ) {
        parts.count.dataset.n = String(n)
        parts.plus.dataset.plus = plus
        flagSizes.current.delete(parts.flag)
      }
    }
    merged.current = folded
    // The roster beside its flag (on phones, a sheet: placed by CSS).
    const pop = rosterEl.current
    const at =
      open &&
      (open.keys[0].startsWith('unknown:') ? chip : placed.get(open.keys[0]))
    if (pop && !small) {
      if (!at) put(pop, -999, -999, false)
      else {
        const [pw, , ph] = sizeOf(pop)
        const cx = (at[0] + at[2]) / 2
        const above = at[1] > H - at[3] && at[1] - ph - 10 >= 8
        const x = Math.min(Math.max(cx - pw / 2, 8), W - pw - 8)
        const y = above
          ? at[1] - ph - 10
          : Math.min(at[3] + 10, Math.max(8, H - ph - 8))
        put(pop, x, y)
        pop.style.setProperty('--caret', `${(cx - x).toFixed(1)}px`)
        attr(pop, 'data-side', above ? 'above' : 'below')
      }
    }
    const globe = f.planetIn > 0.5 && f.flat < 0.5
    if (globe !== globeOn.current) {
      globeOn.current = globe
      latest.current.onGlobe?.(globe)
    }
    const title = titleEl.current
    if (title) {
      const o = cam.level === 'world' ? f.planetIn * (1 - smooth(f.flat)) : 0
      const [cx, cy] = cam.toScreen(0, 0, 0)
      const r = PLANET_R * cam.scale(0)
      show(title, cx, cy - r, o)
      // The globe's radius, for what the title places round the globe.
      title.style.setProperty('--globe-r', `${r.toFixed(1)}px`)
    }
    const burst = burstEl.current
    if (burst && effect) {
      // From its world's star or globe; else the middle of the screen.
      const at = worlds.find((w) => w.id === effect.world)
      const [x, y] = at
        ? cam.starOnScreen(at.star)
        : cam.toScreen(cam.cx, cam.cy, 0)
      show(burst, x, y, 1)
      // It plays once the camera gets there.
      if (!cam.flight && !cam.legs.length) {
        burst.dataset.phase = 'play'
        shatter.current ??= reducedMotion() ? -1e6 : performance.now()
      }
    }
  }

  const burstAt =
    effect?.world && worlds.some((w) => w.id === effect.world)
      ? 'world'
      : 'space'

  const world = worlds.find((w) => w.id === anchor)

  /** Over the globe of a world with a map, so a click would open the map. */
  const overGlobe = (e: { clientX: number; clientY: number }) => {
    const h = host.current
    const f = fade.current
    if (!h || !world?.map || cam.level !== 'world' || cam.flight) return false
    if (planetOpacity(f) < 0.5 || f.map > 0.5) return false
    const r = h.getBoundingClientRect()
    const [cx, cy] = cam.toScreen(0, 0, 0)
    const [ex] = cam.toScreen(PLANET_R, 0, 0)
    return Math.hypot(e.clientX - r.left - cx, e.clientY - r.top - cy) < ex - cx
  }
  const pressed = useRef<{ x: number; y: number }>(undefined)
  const detach = useRef<() => void>(undefined)
  useEffect(() => () => detach.current?.(), [])

  return (
    <div
      ref={host}
      className={styles.explorer}
      onPointerMove={(e) => {
        const on = overGlobe(e)
        if ((host.current!.dataset.zoom === '') !== on)
          host.current!.toggleAttribute('data-zoom', on)
      }}
      onPointerDown={(e) => (pressed.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const p = pressed.current
        pressed.current = undefined
        // A click, not the end of a drag.
        if (!p || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 5) return
        if (!(e.target instanceof HTMLCanvasElement)) return
        setRoster(undefined)
        onBackground?.()
        if (overGlobe(e)) {
          host.current!.removeAttribute('data-zoom')
          cam.planTo(targetFor({ world: world!.id, key: '' }, worlds, cam))
        }
      }}
    >
      <Canvas
        camera={{ fov: FOV }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        // Layout size, not the on-screen box, which transforms can scale.
        resize={{ offsetSize: true }}
        onCreated={({ gl }) => {
          // On the canvas itself, so the HTML buttons above keep working.
          // Not dropped on a lost WebGL context: it can come back, and the
          // view must still pan and zoom when it does.
          canvasEl.current = gl.domElement
          detach.current?.()
          detach.current = cam.attach(gl.domElement)
        }}
      >
        <color attach="background" args={['#03060a']} />
        <Handover
          cam={cam}
          worlds={worlds}
          camWorlds={camWorlds}
          goal={goal}
          host={host}
        />
        <Rig cam={cam} fade={fade} />
        <Stars />
        <Suspense fallback={null}>
          <Sky cam={cam} fade={fade} stars={stars} hovered={hovered} />
        </Suspense>
        {world && (
          <World
            key={world.id}
            world={world}
            cam={cam}
            insets={cities.filter((c) => c.world === world.id)}
            fade={fade}
            shatter={effect?.world === world.id ? shatter : undefined}
          />
        )}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.97}
            luminanceSmoothing={0.05}
            mipmapBlur
          />
        </EffectComposer>
        <Projector cam={cam} fade={fade} place={place} />
        <Projector cam={cam} fade={fade} place={placeCities} />
      </Canvas>
      <div className={styles.overlay}>
        {effect?.kind === 'shattering' && (
          <ShatteringBurst
            key={effect.key}
            ref={burstEl}
            at={burstAt}
            reduced={reducedMotion()}
          />
        )}
        {worlds.map((w) => (
          <button
            key={w.id}
            type="button"
            className={styles.star}
            style={{ '--row': row(w), '--tint': w.color } as CSSProperties}
            ref={(el) =>
              void (el
                ? labels.current.set(w.id, el)
                : labels.current.delete(w.id))
            }
            data-map={w.map ? '' : undefined}
            data-tooltip={`Fly to ${w.name}`}
            onPointerEnter={() => (hovered.current = w.star)}
            onPointerLeave={() => (hovered.current = undefined)}
            onFocus={() => (hovered.current = w.star)}
            onBlur={() => (hovered.current = undefined)}
            onClick={() => onExplore(w.id)}
          >
            {w.name}
          </button>
        ))}
        {cities.map((c) => (
          <div
            key={c.mapId}
            className={styles.city}
            ref={(el) => {
              if (!el) return void cityEls.current.delete(c.mapId)
              cityEls.current.set(c.mapId, el)
              // The tag sits on the map: a wheel or pinch over it still zooms.
              const wheel = (e: WheelEvent) => {
                e.preventDefault()
                canvasEl.current?.dispatchEvent(new WheelEvent('wheel', e))
              }
              el.addEventListener('wheel', wheel, { passive: false })
              return () => el.removeEventListener('wheel', wheel)
            }}
          >
            <span className={styles.cityFoot} />
            <button
              type="button"
              className={styles.cityTag}
              aria-label={`Open the map of ${c.title}`}
              data-tooltip={`Open the map of ${c.title}`}
              onClick={() => onPlace?.(c.world, c.mapId)}
            >
              <MapIcon />
              <span>{c.title}</span>
            </button>
          </div>
        ))}
        {pins.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.pin}
            data-current={p.id === current || undefined}
            ref={(el) =>
              void (el
                ? pinEls.current.set(p.id, el)
                : pinEls.current.delete(p.id))
            }
            data-tooltip={p.title}
            aria-label={p.title}
            onClick={() => onPin?.(p.id)}
          />
        ))}
        {people.map(
          (p) =>
            p.at && (
              <span
                key={`lead:${p.id}`}
                ref={(el) =>
                  void (el
                    ? leadEls.current.set(p.id, el)
                    : leadEls.current.delete(p.id))
                }
                className={styles.lead}
              />
            ),
        )}
        <div className={styles.flags} ref={flagsLayer}>
          {places.filter(flagged).map((g) => {
            const n = g.members.length
            const who = n === 1 ? g.members[0].name : `${n} people`
            return (
              <div
                key={g.key}
                className={styles.flagSet}
                ref={(el) =>
                  void (el
                    ? flagEls.current.set(g.key, {
                        flag: el.querySelector('[data-flag]')!,
                        stem: el.querySelector('[data-stem]')!,
                        dot: el.querySelector('[data-dot]')!,
                        ring: el.querySelector('[data-ring]'),
                        count: el.querySelector('[data-count]')!,
                        plus: el.querySelector('[data-plus]')!,
                      })
                    : flagEls.current.delete(g.key))
                }
              >
                {g.key === eventKey && (
                  <span className={styles.ring} data-ring />
                )}
                <span className={styles.stem} data-stem />
                <span className={styles.dot} data-dot />
                <div
                  className={styles.flag}
                  data-flag
                  data-event={g.key === eventKey || undefined}
                >
                  <button
                    type="button"
                    className={styles.flagBody}
                    aria-label={g.name ? `${who} at ${g.name}` : `${who} here`}
                    aria-expanded={open?.keys[0] === g.key}
                    onClick={(e) => {
                      // At the edge: go there. Else: who's here.
                      const map = worlds.find((w) => w.id === g.world)?.map
                      if (e.currentTarget.parentElement?.dataset.edge && map)
                        cam.planTo({
                          world: g.world,
                          c: mapPoint(map, g.at),
                          h: cam.h,
                        })
                      else toggleRoster(g.key)
                    }}
                  >
                    <span className={styles.stack}>
                      {g.members.slice(0, 3).map((p) => (
                        <Face key={p.id} p={p} />
                      ))}
                    </span>
                    <span className={styles.count} data-count data-n={n} />
                    {g.name && <span className={styles.name}>{g.name}</span>}
                    <span className={styles.plus} data-plus />
                  </button>
                  {g.mapId && (
                    <button
                      type="button"
                      className={styles.mapButton}
                      aria-label={`Open the map of ${g.name}`}
                      data-tooltip={`Open the map of ${g.name}`}
                      onClick={() => onPlace?.(g.world, g.mapId!)}
                    >
                      <MapIcon />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {people.map(
          (p) =>
            p.at &&
            !inFlags.has(p.id) && (
              <button
                key={p.id}
                type="button"
                ref={(el) =>
                  void (el
                    ? faceEls.current.set(p.id, el)
                    : faceEls.current.delete(p.id))
                }
                className={styles.person}
                aria-label={p.name}
                data-tooltip={p.name}
                onClick={() => onPerson?.(p.id)}
              >
                {p.face ? (
                  <img src={p.face} alt="" decoding="async" />
                ) : (
                  p.initials
                )}
              </button>
            ),
        )}
        {worlds.map((w) => {
          const lost = lostOn(w.id)
          return (
            w.map &&
            lost.length > 0 && (
              <button
                key={w.id}
                type="button"
                className={styles.chip}
                ref={(el) =>
                  void (el
                    ? chipEls.current.set(w.id, el)
                    : chipEls.current.delete(w.id))
                }
                aria-label={`${lost.length} on ${w.name}, location unknown`}
                aria-expanded={open?.keys[0] === `unknown:${w.id}`}
                onClick={() => toggleRoster(`unknown:${w.id}`)}
              >
                <span className={styles.stack}>
                  {lost.slice(0, 3).map((p) => (
                    <Face key={p.id} p={p} />
                  ))}
                </span>
                <span>
                  <b>{lost.length}</b> location unknown
                </span>
              </button>
            )
          )
        })}
        {open && shownRoster && (
          <>
            <div
              className={styles.scrim}
              onClick={() => setRoster(undefined)}
            />
            <div
              key={open.keys.join()}
              ref={rosterEl}
              className={styles.roster}
              role="dialog"
              aria-label={shownRoster.title}
            >
              <span className={styles.grab} aria-hidden="true" />
              <h3>
                {shownRoster.title}
                {shownRoster.total > 1 && (
                  <span className={styles.count} data-n={shownRoster.total} />
                )}
              </h3>
              <p className={styles.sub}>Who's here at this moment</p>
              <div className={styles.list}>
                {shownRoster.sections.map((s) => (
                  <Fragment key={s.key}>
                    {shownRoster.sections.length > 1 && (
                      <h4>
                        {s.name ?? 'Here'} · {s.members.length}
                      </h4>
                    )}
                    <ul>
                      {s.members.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            data-tooltip={p.note}
                            onClick={() => {
                              setRoster(undefined)
                              onPerson?.(p.id)
                            }}
                          >
                            <Face p={p} />
                            <span>{p.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Fragment>
                ))}
              </div>
              {shownRoster.mapId && (
                <button
                  type="button"
                  className={styles.open}
                  onClick={() => {
                    setRoster(undefined)
                    onPlace?.(shownRoster.world, shownRoster.mapId!)
                  }}
                >
                  <MapIcon /> Open the map of {shownRoster.title}
                </button>
              )}
              <span className={styles.caret} aria-hidden="true" />
            </div>
          </>
        )}
      </div>
      <div className={styles.zoom} data-keep-clear>
        {children}
        <button
          type="button"
          data-tooltip="Zoom in"
          aria-label="Zoom in"
          onClick={() => cam.zoomBy(0.7)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          data-tooltip="Zoom out (past a world's furthest view, back to the whole Cosmere)"
          aria-label="Zoom out"
          onClick={() => cam.zoomBy(1 / 0.7)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {onReset && (
          <button
            type="button"
            data-tooltip="Reset the view"
            aria-label="Reset the view"
            onClick={onReset}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M4 12a8 8 0 1 0 2.3-5.7M4 3v4h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      {/* Docked, the globe's box shows the credit itself. */}
      {world?.map && level === 'world' && !dock && (
        <div className={styles.credit} data-keep-clear>
          {world.map.credit}
        </div>
      )}
      {globeTitle && (
        <div
          ref={titleEl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            visibility: 'hidden',
          }}
        >
          <div style={{ translate: `-50% calc(-100% - ${TITLE_GAP}px)` }}>
            {globeTitle}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplorerCanvas
