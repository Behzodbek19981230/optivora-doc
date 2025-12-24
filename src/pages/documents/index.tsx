import { useEffect } from 'react'
import { useRouter } from 'src/spa/router/useRouter'

const DocumentsIndexPage = () => {
  const router = useRouter()
  useEffect(() => {
    router.replace('/documents/new')
  }, [router])

  return null
}

export default DocumentsIndexPage
