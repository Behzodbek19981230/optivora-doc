import { Card, CardHeader, CardContent } from '@mui/material'
import DocumentTabs, { DocumentStatus } from 'src/views/documents/DocumentTabs'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'src/spa/router/useRouter'

const DocumentsStatusPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const raw = (router.query as any)?.status
  const status =
    typeof raw === 'string' ? raw : Array.isArray(raw) ? (raw[0] as string | undefined) : undefined
  const isValid = status && (Object.values(DocumentStatus) as string[]).includes(status)
  const safeStatus = (isValid ? status : DocumentStatus.New) as DocumentStatus

  return (
    <Card>
      <CardHeader title={String(t('documents.title'))} />
      <CardContent>
        <DocumentTabs currentStatus={safeStatus} />
      </CardContent>
    </Card>
  )
}

export default DocumentsStatusPage
