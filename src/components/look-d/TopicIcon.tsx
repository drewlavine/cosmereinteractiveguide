import type { CultureTopic } from '../../data/types'

/** Line drawings, one per Culture topic, in a 20×20 box. */
const paths: Record<CultureTopic, string> = {
  people:
    'M7 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2.5 16.5c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5M13.5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM13 10.6c2.6-.3 4.5 1.4 4.5 4.4',
  society: 'M3 15.5h14M3.5 15.5 2.5 7l4.5 3.5L10 4l3 6.5L17.5 7l-1 8.5',
  religion:
    'M10 2.5c2 3 4.5 5 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2 1-3.2 2-4.2.3 1.6 1 2.4 2 2.7-.5-2.6-.2-4.8.5-7z',
  dress:
    'M8 2.5h4M8 2.5c0 2-.5 3.5-1.5 4.5L8 8.5l-4 9h12l-4-9L13.5 7C12.5 6 12 4.5 12 2.5',
  language: 'M4 4.5h12M4 8.5h9M4 12.5h11M4 16.5h6',
  arts: 'M8 15V4.5l9-2v11M6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM15 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  food: 'M2.5 10.5h15a7.5 6 0 0 1-15 0zM7 7.5c-1-1 1-2 0-3.5M10.5 7.5c-1-1 1-2 0-3.5M14 7.5c-1-1 1-2 0-3.5',
  customs:
    'M2 4c5 2 11 2 16 0M4.5 4.8l1.2 4.2 1.8-3.6M9 5.5l1 4.2 1-4.2M12.5 5.4l1.8 3.6 1.2-4.2M10 9.7v7.8',
  warfare:
    'M10 2.5 16.5 5v4.5c0 4-2.8 6.8-6.5 8.5-3.7-1.7-6.5-4.5-6.5-8.5V5zM10 6v8M7 9h6',
  trade:
    'M10 3v14M6.5 17h7M4 6h12M4 6l-2.5 5h5zM16 6l-2.5 5h5zM1.5 11a2.5 1.5 0 0 0 5 0M13.5 11a2.5 1.5 0 0 0 5 0',
}

/** A Culture topic's icon; nothing for a topic without one. */
export function TopicIcon({
  topic,
  className,
}: {
  topic?: CultureTopic
  className?: string
}) {
  if (!topic) return null
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[topic]} />
    </svg>
  )
}
