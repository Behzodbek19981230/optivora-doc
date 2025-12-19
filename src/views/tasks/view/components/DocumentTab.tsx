import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Autocomplete
} from '@mui/material'
import { TaskPartType, TaskType } from 'src/types/task'
import TaskParts from './TaskParts'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import TaskAttachment from './TaskAttachment'
import TaskComments from './TaskComments'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useFetchList } from 'src/hooks/useFetchList'
import useThemedToast from 'src/@core/hooks/useThemedToast'

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
  const toast = useThemedToast()
  const queryClient = useQueryClient()

  const { data: departments } = useFetchList<{ id: number; name: string }>(endpoints.department, {
    page: 1,
    perPage: 100
  })
  const { data: users } = useFetchList<{ id: number; fullname: string }>(endpoints.users, {
    page: 1,
    perPage: 100
  })

  const [editPart, setEditPart] = useState<TaskPartType | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    department: 0,
    assignee: 0,
    start_date: '',
    end_date: '',
    note: ''
  })

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

  const handleEdit = (id: number) => {
    const part = parts.find(p => p.id === id)
    if (part) {
      setEditPart(part)
      setEditForm({
        title: part.title,
        department: part.department,
        assignee: part.assignee,
        start_date: part.start_date,
        end_date: part.end_date,
        note: part.note
      })
    }
  }

  const handleSaveEdit = async () => {
    if (!editPart || !taskId) return
    try {
      await DataService.put(endpoints.taskPartById(editPart.id), {
        ...editForm,
        task: taskId
      })
      toast.success(String(t('common.saved')))
      setEditPart(null)
      queryClient.invalidateQueries({ queryKey: ['task-parts', taskId] })
    } catch (e: any) {
      toast.error(e?.message || String(t('errors.somethingWentWrong')))
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm(String(t('common.confirmDelete')))) {
      try {
        await DataService.delete(endpoints.taskPartById(id))
        toast.success(String(t('common.deleted')))
        queryClient.invalidateQueries({ queryKey: ['task-parts', taskId] })
      } catch (e: any) {
        toast.error(e?.message || String(t('errors.somethingWentWrong')))
      }
    }
  }

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
        <TaskParts
          parts={parts}
          selectedPartId={selectedPartId}
          setSelectedPartId={setSelectedPartId}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </Grid>
      <Grid item xs={12}>
        <TaskAttachment taskId={task.id} partId={selectedPartId ?? undefined} />
      </Grid>
      <Grid item xs={12}>
        <TaskComments taskId={task.id} partId={selectedPartId ?? undefined} />
      </Grid>
      <Dialog open={!!editPart} onClose={() => setEditPart(null)} maxWidth='sm' fullWidth>
        <DialogTitle>{String(t('tasks.parts.dialog.title'))}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label={String(t('tasks.parts.form.title'))}
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={departments || []}
                getOptionLabel={option => option.name}
                value={departments?.find(d => d.id === editForm.department) || null}
                onChange={(event, newValue) => setEditForm({ ...editForm, department: newValue?.id || 0 })}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label={String(t('tasks.parts.form.department'))}
                    placeholder={String(t('common.selectPlaceholder'))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={users || []}
                getOptionLabel={option => option.fullname}
                value={users?.find(u => u.id === editForm.assignee) || null}
                onChange={(event, newValue) => setEditForm({ ...editForm, assignee: newValue?.id || 0 })}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label={String(t('tasks.parts.form.assignee'))}
                    placeholder={String(t('common.selectPlaceholder'))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                type='date'
                label={String(t('tasks.parts.form.startDate'))}
                value={editForm.start_date}
                onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                type='date'
                label={String(t('tasks.parts.form.endDate'))}
                value={editForm.end_date}
                onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={3}
                label={String(t('tasks.parts.form.note'))}
                value={editForm.note}
                onChange={e => setEditForm({ ...editForm, note: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPart(null)}>{String(t('common.cancel'))}</Button>
          <Button variant='contained' onClick={handleSaveEdit}>
            {String(t('common.save'))}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
