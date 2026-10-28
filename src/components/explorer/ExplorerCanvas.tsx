/* Three.js objects (materials, the camera) are mutated every frame, as
   React Three Fiber intends; the React Compiler's rules don't apply. */
/* oxlint-disable react/immutability, react/use-memo */
import { useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import * as THREE from 'three'
import { Cam, type CamTarget, type CamWorld } from './camera'
import styles from './Explorer.module.css'
import { GLOBE_BASIS, latLonToMap } from './globe'
import {
  distFor,
  FOV,
  levelFades,
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
import { reducedMotion } from './webgl'
import type { ExplorerPin, ExplorerWorld, YolenLook } from './worlds'

/** Where the explorer should be: the sky, or a world and how close. */
export interface ExplorerGoal {
  /** None: the whole Cosmere. */
  world?: string
  view?: 'globe' | 'map' | 'pin'
  pin?: readonly [number, number]
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
  /** A special effect for the current event, e.g. the Shattering's burst. */
  effect?: ExplorerEffect
  /** Shards, floating above the worlds they're at; hover names them. */
  shards?: ExplorerShard[]
  onShard?: (id: string) => void
  /**
   * Notable characters, floating above their world beside its Shards; on
   * its map, a face pin where they are, else in a "location unknown" list.
   */
  people?: ExplorerFloatPerson[]
  onPerson?: (id: string) => void
  /** The rest, past the first few on a world ("+N"). */
  onMorePeople?: () => void
  /** Back to the default view of what's being looked at. */
  onReset?: () => void
  /** More controls, above the zoom buttons. */
  children?: ReactNode
}

export interface ExplorerFloatPerson {
  id: string
  name: string
  world: string
  /** Where on its map, if known. */
  at?: readonly [number, number]
  face?: string
  initials: string
}

export interface ExplorerShard {
  id: string
  name: string
  world: string
  art: string
  /** Splintered, Shattered or dead: greyed out. */
  faded?: boolean
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

const smooth = (m: number) => m * m * (3 - 2 * m)
const planetOpacity = (f: Fades) => Math.max(f.planet, f.flat) * f.planetIn

/** Roshar's globe, textured, unrolling into its map as you close in. */
function RosharGlobe({
  fade,
  map,
}: {
  fade: Ref<Fades>
  map: NonNullable<ExplorerWorld['globe']>
}) {
  const tex = useTexture(map.texture)
  const gl = useThree((s) => s.gl)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = gl.capabilities.getMaxAnisotropy()
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(PLANET_R, 256, 160)
    const uv = g.getAttribute('uv')
    const flat = new Float32Array(uv.count * 3)
    for (let i = 0; i < uv.count; i++) {
      const [rx, ry] = latLonToMap(
        uv.getY(i) * 180 - 90,
        uv.getX(i) * 360 - 180,
      )
      const [a, b, c, d, e, f] = map.fromRoshar ?? [1, 0, 0, 1, 0, 0]
      const [x, y] = mapPoint(map, [a * rx + b * ry + e, c * rx + d * ry + f])
      flat.set([x, y, PLANE_Z - 3], i * 3)
    }
    g.setAttribute('flatPos', new THREE.BufferAttribute(flat, 3))
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
        },
        vertexShader: `attribute vec3 flatPos; uniform mat3 orient; uniform float morph;
          varying vec2 vUv; varying vec3 vN; varying vec3 vView;
          void main(){
            vUv = uv;
            vec3 p = mix(orient * position, flatPos, morph);
            vN = mix(orient * normal, vec3(0., 0., 1.), morph);
            vView = cameraPosition - p;
            gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.);
          }`,
        fragmentShader: `uniform sampler2D map; uniform float opacity, morph; uniform vec3 lightDir;
          varying vec2 vUv; varying vec3 vN; varying vec3 vView;
          void main(){
            vec3 n = normalize(vN), v = normalize(vView);
            vec3 col = texture2D(map, vUv).rgb;
            col *= mix(0.5 + 0.7 * max(dot(n, lightDir), 0.), 1., morph);
            vec2 g = vUv * vec2(36., 18.);
            vec2 f = abs(fract(g - .5) - .5) / max(fwidth(g), 1e-4);
            float line = 1. - min(min(f.x, f.y) * 1.4, 1.);
            col = mix(col, vec3(.8, .9, 1.), line * .13 * (1. - morph));
            float rim = pow(1. - max(dot(n, v), 0.), 2.5);
            col = mix(col, vec3(.35, .62, 1.), rim * .45 * (1. - morph));
            gl_FragColor = vec4(col, opacity);
            #include <colorspace_fragment>
          }`,
        transparent: true,
      }),
    [tex],
  )
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    // Spins in space; turns to face you, then unrolls, as you close in.
    const f = fade.current
    const o = planetOpacity(f)
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
}: {
  fade: Ref<Fades>
  map: NonNullable<ExplorerWorld['map']>
}) {
  const tex = useTexture(map.src)
  const gl = useThree((s) => s.gl)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = gl.capabilities.getMaxAnisotropy()
  const m = useRef<THREE.MeshBasicMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const [w, h] = mapSize(map)
  useFrame(() => {
    m.current!.opacity = fade.current.map
    mesh.current!.visible = fade.current.map > 0.01
  })
  return (
    <mesh ref={mesh} position={[0, 0, PLANE_Z]} renderOrder={1}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        ref={m}
        map={tex}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
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
}: {
  world: ExplorerWorld
  fade: Ref<Fades>
  shatter?: Ref<number | undefined>
}) {
  const map = world.map
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
            <RosharGlobe fade={fade} map={world.globe} />
          </Suspense>
        </Optional>
      ) : (
        <PlainGlobe fade={fade} color={world.color} />
      )}
      {map && (
        <Optional>
          <Suspense fallback={null}>
            <FlatMap fade={fade} map={map} />
          </Suspense>
        </Optional>
      )}
    </>
  )
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

