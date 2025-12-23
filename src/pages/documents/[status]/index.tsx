import type { GetStaticPaths, GetStaticProps } from 'next/types'
import { Card, CardHeader, CardContent } from '@mui/material'
import DocumentTabs, { DocumentStatus } from 'src/views/documents/DocumentTabs'
import { useTranslation } from 'react-i18next'

type Props = { status: DocumentStatus }

const DocumentsStatusPage = ({ status }: Props) => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader title={String(t('documents.title'))} />
      <CardContent>
        <DocumentTabs currentStatus={status || DocumentStatus.New} />
      </CardContent>
    </Card>
  )
}

export default DocumentsStatusPage

export const getStaticPaths: GetStaticPaths = async () => {
  // Next.js `output: 'export'` needs all dynamic paths at build time.
  const statuses = Object.values(DocumentStatus) as DocumentStatus[]

  return {
    paths: statuses.map(s => ({ params: { status: s } })),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<Props> = async ctx => {
  const raw = ctx.params?.status
  const status = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined
  const isValid = status && (Object.values(DocumentStatus) as string[]).includes(status)

  if (!isValid) return { notFound: true }

  return {
    props: { status: status as DocumentStatus }
  }
}
