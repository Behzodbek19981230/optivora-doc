import { Card, CardHeader, CardContent } from '@mui/material'
import { useTranslation } from 'react-i18next'
import DocumentTable from 'src/views/documents/DocumentTable'

export default function ArchiveDocumentsPage() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader title={String(t('nav.archive'))} />
      <CardContent>
        <DocumentTable status='archive' />
      </CardContent>
    </Card>
  )
}
