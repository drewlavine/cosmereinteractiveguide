/** An id for each title, unique within the list, for links to a part of a page. */
export function slugs(prefix: string, titles: string[]) {
  const seen = new Set<string>()
  return titles.map((title) => {
    const base = `${prefix}-${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`
    let id = base
    for (let n = 2; seen.has(id); n++) id = `${base}-${n}`
    seen.add(id)
    return id
  })
}
