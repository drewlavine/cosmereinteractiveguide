export const RECENT_SEARCHES_KEY = 'cosmere-guide:recent-searches'
const MAX_RECENT = 6

/** Keys of results the reader opened from search, newest first. */
export function loadRecent(): string[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]',
    )
    return Array.isArray(saved)
      ? saved.filter((key): key is string => typeof key === 'string')
      : []
  } catch {
    return []
  }
}

function save(keys: string[]) {
  try {
    if (keys.length)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(keys))
    else localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Private browsing or full storage: recent searches last for this visit.
  }
}

export function addRecent(key: string) {
  const keys = [key, ...loadRecent().filter((k) => k !== key)]
  save(keys.slice(0, MAX_RECENT))
}

export const clearRecent = () => save([])
