import { useMemo, useEffect } from 'react'
import { Tabs, Tab, Box, Chip, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import DocumentTable from 'src/views/documents/DocumentTable'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'

export enum DocumentStatus {
  All = 'all',
  InProgress = 'in-progress',
  Accepted = 'accepted',
  Cancelled = 'cancelled',
  Completed = 'completed',
  Returned = 'returned'
}

const statuses: { key: DocumentStatus; label: string }[] = [
  { key: DocumentStatus.All, label: 'All' },
  { key: DocumentStatus.InProgress, label: 'In Progress' },
  { key: DocumentStatus.Accepted, label: 'Accepted' },
  { key: DocumentStatus.Cancelled, label: 'Cancelled' },
  { key: DocumentStatus.Completed, label: 'Completed' },
  { key: DocumentStatus.Returned, label: 'Returned' }
]

const normalize = (s: string): DocumentStatus => (s as DocumentStatus) || DocumentStatus.All

const DocumentTabs = ({ currentStatus }: { currentStatus: DocumentStatus }) => {
  const router = useRouter()
  const value = useMemo(() => normalize(currentStatus), [currentStatus])

  useEffect(() => {
    // If route has no status, redirect to default
    if (!currentStatus) {
      router.replace(`/documents/${DocumentStatus.All}`)
    }
  }, [currentStatus, router])

  const handleChange = (_: any, newValue: DocumentStatus) => {
    router.push(`/documents/${newValue}`)
  }

  // Fetch totals for badges per status (server reports pagination.total)
  const totals = {
    [DocumentStatus.All]: useFetchList<any>(endpoints.documents, { page: 1, perPage: 1, status: DocumentStatus.All })
      .total,
    [DocumentStatus.InProgress]: useFetchList<any>(endpoints.documents, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.InProgress
    }).total,
    [DocumentStatus.Accepted]: useFetchList<any>(endpoints.documents, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.Accepted
    }).total,
    [DocumentStatus.Cancelled]: useFetchList<any>(endpoints.documents, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.Cancelled
    }).total,
    [DocumentStatus.Completed]: useFetchList<any>(endpoints.documents, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.Completed
    }).total,
    [DocumentStatus.Returned]: useFetchList<any>(endpoints.documents, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.Returned
    }).total
  }

  return (
    <Box>
      <Tabs value={value} onChange={handleChange} variant='scrollable' allowScrollButtonsMobile>
        {statuses.map(s => (
          <Tab
            key={s.key}
            value={s.key}
            label={
              <Stack direction='row' spacing={1} alignItems='center'>
                <span>{s.label}</span>
                <Chip size='small' color='error' label={totals[s.key] ?? 0} sx={{ height: 20 }} />
              </Stack>
            }
          />
        ))}
      </Tabs>

      <Box sx={{ mt: 4 }}>
        <DocumentTable status={value} />
      </Box>
    </Box>
  )
}

export default DocumentTabs
