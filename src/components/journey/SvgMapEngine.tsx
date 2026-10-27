import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { PanZoom, type PanZoomHandle, type Transform } from '../PanZoom'
import type { MapEngineProps } from './MapEngine'
import { assetUrl } from '../../data/assetUrl'

/**
 * The SVG map engine: the image in a PanZoom (mouse, touch pan and pinch),
 * with the layers in an SVG laid exactly over it.
 */
export function SvgMapEngine({ image, label, layers, ref }: MapEngineProps) {
  const panZoom = useRef<PanZoomHandle>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [width, setWidth] = useState(0)

  // The image is drawn at the canvas's width; track it to size the layers.
  useEffect(() => {
    const el = canvas.current!
    setWidth(el.clientWidth)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      flyTo(box, { animate, maxZoom = 1.5, inset } = {}) {
        // Rendered pixels per image pixel, read now in case of a resize.
        const el = canvas.current
        const k = (el?.clientWidth ?? 0) / image.width
        if (!el || !k) return
        panZoom.current?.flyTo(
          {
            x: box.x * k,
            y: box.y * k,
            width: box.width * k,
            height: box.height * k,
          },
          { animate, maxScale: maxZoom / k, inset },
        )
      },
    }),
    [image.width],
  )

  const onTransform = useCallback((t: Transform) => setScale(t.scale), [])
  const k = width / image.width || 1

  return (
    <PanZoom label={label} ref={panZoom} onTransform={onTransform}>
      <div className="journey-canvas" ref={canvas}>
        <img
          src={assetUrl(image.src)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          draggable={false}
        />
        <svg
          viewBox={`0 0 ${image.width} ${image.height}`}
          className="journey-layers"
          aria-hidden
        >
          {layers(k * scale)}
        </svg>
      </div>
    </PanZoom>
  )
}
