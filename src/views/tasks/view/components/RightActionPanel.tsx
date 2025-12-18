import { Card, CardContent, Stack, Typography, Chip, Divider, Button, Box, Skeleton } from '@mui/material'
import React from 'react'
import { TaskType, TaskPartType } from 'src/types/task'
import { DataService } from 'src/configs/dataService'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import DocumentTemplate from './DocumentTemplate'
import RightActionsDrawer from './RightActionsDrawer'

const RightActionsPanel = ({ task, part, mutate }: { task?: TaskType; part?: TaskPartType; mutate?: () => void }) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [open, setOpen] = React.useState(false)
  const taskId = task?.id
  const partId = part?.id
  const qc = useQueryClient()
  const mutateAndRefresh = async () => {
    // Make sure we're invalidating the same query key used by this component's useQuery
    // The useQuery above uses ['/task/with-parts/by-id/', taskId] as the key, so invalidate that
    try {
      if (partId) await qc.invalidateQueries({ queryKey: ['task-part', partId], refetchType: 'active' })
      if (taskId) {
        // Invalidate the specific combined task+parts query so this panel refetches
        await qc.invalidateQueries({ queryKey: ['/task/with-parts/by-id/', taskId], refetchType: 'active' })
        mutate?.()
      }
    } catch (err) {
      // Keep failures silent but log for debugging
      // eslint-disable-next-line no-console
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {isLoading ? <Skeleton variant='rectangular' height={100} /> : data && <DocumentTemplate fullTask={data} />}

      <Card sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
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
                  <Typography variant='body2'>{part?.title || String(t('common.notSet'))}</Typography>
                </Stack>
                <Typography variant='caption' color='text.secondary'>
                  {String(t('tasks.view.actions.partStatus'))}
                </Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                  {part?.status ? (
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

                        const key = `documents.status.${toCamel(part.status as string)}`
                        const translated = String(t(key))
                        return translated === key ? (part.status as string) : translated
                      })()}
                    />
                  ) : null}
                </Stack>
                {user?.id === part?.assignee_detail?.id &&
                  partId &&
                  (part?.status === 'new' || part?.status === 'in_progress' || part?.status === 'returned') && (
                    <Button size='small' variant='contained' onClick={() => setOpen(true)}>
                      {String(t('tasks.view.actions.ensureExecution') || 'Ensure execution')}
                    </Button>
                  )}
                {user?.id === task?.signed_by_detail?.id && partId && part?.status === 'on_review' && (
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
      <RightActionsDrawer
        open={open}
        toggle={() => {
          setOpen(!open)
          mutateAndRefresh()
        }}
        taskId={taskId ? Number(taskId) : undefined}
        partId={partId ? Number(partId) : undefined}
        part={part}
        task={task}
      />
    </Box>
  )
}

export default RightActionsPanel
