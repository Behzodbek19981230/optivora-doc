import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Divider,
  Button,
  Box,
  Grid,
  List,
  ListItemButton,
  ListItemText
} from '@mui/material'
import React from 'react'
import { TaskType, TaskPartType } from 'src/types/task'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import RightActionsDrawer from 'src/views/tasks/view/components/RightActionsDrawer'
import TaskAttachment from 'src/views/tasks/view/components/TaskAttachment'
import moment from 'moment'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'

const TaskPartRightActionsPanel = ({
  task,
  part,
  mutate
}: {
  task?: TaskType
  part?: TaskPartType
  mutate?: () => void
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [open, setOpen] = React.useState(false)
  const partId = part?.id
  const qc = useQueryClient()

  // Get task ID from part.task_detail if available, otherwise use task prop
  const taskIdFromPart = (part?.task_detail as TaskType | undefined)?.id
  const taskId = taskIdFromPart || task?.id
  const livePart = part

  // Fetch full task data using task ID
  const { data: fetchedTask } = useQuery<TaskType>({
    queryKey: ['task', taskId],
    enabled: !!taskId,
    queryFn: async (): Promise<TaskType> => {
      const res = await DataService.get<TaskType>(endpoints.taskById(String(taskId)))

      return res.data as TaskType
    }
  })

  // Use fetched task data if available, otherwise fallback to task prop or part.task_detail
  const liveTask = fetchedTask || task || (part?.task_detail as TaskType | undefined)

  const { data: allParts } = useQuery<TaskPartType[]>({
    queryKey: ['task-parts', taskId ?? 'none'],
    enabled: !!taskId,
    queryFn: async (): Promise<TaskPartType[]> => {
      const res = await DataService.get(endpoints.taskPart, { task: String(taskId), limit: 200 })

      const payload: any = res.data

      return (payload?.results || payload || []) as TaskPartType[]
    },
    initialData: []
  })

  const doneParts = (allParts || []).filter(p => p?.status === 'done')

  const [selectedDonePartId, setSelectedDonePartId] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (selectedDonePartId != null) return
    if (!doneParts.length) return

    setSelectedDonePartId(doneParts[0].id)
  }, [doneParts, selectedDonePartId])

  const mutateAndRefresh = async () => {
    try {
      if (partId) {
        await qc.invalidateQueries({ queryKey: ['task-part', partId], refetchType: 'active' })
        if (taskId) {
          await qc.invalidateQueries({ queryKey: ['task-comments', taskId, partId], refetchType: 'active' })
          await qc.invalidateQueries({ queryKey: ['task-attachments', taskId, partId], refetchType: 'active' })
        }
        mutate?.()
      }
    } catch (err) {
      console.error('mutateAndRefresh failed', err)
    }
  }

  const formatDisplayDateTime = (value?: string) => {
    if (!value) return '—'
    const m = moment(value)

    return m.isValid() ? m.format('DD.MM.YYYY HH:mm') : String(value)
  }

  const Item = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Stack spacing={0.75}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Stack>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Task Information Cards */}
      {liveTask && (
        <>
          <Card>
            <CardContent>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                {String(t('tasks.view.document.sections.main'))}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.company'))}
                    value={liveTask.company_detail?.name || liveTask.company}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.department'))}
                    value={liveTask.department_detail?.name || liveTask.department}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.taskForm'))}
                    value={liveTask.task_form_detail?.name || liveTask.task_form}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.magazine'))}
                    value={liveTask.list_of_magazine_detail?.name || liveTask.list_of_magazine}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.signedBy'))}
                    value={liveTask.signed_by_detail?.fullname || liveTask.signed_by}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.responsiblePerson'))}
                    value={liveTask.respon_person ?? '—'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.inputDocNumber'))}
                    value={liveTask.input_doc_number ?? '—'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.outputDocNumber'))}
                    value={liveTask.output_doc_number ?? '—'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                {String(t('tasks.view.document.sections.dates'))}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.startDate'))}
                    value={formatDisplayDateTime(liveTask.start_date)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.endDate'))}
                    value={formatDisplayDateTime(liveTask.end_date)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                {String(t('tasks.view.document.sections.system'))}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.createdAt'))}
                    value={liveTask.created_time ? moment(liveTask.created_time).format('DD.MM.YYYY HH:mm') : '—'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Item
                    label={String(t('tasks.view.document.fields.createdBy'))}
                    value={liveTask.created_by_detail?.fullname || liveTask.created_by}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

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

      {taskId ? (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant='subtitle1'>
                  {String(t('documents.status.done'))} {String(t('tasks.view.actions.selectedSection'))}
                </Typography>
                <Chip size='small' color='success' variant='outlined' label={doneParts.length} />
              </Box>

              {doneParts.length ? (
                <List dense disablePadding>
                  {doneParts.map(p => {
                    const dept = p.department_detail?.name || String(p.department)
                    const assignee = p.assignee_detail?.fullname || String(p.assignee)

                    return (
                      <ListItemButton
                        key={p.id}
                        selected={p.id === selectedDonePartId}
                        onClick={() => setSelectedDonePartId(p.id)}
                        sx={{ borderRadius: 2, mb: 0.5 }}
                      >
                        <ListItemText
                          primary={p.title || `#${p.id}`}
                          secondary={`${dept} • ${assignee}`}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                          secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        />
                      </ListItemButton>
                    )
                  })}
                </List>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {String(t('tasks.view.actions.noPartSelected'))}
                </Typography>
              )}

              {selectedDonePartId ? (
                <TaskAttachment taskId={taskId} partId={selectedDonePartId} />
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {String(t('tasks.view.attachments.empty'))}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      ) : null}

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

export default TaskPartRightActionsPanel
