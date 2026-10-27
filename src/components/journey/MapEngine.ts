import type { ReactNode, Ref } from 'react'

/**
 * The map engine behind JourneyMap: draws a map image with layers on top
 * and moves the view. The SVG engine (SvgMapEngine) is the only one today;
 * a WebGL one (e.g. PixiJS) could replace it behind the same interface.
 * All coordinates are in the map image's own pixels.
 */

export interface MapBox {
  x: number
  y: number
  width: number
  height: number
}

export interface MapEngineHandle {
  /**
   * Pans and zooms to centre the box, even past the map's edge; animated
   * unless `animate` is false. `inset`: screen pixels covered at each edge
   * by panels over the map, so the box is centred in the clear part.
   */
  flyTo(
    box: MapBox,
    options?: {
      animate?: boolean
      maxZoom?: number
      inset?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
    },
  ): void
}

export interface MapEngineProps {
  image: { src: string; width: number; height: number; alt: string }
  /** Accessible name of the map region. */
  label: string
  /**
   * Drawn in place of the image when it has no `src` (a map the page draws
   * itself, e.g. a star chart), in the image's own pixels.
   */
  background?: ReactNode
  /**
   * Layers in image pixels. `zoom` is screen pixels per image pixel, so
   * markers and lines can keep a steady on-screen size.
   */
  layers: (zoom: number) => ReactNode
  ref?: Ref<MapEngineHandle>
}
