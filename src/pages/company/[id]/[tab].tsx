import { useRouter } from 'next/router'
import { useEffect } from 'react'

// This route is kept only to gracefully redirect to a static-export-friendly page.
// We can't use getStaticPaths with fallback in static export, so redirect to /company/view?id=...

const CompanyRedirectPage = () => {
  const router = useRouter()
  useEffect(() => {
    const { id, tab } = router.query
    if (id) {
      const t = typeof tab === 'string' ? tab : 'profile'
      // Preserve tab in query if needed in future
      router.replace({ pathname: '/company/view', query: { id, tab: t } })
    }
  }, [router])

  return null
}

export default CompanyRedirectPage
