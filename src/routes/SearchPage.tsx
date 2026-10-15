import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { SearchIcon } from '../components/SearchIcon'
import { addRecent } from '../search/recent'
import { hiddenNote, useSearch } from '../search/useSearch'

/** Every result for `?q=`, grouped by kind, so a search can be shared. */
export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const { search } = useSearch()
  const results = useMemo(
    () => (query.trim() ? search(query) : undefined),
    [query, search],
  )

  return (
    <article className="search-page" aria-labelledby="search-page-title">
      <h1 id="search-page-title">Search</h1>
      <div className="search-field">
        <SearchIcon name="search" />
        <input
          type="search"
          aria-label="Search the Cosmere"
          placeholder="Search planets, places, characters…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) =>
            setParams(event.target.value ? { q: event.target.value } : {}, {
              replace: true,
            })
          }
        />
      </div>

      {results && (
        <p className="search-summary">
          {results.total
            ? `${results.total} ${results.total === 1 ? 'result' : 'results'} for “${query.trim()}”`
            : `No results for “${query.trim()}”.`}
        </p>
      )}
      {results && results.hidden > 0 && (
        <p className="search-hidden">{hiddenNote(results.hidden)}</p>
      )}

      {results?.groups.map(({ source, hits }) => (
        <section
          key={source.id}
          className="search-page-group"
          aria-labelledby={`search-page-${source.id}`}
        >
          <h2 id={`search-page-${source.id}`}>
            {source.label} <span>{hits.length}</span>
          </h2>
          <ul>
            {hits.map((hit) => (
              <li key={hit.key}>
                <Link
                  to={hit.href}
                  className="search-option"
                  onClick={() => addRecent(hit.key)}
                >
                  <SearchIcon name={source.icon} />
                  <span className="search-option-text">
                    <span className="search-option-title">{hit.title}</span>
                    {hit.subtitle && (
                      <span className="search-option-subtitle">
                        {hit.subtitle}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
