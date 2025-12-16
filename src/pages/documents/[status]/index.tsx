import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardHeader, CardContent } from '@mui/material'
import DocumentTabs, { DocumentStatus } from 'src/views/documents/DocumentTabs'
import { useTranslation } from 'react-i18next'

const DocumentsStatusPage = () => {
  const router = useRouter()
  const { status } = router.query as { status?: string }
  const { t } = useTranslation()

  useEffect(() => {
    if (!status) return
    const isValid = Object.values(DocumentStatus).includes(status as DocumentStatus)
    if (!isValid) {
      router.replace('/404')
    }
  }, [status, router])

  return (
    <Card>
      <CardHeader title={String(t('documents.title'))} />
      <CardContent>
        <DocumentTabs currentStatus={(status as DocumentStatus) || DocumentStatus.New} />
      </CardContent>
    </Card>
  )
}

export default DocumentsStatusPage
