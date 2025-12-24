import { forwardRef } from 'react'
import { Link as RRLink } from 'react-router-dom'

type UrlObject = { pathname: string; query?: Record<string, any> }

const buildSearch = (query?: Record<string, any>) => {
  if (!query) return ''
  const usp = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v == null) return
    usp.set(k, String(v))
  })
  const s = usp.toString()
  return s ? `?${s}` : ''
}

const toPath = (href: string | UrlObject) => {
  if (typeof href === 'string') return href
  return `${href.pathname}${buildSearch(href.query)}`
}

type Props = any

const Link = forwardRef<HTMLAnchorElement, Props>(function LinkCompat(props, ref) {
  const { href, children, to, ...rest } = props
  const dest = to ?? toPath(href)
  return (
    <RRLink ref={ref} to={dest} {...rest}>
      {children}
    </RRLink>
  )
})

export default Link
