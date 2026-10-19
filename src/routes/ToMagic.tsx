import { Navigate, useLocation } from 'react-router'

/** The Magic tab was called Abilities; send old links to the new path. */
export function ToMagic() {
  const { pathname, search, hash } = useLocation()
  return (
    <Navigate
      replace
      to={pathname.replace(/^\/abilities/, '/magic') + search + hash}
    />
  )
}
