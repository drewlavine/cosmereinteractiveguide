import { useEffect, useRef, useState, type ReactNode } from 'react'

/** The whole picture, uncropped, over everything; Escape or a click closes. */
export function ArtViewer({
  src,
  alt,
  credit,
  onClose,
}: {
  src: string
  alt: string
  credit: ReactNode
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current
    if (!el || el.open) return
    if (el.showModal) el.showModal()
    else el.setAttribute('open', '')
    // showModal would focus the artist link; start on Close instead.
    el.querySelector<HTMLButtonElement>('.art-viewer-close')?.focus()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="art-viewer"
      aria-label="Picture"
      onClose={onClose}
      onCancel={onClose}
      // Keep keys (Escape, arrows) from also driving maps or full screen.
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <figure>
        <img src={src} alt={alt} />
        <figcaption>Art by {credit}</figcaption>
      </figure>
      <button
        type="button"
        className="art-viewer-close"
        onClick={onClose}
        aria-label="Close picture"
      >
        ×
      </button>
    </dialog>
  )
}

/** A credited piece of art on a page; clicking it shows the whole picture. */
export function PortraitArt({
  src,
  alt,
  artist,
  artistUrl,
  className = 'character-portrait',
}: {
  src: string
  alt: string
  artist: string
  artistUrl?: string
  className?: string
}) {
  const [viewing, setViewing] = useState(false)
  const credit = artistUrl ? (
    <a href={artistUrl} target="_blank" rel="noreferrer">
      {artist}
    </a>
  ) : (
    artist
  )
  return (
    <figure className={className}>
      <button
        type="button"
        className="art-open"
        onClick={() => setViewing(true)}
        aria-label="View the whole picture"
      >
        <img src={src} alt={alt} />
        <span className="art-hint" aria-hidden>
          ⤢
        </span>
      </button>
      <figcaption>Art by {credit}</figcaption>
      {viewing && (
        <ArtViewer
          src={src}
          alt={alt}
          credit={credit}
          onClose={() => setViewing(false)}
        />
      )}
    </figure>
  )
}
