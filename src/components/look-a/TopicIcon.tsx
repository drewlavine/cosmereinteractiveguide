import type { ReactNode } from 'react'

/** Line drawings for a place's Culture topics, in the search icons' style. */
const paths: Record<string, ReactNode> = {
  people: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5" />
      <circle cx="16.5" cy="9.5" r="2.4" />
      <path d="M15.5 14.6c2.6-.3 4.5 1.3 5 4.4" />
    </>
  ),
  society: (
    <>
      <path d="M12 3.5 20.5 19.5h-17Z" />
      <path d="M7.3 12.3h9.4M5.4 15.9h13.2" />
    </>
  ),
  religion: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
  dress: <path d="M9.5 3.5h5l-.8 4 4.8 12.5h-13l4.8-12.5ZM9.4 9.5h5.2" />,
  language: (
    <>
      <path d="M19.5 4.5c-7 1-11.5 6-13 15" />
      <path d="M19.5 4.5c-.5 5-3.5 9-9.3 10.2" />
      <path d="M5 20.5h6" />
    </>
  ),
  arts: (
    <>
      <path d="M9.5 17.5V6l10-2v11.5" />
      <circle cx="7" cy="17.5" r="2.5" />
      <circle cx="17" cy="15.5" r="2.5" />
    </>
  ),
  food: (
    <>
      <path d="M3.5 12.5h17a8.5 7 0 0 1-17 0Z" />
      <path d="M9 4.5c-1 1.5 1 2.5 0 4.5M13 4.5c-1 1.5 1 2.5 0 4.5" />
    </>
  ),
  customs: (
    <>
      <path d="M12 3.5v2" />
      <path d="M8 7.5h8l-.8 11h-6.4Z" />
      <path d="M12 11.5c-1.2 1.2-1.2 2.8 0 4 1.2-1.2 1.2-2.8 0-4Z" />
      <path d="M7 20.5h10" />
    </>
  ),
  warfare: (
    <>
      <path d="M12 3.5c2.5 1.5 5 2 7.5 2 0 7-2.5 12-7.5 15-5-3-7.5-8-7.5-15 2.5 0 5-.5 7.5-2Z" />
      <path d="M12 8v8M9 11h6" />
    </>
  ),
  trade: (
    <>
      <path d="M12 4v16M7.5 20.5h9M5 7h14" />
      <path d="m5 7-2.5 6a2.5 2.5 0 0 0 5 0Z" />
      <path d="m19 7-2.5 6a2.5 2.5 0 0 0 5 0Z" />
    </>
  ),
}

/** A Culture topic's icon, or nothing for a topic without one. */
export function TopicIcon({
  topic,
  className,
}: {
  topic?: string
  className?: string
}) {
  const path = topic && Object.hasOwn(paths, topic) ? paths[topic] : null
  if (!path) return null
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {path}
    </svg>
  )
}
