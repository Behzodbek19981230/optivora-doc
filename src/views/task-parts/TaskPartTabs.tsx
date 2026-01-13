import { useMemo, useEffect } from 'react'
import { Tabs, Tab, Box, Chip, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import TaskPartTable from 'src/views/task-parts/TaskPartTable'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'

export enum TaskPartStatus {
  New = 'new',
  InProgress = 'in_progress',
  OnReview = 'on_review',
  Cancelled = 'cancelled',
  Done = 'done',
  Returned = 'returned'
}

const statuses: { key: TaskPartStatus; labelKey: string }[] = [
  { key: TaskPartStatus.New, labelKey: 'documents.status.new' },
  { key: TaskPartStatus.InProgress, labelKey: 'documents.status.inProgress' },
  { key: TaskPartStatus.OnReview, labelKey: 'documents.status.onReview' },
  { key: TaskPartStatus.Cancelled, labelKey: 'documents.status.cancelled' },
  { key: TaskPartStatus.Done, labelKey: 'documents.status.done' },
  { key: TaskPartStatus.Returned, labelKey: 'documents.status.returned' }
]

const normalize = (s: string): TaskPartStatus => (s as TaskPartStatus) || TaskPartStatus.New

const TaskPartTabs = ({
  currentStatus,
  ownerFilter = 'all'
}: {
  currentStatus: TaskPartStatus
  ownerFilter?: 'mine' | 'all'
}) => {
  const router = useRouter()
  const value = useMemo(() => normalize(currentStatus), [currentStatus])
  const { t } = useTranslation()

  // Keep auth hook so this component updates when user changes (token refresh, logout, etc.)
  useAuth()

  useEffect(() => {
    // If route has no status, redirect to default
    if (!currentStatus) {
      router.replace(`/task-parts/${TaskPartStatus.New}`)
    }
  }, [currentStatus, router])

  const handleChange = (_: any, newValue: TaskPartStatus) => {
    router.push(`/task-parts/${newValue}`)
  }

  // Fetch totals for badges per status (server reports pagination.total)
  // For task-part, we use the same endpoint but filter by status
  const listEndpoint = endpoints.taskPart
  const totals = {
    [TaskPartStatus.New]: useFetchList(listEndpoint, { page: 1, limit: 1, status: TaskPartStatus.New }).total,
    [TaskPartStatus.InProgress]: useFetchList(listEndpoint, {
      page: 1,
      limit: 1,
      status: TaskPartStatus.InProgress
    }).total,
    [TaskPartStatus.OnReview]: useFetchList(listEndpoint, {
      page: 1,
      limit: 1,
      status: TaskPartStatus.OnReview
    }).total,
    [TaskPartStatus.Cancelled]: useFetchList(listEndpoint, {
      page: 1,
      limit: 1,
      status: TaskPartStatus.Cancelled
    }).total,
    [TaskPartStatus.Done]: useFetchList(listEndpoint, {
      page: 1,
      limit: 1,
      status: TaskPartStatus.Done
    }).total,
    [TaskPartStatus.Returned]: useFetchList(listEndpoint, {
      page: 1,
      limit: 1,
      status: TaskPartStatus.Returned
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
                <span>{String(t(s.labelKey))}</span>
                <Chip size='small' color='error' label={totals[s.key] ?? 0} sx={{ height: 20 }} />
              </Stack>
            }
          />
        ))}
      </Tabs>

      <Box sx={{ mt: 4 }}>
        <TaskPartTable status={value} ownerFilter={ownerFilter} />
      </Box>
    </Box>
  )
}

export default TaskPartTabs
