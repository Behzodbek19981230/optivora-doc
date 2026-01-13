import { useRouter } from 'next/router'
import { Box, Card, CardContent, Grid, Stack, Typography, Chip, Button, Divider } from '@mui/material'
import Link from 'next/link'
import Icon from 'src/@core/components/icon'

import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import { TaskPartType, TaskType } from 'src/types/task'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import TaskComments from 'src/views/tasks/view/components/TaskComments'
import TaskAttachment from 'src/views/tasks/view/components/TaskAttachment'
import TaskPartRightActionsPanel from './components/TaskPartRightActionsPanel'
import { useAuth } from 'src/hooks/useAuth'

const TaskPartViewDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const { data: taskPart, refetch: refetchTaskPart } = useQuery<TaskPartType>({
    queryKey: ['task-part', id],
    enabled: !!id,
    queryFn: async (): Promise<TaskPartType> => {
      const res = await DataService.get<TaskPartType>(endpoints.taskPartById(id as string))

      return res.data as TaskPartType
    }
  })

  // Use task_detail from taskPart if available, otherwise fetch by task ID
  const task = (taskPart?.task_detail as TaskType | undefined) || undefined
  const taskId = task?.id || taskPart?.task

  const translateStatus = (s?: string) => {
    if (!s) return '—'
    const toCamel = (str: string) =>
      str
        .split('_')
        .map((seg, i) => (i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
        .join('')

    const key = `documents.status.${toCamel(s)}`
    const translated = String(t(key))

    return translated === key ? s : translated
  }

  const translatePriority = (p?: string) => {
    if (!p) return '—'
    const normalized = p === 'orgently' ? 'orgently' : p === 'normal' ? 'ordinary' : p
    const key = `tasks.priority.${normalized}`
    const translated = String(t(key))

    return translated === key ? p : translated
  }

  const translateType = (tp?: string) => {
    if (!tp) return '—'
    const key = `tasks.type.${tp}`
    const translated = String(t(key))

    return translated === key ? tp : translated
  }

  if (!taskPart) {
    return (
      <Box>
        <Typography>{String(t('common.loading'))}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Left side - Task Part Info */}
        <Grid item xs={12} md={8} lg={9}>
          <Card>
            <CardContent>
              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='h6'>{taskPart.title || String(t('taskParts.view.title'))}</Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Chip
                    label={String(t('taskParts.view.status', { value: translateStatus(taskPart.status) }))}
                    size='small'
                  />
                  {taskPart.start_date && (
                    <Chip
                      label={String(
                        t('taskParts.view.startDate', { value: moment(taskPart.start_date).format('DD.MM.YYYY HH:mm') })
                      )}
                      size='small'
                    />
                  )}
                  {taskPart.end_date && (
                    <Chip
                      label={String(
                        t('taskParts.view.endDate', { value: moment(taskPart.end_date).format('DD.MM.YYYY HH:mm') })
                      )}
                      size='small'
                    />
                  )}
                </Stack>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Task Part Details */}
              <Stack spacing={3}>
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                    {String(t('taskParts.view.fields.title'))}
                  </Typography>
                  <Typography>{taskPart.title || '—'}</Typography>
                </Box>

                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                    {String(t('taskParts.view.fields.department'))}
                  </Typography>
                  <Typography>{taskPart.department_detail?.name || '—'}</Typography>
                </Box>

                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                    {String(t('taskParts.view.fields.assignee'))}
                  </Typography>
                  <Typography>{taskPart.assignee_detail?.fullname || '—'}</Typography>
                </Box>

                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                    {String(t('taskParts.view.fields.status'))}
                  </Typography>
                  <Chip
                    label={translateStatus(taskPart.status)}
                    size='small'
                    color={
                      taskPart.status === 'done'
                        ? 'success'
                        : taskPart.status === 'cancelled'
                        ? 'error'
                        : taskPart.status === 'in_progress'
                        ? 'primary'
                        : 'default'
                    }
                  />
                </Box>

                {taskPart.start_date && (
                  <Box>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                      {String(t('taskParts.view.fields.startDate'))}
                    </Typography>
                    <Typography>{moment(taskPart.start_date).format('DD.MM.YYYY HH:mm')}</Typography>
                  </Box>
                )}

                {taskPart.end_date && (
                  <Box>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                      {String(t('taskParts.view.fields.endDate'))}
                    </Typography>
                    <Typography>{moment(taskPart.end_date).format('DD.MM.YYYY HH:mm')}</Typography>
                  </Box>
                )}

                {taskPart.note && (
                  <Box>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                      {String(t('taskParts.view.fields.note'))}
                    </Typography>
                    <Typography>{taskPart.note}</Typography>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Comments and Attachments */}
              {taskPart.id && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                      {String(t('tasks.view.comments.title'))}
                    </Typography>
                    <TaskComments taskId={null} partId={taskPart.id} />
                  </Box>

                  <Box>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                      {String(t('tasks.view.attachments.title'))}
                    </Typography>
                    <TaskAttachment taskId={null} partId={taskPart.id} />
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right side - Task Info and Actions */}
        <Grid item xs={12} md={4} lg={3}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction='row' alignItems='center' justifyContent='space-between'>
                    <Typography variant='subtitle1'>{String(t('taskParts.view.relatedTask'))}</Typography>
                    {taskId && taskPart.assignee !== user?.id && (
                      <Button
                        size='small'
                        variant='outlined'
                        component={Link}
                        href={`/tasks/view/${taskId}`}
                        startIcon={<Icon icon='mdi:eye' />}
                      >
                        {String(t('common.view'))}
                      </Button>
                    )}
                  </Stack>

                  <Divider />

                  {task ? (
                    <>
                      <Box>
                        <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                          {String(t('tasks.view.document.fields.name'))}
                        </Typography>
                        <Typography>{task.name || '—'}</Typography>
                      </Box>

                      <Box>
                        <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                          {String(t('tasks.view.document.fields.status'))}
                        </Typography>
                        <Chip
                          label={translateStatus(task.status)}
                          size='small'
                          color={
                            task.status === 'done'
                              ? 'success'
                              : task.status === 'cancelled'
                              ? 'error'
                              : task.status === 'in_progress'
                              ? 'primary'
                              : 'default'
                          }
                        />
                      </Box>

                      <Box>
                        <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                          {String(t('tasks.view.document.fields.type'))}
                        </Typography>
                        <Typography>{translateType(task.type)}</Typography>
                      </Box>

                      <Box>
                        <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                          {String(t('tasks.view.document.fields.priority'))}
                        </Typography>
                        <Typography>{translatePriority(task.priority)}</Typography>
                      </Box>

                      {task.input_doc_number && (
                        <Box>
                          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                            {String(t('tasks.view.document.fields.inputDocNumber'))}
                          </Typography>
                          <Typography>{task.input_doc_number}</Typography>
                        </Box>
                      )}

                      {task.output_doc_number && (
                        <Box>
                          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                            {String(t('tasks.view.document.fields.outputDocNumber'))}
                          </Typography>
                          <Typography>{task.output_doc_number}</Typography>
                        </Box>
                      )}

                      {task.start_date && (
                        <Box>
                          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                            {String(t('tasks.view.document.fields.startDate'))}
                          </Typography>
                          <Typography>{moment(task.start_date).format('DD.MM.YYYY')}</Typography>
                        </Box>
                      )}

                      {task.end_date && (
                        <Box>
                          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                            {String(t('tasks.view.document.fields.endDate'))}
                          </Typography>
                          <Typography>{moment(task.end_date).format('DD.MM.YYYY')}</Typography>
                        </Box>
                      )}

                      {task.signed_by_detail && (
                        <Box>
                          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                            {String(t('tasks.view.document.fields.signedBy'))}
                          </Typography>
                          <Typography>{task.signed_by_detail.fullname}</Typography>
                        </Box>
                      )}

                      {task.department_detail && (
                        <Box>
                          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                            {String(t('tasks.view.document.fields.department'))}
                          </Typography>
                          <Typography>{task.department_detail.name}</Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('common.loading'))}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Right Actions Panel */}
            <TaskPartRightActionsPanel
              task={task}
              part={taskPart}
              mutate={() => {
                refetchTaskPart()
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TaskPartViewDetail
