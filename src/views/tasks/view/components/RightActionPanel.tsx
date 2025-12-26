import { Card, CardContent, Stack, Typography, Chip, Divider, Button, Box, Skeleton } from '@mui/material'
import React from 'react'
import { TaskType, TaskPartType } from 'src/types/task'
import { DataService } from 'src/configs/dataService'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import DocumentTemplate from './DocumentTemplate'
import RightActionsDrawer from './RightActionsDrawer'
import ShowAssignes from './ShowAssignes'

const RightActionsPanel = ({ task, part, mutate }: { task?: TaskType; part?: TaskPartType; mutate?: () => void }) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [open, setOpen] = React.useState(false)
  const taskId = task?.id
  const partId = part?.id
  const qc = useQueryClient()
  const mutateAndRefresh = async () => {
    try {
      if (partId) {
        await qc.invalidateQueries({ queryKey: ['task-part', partId], refetchType: 'active' })
        if (taskId) {
          await qc.invalidateQueries({ queryKey: ['task-comments', taskId, partId], refetchType: 'active' })
          await qc.invalidateQueries({ queryKey: ['task-attachments', taskId, partId], refetchType: 'active' })
        }

        await qc.invalidateQueries({ queryKey: ['/task/with-parts/by-id/', taskId], refetchType: 'active' })
        mutate?.()
      }
      if (taskId) {
        // Refresh side lists that depend on task/part (comments & attachments)
        await qc.invalidateQueries({ queryKey: ['task-comments', taskId, null], refetchType: 'active' })
        await qc.invalidateQueries({ queryKey: ['task-attachments', taskId, 'all'], refetchType: 'active' })

        await qc.invalidateQueries({ queryKey: ['/task/with-parts/by-id/', taskId], refetchType: 'active' })
        mutate?.()
      }
    } catch (err) {
      console.error('mutateAndRefresh failed', err)
    }
  }

  const { data, isLoading } = useQuery<{ parts: TaskPartType[]; task: TaskType }>({
    queryKey: ['/task/with-parts/by-id/', taskId],
    queryFn: async () => {
      const params = {
        task_id: Number(taskId)
      }
      const res = await DataService.post<{ parts: TaskPartType[]; task: TaskType }>('/task/with-parts/by-id/', params)

      return res.data || { parts: [], task: { id: 0, title: '', description: '' } }
    },
    enabled: !!taskId,
    staleTime: 10_000
  })

  // Use fresh data from query to avoid stale props (e.g. approve button not disappearing until refresh)
  const liveTask = data?.task || task
  const livePart = React.useMemo(() => {
    if (!partId) return part
    const found = data?.parts?.find(p => p.id === partId)

    return found || part
  }, [data?.parts, part, partId])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {isLoading ? <Skeleton variant='rectangular' height={100} /> : data && <DocumentTemplate fullTask={data} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='subtitle1'>{String(t('tasks.view.actions.title'))}</Typography>

            <Divider />

            {partId ? (
              <Stack spacing={1}>
                <Typography variant='caption' color='text.secondary'>
                  {String(t('tasks.view.actions.selectedSection'))}
                </Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Typography variant='body2'>{livePart?.title || String(t('common.notSet'))}</Typography>
                </Stack>
                <Typography variant='caption' color='text.secondary'>
                  {String(t('tasks.view.actions.partStatus'))}
                </Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                  {livePart?.status ? (
                    <Chip
                      size='small'
                      color='info'
                      variant='outlined'
                      label={(() => {
                        const toCamel = (s: string) =>
                          s
                            .split('_')
                            .map((seg, i) => (i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
                            .join('')

                        const key = `documents.status.${toCamel(livePart.status as string)}`
                        const translated = String(t(key))

                        return translated === key ? (livePart.status as string) : translated
                      })()}
                    />
                  ) : null}
                </Stack>
                {user?.id === livePart?.assignee_detail?.id &&
                  partId &&
                  (livePart?.status === 'new' ||
                    livePart?.status === 'in_progress' ||
                    livePart?.status === 'returned') && (
                    <Button size='small' variant='contained' onClick={() => setOpen(true)}>
                      {String(t('tasks.view.actions.ensureExecution') || 'Ensure execution')}
                    </Button>
                  )}
                {user?.id === liveTask?.signed_by_detail?.id && partId && livePart?.status === 'on_review' && (
                  <Button size='small' variant='contained' onClick={() => setOpen(true)}>
                    {String(t('tasks.view.actions.approve') || 'Approve')}
                  </Button>
                )}
              </Stack>
            ) : (
              <Stack spacing={0.5}>
                <Typography variant='body2'>{String(t('tasks.view.actions.noPartSelected'))}</Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
      <ShowAssignes parts={data?.parts} />
      <RightActionsDrawer
        open={open}
        toggle={() =>
          setOpen(prev => {
            const next = !prev

            // Only refresh when drawer is being closed
            if (prev && !next) {
              void mutateAndRefresh()
            }

            return next
          })
        }
        taskId={taskId ? Number(taskId) : undefined}
        partId={partId ? Number(partId) : undefined}
        part={livePart}
        task={liveTask}
      />
    </Box>
  )
}

export default RightActionsPanel