/** Characters shown above a world; the rest wait behind "+N". */
const MAX_PEOPLE = 6

/**
 * Lays a world's groups (Shards, then characters) along an arc over its
 * globe of screen radius `r`: Shards to the left of the top, characters to
 * the right, each item facing out (Shards) or upright, its label above.
 */
function arc(el: HTMLElement, r: number) {
  const groups = [...el.querySelectorAll<HTMLElement>('[data-group]')]
  const laid = groups.map((g) => {
    const h = Number(g.dataset.h)
    const R = r + 12 + h / 2
    const items = [...g.querySelectorAll<HTMLElement>('[data-item]')]
    const step = Number(g.dataset.w) / R
    return { g, h, R, items, step, span: (items.length - 1) * step }
  })
  const gap = 28 / Math.max(r, 1)
  const at = (x: HTMLElement, R: number, a: number, turn: boolean) => {
    x.style.setProperty('--a', `${a}rad`)
    x.style.transform =
      `translate(${(R * Math.sin(a)).toFixed(1)}px, ${(-R * Math.cos(a)).toFixed(1)}px)` +
      ` translate(-50%, -50%)${turn ? ` rotate(${a.toFixed(3)}rad)` : ''}`
  }
  laid.forEach(({ g, h, R, items, step, span }, k) => {
    const mid =
      laid.length < 2 ? 0 : (k ? 1 : -1) * (gap / 2 + span / 2 + step / 2)
    const angles = items.map((_, i) => mid - span / 2 + i * step)
    items.forEach((x, i) => at(x, R, angles[i], x.hasAttribute('data-turn')))
    // Curved along the arc just outside the items, from the first one's
    // leading edge, over a line that spans the group.
    const letters = g.querySelectorAll<HTMLElement>('[data-label] > span')
    if (!letters.length) return
    const Rl = R + h / 2 + 16
    const start = angles[0] - items[0].offsetWidth / 2 / R
    let a = start
    for (const l of letters) {
      const w = l.offsetWidth
      at(l, Rl, a + w / 2 / Rl, true)
      a += w / Rl
    }
    const end = Math.max(
      a,
      angles[items.length - 1] + items[items.length - 1].offsetWidth / 2 / R,
    )
    const Rr = Rl - 9
    const p = (t: number) =>
      `${(Rr * Math.sin(t)).toFixed(1)} ${(-Rr * Math.cos(t)).toFixed(1)}`
    g.querySelector('[data-line] path')?.setAttribute(
      'd',
      `M ${p(start)} A ${Rr} ${Rr} 0 0 1 ${p(end)}`,
    )
  })
}

