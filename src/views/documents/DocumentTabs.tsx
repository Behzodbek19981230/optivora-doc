import { useMemo, useEffect } from 'react'
import { Tabs, Tab, Box, Chip, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import DocumentTable from 'src/views/documents/DocumentTable'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'

export enum DocumentStatus {
  New = 'new',
  InProgress = 'in_progress',
  OnReview = 'on_review',
  Cancelled = 'cancelled',
  Done = 'done',
  Returned = 'returned'
}

const statuses: { key: DocumentStatus; label: string }[] = [
  { key: DocumentStatus.New, label: 'New' },
  { key: DocumentStatus.InProgress, label: 'In Progress' },
  { key: DocumentStatus.OnReview, label: 'On Review' },
  { key: DocumentStatus.Cancelled, label: 'Cancelled' },
  { key: DocumentStatus.Done, label: 'Done' },
  { key: DocumentStatus.Returned, label: 'Returned' }
]

const normalize = (s: string): DocumentStatus => (s as DocumentStatus) || DocumentStatus.New

const DocumentTabs = ({ currentStatus }: { currentStatus: DocumentStatus }) => {
  const router = useRouter()
  const value = useMemo(() => normalize(currentStatus), [currentStatus])

  useEffect(() => {
    // If route has no status, redirect to default
    if (!currentStatus) {
      router.replace(`/documents/${DocumentStatus.New}`)
    }
  }, [currentStatus, router])

  const handleChange = (_: any, newValue: DocumentStatus) => {
    router.push(`/documents/${newValue}`)
  }

  // Fetch totals for badges per status (server reports pagination.total)
  const totals = {
    [DocumentStatus.New]: useFetchList(endpoints.task, { page: 1, perPage: 1, status: DocumentStatus.New }).total,
    [DocumentStatus.InProgress]: useFetchList(endpoints.task, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.InProgress
    }).total,
    [DocumentStatus.OnReview]: useFetchList(endpoints.task, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.OnReview
    }).total,
    [DocumentStatus.Cancelled]: useFetchList(endpoints.task, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.Cancelled
    }).total,
    [DocumentStatus.Done]: useFetchList(endpoints.task, {
      page: 1,
      perPage: 1,
      status: DocumentStatus.Done
    }).total,
    [DocumentStatus.Returned]: useFetchList(endpoints.task, {
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
