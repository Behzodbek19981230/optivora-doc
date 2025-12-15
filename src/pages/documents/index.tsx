import { useEffect } from 'react'
import { useRouter } from 'next/router'

const DocumentsIndexPage = () => {
  const router = useRouter()
  useEffect(() => {
    router.replace('/documents/all')
  }, [router])

  return null
}

export default DocumentsIndexPage