/** A label laid out letter by letter, for `arc` to bend. */
const Curved = ({ text }: { text: string }) => (
  <>
    <svg className={styles.groupLine} data-line aria-hidden>
      <path />
    </svg>
    <span className={styles.groupLabel} data-label aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden>
          {c === ' ' ? '\u00a0' : c}
        </span>
      ))}
    </span>
  </>
)

const show = (el: HTMLElement, x: number, y: number, o: number) => {
  // `translate`, not `transform`: it applies outside a CSS `rotate`, so the
  // pins' diamond turn doesn't swing them across the map.
  el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
  el.style.opacity = String(o)
  el.style.visibility = o > 0.05 ? 'visible' : 'hidden'
}

/** Where a goal puts the camera. */
function targetFor(goal: ExplorerGoal, worlds: ExplorerWorld[]): CamTarget {
  const world = worlds.find((w) => w.id === goal.world)
  if (!world) return {}
  const map = world.map
  return goal.view === 'pin' && map && goal.pin
    ? { world: world.id, c: mapPoint(map, goal.pin), h: PIN_H }
    : goal.view !== 'globe' && map
      ? { world: world.id, c: [0, 0], h: MAP_VIEW_H }
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
  effect,
  shards = [],
  onShard,
  people = [],
  onPerson,
  onMorePeople,
  onReset,
  children,
}: ExplorerCanvasProps) {
  const camWorlds = useMemo(
    () =>
      Object.fromEntries(
        worlds.map((w): [string, CamWorld] => [
          w.id,
          { star: w.star, ...(w.map && { map: mapSize(w.map) }) },
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
  cam.worlds = camWorlds
  const fade = useRef<Fades>(levelFades('sky', cam.h))
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
  const unknownEls = useRef(new Map<string, HTMLElement>())
  // One group per world: its Shards and notable characters.
  const floatEls = useRef<Map<string, HTMLElement>>(new Map())
  const host = useRef<HTMLDivElement>(null)
  const latest = useRef({ onExplore, onView, goal, worlds })
  useEffect(() => {
    latest.current = { onExplore, onView, goal, worlds }
  })

  useEffect(() => {
    cam.reduced = reducedMotion()
    cam.onZoomOutEdge = () => latest.current.onExplore(undefined)
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

  // Fly whenever the goal changes; cut to the first one.
  const first = useRef(true)
  useEffect(() => {
    const h = host.current
    if (h) {
      cam.W = h.clientWidth || cam.W
      cam.H = h.clientHeight || cam.H
    }
    const target = targetFor(goal, latest.current.worlds)
    if (first.current) cam.jump(target)
    else cam.planTo(target)
    first.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam, goal.key])

  const stars = useMemo(() => {
    const seen = new Map<string, readonly [number, number]>()
    for (const w of worlds) seen.set(w.star.join(), w.star)
    return [...seen.values()]
  }, [worlds])

  // Second and later worlds at one star sit a line lower.
  const row = (w: ExplorerWorld) =>
    worlds.filter((o) => o.star === w.star).indexOf(w)

  const place = (cam: Cam, f: Fades) => {
    for (const w of worlds) {
      const el = labels.current.get(w.id)
      if (!el) continue
      const [x, y] = cam.starOnScreen(w.star)
      const o = f.sky > 0.4 ? Math.min(1, (f.sky - 0.4) / 0.3) : 0
      show(el, x, y, w.id === cam.anchor ? o * (1 - f.planetIn) : o)
    }
    const world = worlds.find((w) => w.id === cam.anchor)
    for (const p of pins) {
      const el = pinEls.current.get(p.id)
      if (!el) continue
      if (p.world !== cam.anchor || !world?.map) {
        show(el, -999, -999, 0)
        continue
      }
      const [x, y] = mapPoint(world.map, p.at)
      const [sx, sy] = cam.toScreen(x, y, PLANE_Z)
      show(el, sx, sy, f.map > 0.5 ? Math.min(1, (f.map - 0.5) * 3) : 0)
    }
    const mapO = f.map > 0.5 ? Math.min(1, (f.map - 0.5) * 3) : 0
    for (const p of people) {
      const el = faceEls.current.get(p.id)
      if (!el) continue
      if (p.world !== cam.anchor || !world?.map || !p.at) {
        show(el, -999, -999, 0)
        continue
      }
      const [x, y] = mapPoint(world.map, p.at)
      const [sx, sy] = cam.toScreen(x, y, PLANE_Z)
      show(el, sx, sy, mapO)
    }
    for (const [id, el] of unknownEls.current)
      show(el, 0, 0, id === cam.anchor && world?.map ? mapO : 0)
    // Up close, around their world's globe; never out in the sky.
    for (const [id, el] of floatEls.current) {
      const w = worlds.find((o) => o.id === id)
      if (!w) {
        show(el, -999, -999, 0)
        continue
      }
      if (w.id !== cam.anchor || f.planetIn <= 0.5) {
        show(el, -999, -999, 0)
        continue
      }
      // Laid out as at the world's globe view, then scaled with the globe,
      // so they stay on its top as you zoom and go as it unrolls.
      const [cx, cy] = cam.toScreen(0, 0, 0)
      const globe = cam.scale(0, cam.globeH())
      el.style.scale = (cam.scale(0) / globe).toFixed(4)
      show(el, cx, cy, f.planetIn * (1 - smooth(f.flat)))
      arc(el, PLANET_R * globe)
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
        onBackground?.()
        if (overGlobe(e)) {
          host.current!.removeAttribute('data-zoom')
          cam.planTo(targetFor({ world: world!.id, key: '' }, worlds))
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
          detach.current?.()
          detach.current = cam.attach(gl.domElement)
        }}
      >
        <color attach="background" args={['#03060a']} />
        <Rig cam={cam} fade={fade} />
        <Stars />
        <Suspense fallback={null}>
          <Sky cam={cam} fade={fade} stars={stars} hovered={hovered} />
        </Suspense>
        {world && (
          <World
            key={world.id}
            world={world}
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
        {[...new Set([...shards, ...people].map((o) => o.world))].map(
          (world) => {
            const here = shards.filter((sh) => sh.world === world)
            const all = people.filter((p) => p.world === world)
            const folk = all.slice(0, MAX_PEOPLE)
            const morePeople = all.length - folk.length
            return (
              <div
                key={world}
                className={styles.float}
                ref={(el) =>
                  void (el
                    ? floatEls.current.set(world, el)
                    : floatEls.current.delete(world))
                }
              >
                {here.length > 0 && (
                  <div data-group="shards" data-h={66} data-w={32}>
                    <Curved text="Shards" />
                    {here.map((sh, i) => (
                      <button
                        key={sh.id}
                        type="button"
                        className={styles.shard}
                        style={{ '--i': i } as CSSProperties}
                        data-item
                        data-turn
                        data-faded={sh.faded || undefined}
                        aria-label={sh.name}
                        onClick={() => onShard?.(sh.id)}
                      >
                        <img src={sh.art} alt="" decoding="async" />
                        <span aria-hidden className={styles.floatName}>
                          {sh.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {folk.length > 0 && (
                  <div
                    className={styles.people}
                    data-group="people"
                    data-h={66}
                    data-w={36}
                  >
                    <Curved text="Notable Characters" />
                    {folk.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        className={styles.medallion}
                        style={{ '--i': i } as CSSProperties}
                        data-item
                        data-turn
                        aria-label={p.name}
                        onClick={() => onPerson?.(p.id)}
                      >
                        <svg
                          width="30"
                          height="53"
                          viewBox="0 0 35 62"
                          aria-hidden
                        >
                          <defs>
                            <linearGradient id={`pg-${p.id}`} x2="0" y2="1">
                              <stop offset="0" stopColor="#f1d9a0" />
                              <stop offset="1" stopColor="#8a6a2c" />
                            </linearGradient>
                            <clipPath id={`pc-${p.id}`}>
                              <circle cx="17.5" cy="17.5" r="14" />
                            </clipPath>
                          </defs>
                          {/* A round head tapering, along its tangents, to a point. */}
                          <path
                            d="M2.18 23.62A16.5 16.5 0 1 1 32.82 23.62L17.5 62Z"
                            fill={`url(#pg-${p.id})`}
                            stroke="#f1e6c8"
                            strokeWidth="0.75"
                          />
                          {/* A lit facet down the left of the point. */}
                          <path
                            d="M4.8 28L17.5 62V31.5Z"
                            fill="#fff"
                            opacity="0.22"
                          />
                          <circle cx="17.5" cy="17.5" r="14" fill="#1c2a35" />
                          {p.face ? (
                            <image
                              href={p.face}
                              x="3.5"
                              y="3.5"
                              width="28"
                              height="28"
                              preserveAspectRatio="xMidYMin slice"
                              clipPath={`url(#pc-${p.id})`}
                            />
                          ) : (
                            <text x="17.5" y="21" textAnchor="middle">
                              {p.initials}
                            </text>
                          )}
                        </svg>
                        <span aria-hidden className={styles.floatName}>
                          {p.name}
                        </span>
                      </button>
                    ))}
                    {morePeople > 0 && (
                      <button
                        type="button"
                        className={styles.more}
                        data-item
                        data-tooltip="Everyone, in the Notable characters panel"
                        onClick={onMorePeople}
                      >
                        +{morePeople}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          },
        )}
        {people.map(
          (p) =>
            p.at && (
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
          const lost = people.filter((p) => p.world === w.id && !p.at)
          return (
            w.map &&
            lost.length > 0 && (
              <section
                key={w.id}
                className={styles.unknown}
                ref={(el) =>
                  void (el
                    ? unknownEls.current.set(w.id, el)
                    : unknownEls.current.delete(w.id))
                }
              >
                <h3>On {w.name}, location unknown</h3>
                <ul>
                  {lost.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => onPerson?.(p.id)}>
                        <span className={styles.face}>
                          {p.face ? (
                            <img src={p.face} alt="" decoding="async" />
                          ) : (
                            p.initials
                          )}
                        </span>
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          )
        })}
      </div>
      <div className={styles.zoom}>
        {children}
        <button
          type="button"
          data-tooltip="Zoom in"
          aria-label="Zoom in"
          onClick={() => cam.zoomBy(0.7)}
        >
          +
        </button>
        <button
          type="button"
          data-tooltip="Zoom out (past a world's furthest view, back to the whole Cosmere)"
          aria-label="Zoom out"
          onClick={() => cam.zoomBy(1 / 0.7)}
        >
          −
        </button>
        {onReset && (
          <button
            type="button"
            data-tooltip="Reset the view"
            aria-label="Reset the view"
            onClick={onReset}
          >
            ⟲
          </button>
        )}
      </div>
      {world?.map && level === 'world' && (
        <div className={styles.credit}>{world.map.credit}</div>
      )}
    </div>
  )
}

export default ExplorerCanvas
