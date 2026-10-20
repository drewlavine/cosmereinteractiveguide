import { Fragment, useCallback, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router'
import { linkIndex, linkText, textLinks } from '../data/textLinks'
import { useCanSee } from '../state/reveal'

/**
 * Turns prose into text with links to the other pages it names that the
 * reader can see, each once per `linked` set (one per section), never the
 * page itself (`selfKey`, e.g. "character:kaladin").
 */
export function useLinkText(selfKey?: string) {
  const canSee = useCanSee()
  const index = useMemo(() => linkIndex(textLinks(canSee)), [canSee])
  return useCallback(
    (text: string, linked = new Set<string>()): ReactNode => (
      <>
        {linkText(text, index, linked, selfKey).map((part, i) =>
          typeof part === 'string' ? (
            <Fragment key={i}>{part}</Fragment>
          ) : (
            <Link key={i} to={part.href}>
              {part.text}
            </Link>
          ),
        )}
      </>
    ),
    [index, selfKey],
  )
}

export type LinkTextFn = ReturnType<typeof useLinkText>
