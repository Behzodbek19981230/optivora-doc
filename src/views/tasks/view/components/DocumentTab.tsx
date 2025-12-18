import React from 'react'
import { Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography, useTheme } from '@mui/material'
import { TaskPartType, TaskType } from 'src/types/task'
import TaskParts from './TaskParts'
import { useQuery } from '@tanstack/react-query'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import TaskAttachment from './TaskAttachment'
import TaskComments from './TaskComments'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export default function DocumentTab({
  task,
  selectedPartId,
  setSelectedPartId
}: {
  task: TaskType | undefined
  selectedPartId: number | undefined
  setSelectedPartId: (id: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  // NOTE: Hooks must be called unconditionally on every render.
  // When task is not ready, we disable the query.
  const taskId = task?.id
  const { data: parts } = useQuery<TaskPartType[]>({
    queryKey: ['task-parts', taskId ?? 'none'],
    enabled: !!taskId,
    queryFn: async (): Promise<TaskPartType[]> => {
      const res = await DataService.get(endpoints.taskPart, { task: String(taskId), perPage: 100 })

      // Our mock list returns {results, pagination}; support both shapes.
      const payload: any = res.data

      return (payload?.results || payload || []) as TaskPartType[]
    },
    initialData: []
  })

  if (!task)
    return (
      <Card>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            {String(t('tasks.view.document.notFound'))}
          </Typography>
        </CardContent>
      </Card>
    )

  const statusColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'default'
      case 'in_progress':
        return 'info'
      case 'on_review':
        return 'warning'
      case 'returned':
        return 'warning'
      case 'done':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const priorityColor = (priority?: string) => {
    switch (priority) {
      case 'orgently':
        return 'error'
      case 'normal':
      case 'ordinary':
        return 'default'
      default:
        return 'default'
    }
  }

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
    const normalized = p === 'orgently' ? 'urgently' : p === 'normal' ? 'ordinary' : p
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

  const Item = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Stack spacing={0.75}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
        {value ?? '—'}
      </Typography>
    </Stack>
  )

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              {String(t('tasks.view.document.sections.main'))}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Item
                  label={String(t('tasks.view.document.fields.company'))}
                  value={task.company_detail?.name || task.company}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Item
                  label={String(t('tasks.view.document.fields.department'))}
                  value={task.department_detail?.name || task.department}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item
                  label={String(t('tasks.view.document.fields.taskForm'))}
                  value={task.task_form_detail?.name || task.task_form}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Item
                  label={String(t('tasks.view.document.fields.magazine'))}
                  value={task.list_of_magazine_detail?.name || task.list_of_magazine}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item
                  label={String(t('tasks.view.document.fields.signedBy'))}
                  value={task.signed_by_detail?.fullname || task.signed_by}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Item
                  label={String(t('tasks.view.document.fields.responsiblePerson'))}
                  value={task.sending_respon_person ?? '—'}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              {String(t('tasks.view.document.sections.dates'))}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Item label={String(t('tasks.view.document.fields.startDate'))} value={task.start_date} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Item label={String(t('tasks.view.document.fields.endDate'))} value={task.end_date} />
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
                  value={moment(task.created_time).format('DD.MM.YYYY HH:mm')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item label={String(t('tasks.view.document.fields.createdBy'))} value={task.created_by} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <TaskParts parts={parts} selectedPartId={selectedPartId} setSelectedPartId={setSelectedPartId} />
      </Grid>
      <Grid item xs={12}>
        <TaskAttachment taskId={task.id} partId={selectedPartId ?? undefined} />
      </Grid>
      <Grid item xs={12}>
        <TaskComments taskId={task.id} partId={selectedPartId ?? undefined} />
      </Grid>
    </Grid>
  )
}
