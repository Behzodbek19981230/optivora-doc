import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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

const pad2 = (n: number) => String(n).padStart(2, '0')

const formatLocalDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(
    date.getMinutes()
  )}`

const parseDateTimeValue = (value?: string): Date | null => {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)

    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
  }
  const dt = new Date(value)

  return Number.isNaN(dt.getTime()) ? null : dt
}

const normalizeIncomingDateTime = (value?: string) => {
  const d = parseDateTimeValue(value)

  return d ? formatLocalDateTime(d) : ''
}

const formatDisplayDateTime = (value?: string) => {
  if (!value) return '—'
  const m = moment(value)

  return m.isValid() ? m.format('DD.MM.YYYY HH:mm') : String(value)
}
import CustomTextField from 'src/@core/components/mui/text-field'
import { useFetchList } from 'src/hooks/useFetchList'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import { useAuth } from 'src/hooks/useAuth'

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
  const { user } = useAuth()
  const toast = useThemedToast()
  const queryClient = useQueryClient()

  const { data: departments } = useFetchList<{ id: number; name: string }>(endpoints.department, {
    page: 1,
    limit: 100
  })
  const { data: performers } = useFetchList<{ id: number; fullname: string }>(endpoints.users, {
    page: 1,
    limit: 100,
    roles__name: 'Performer'
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

  const taskId = task?.id
  const { data: parts } = useQuery<TaskPartType[]>({
    queryKey: ['task-parts', taskId ?? 'none'],
    enabled: !!taskId,
    queryFn: async (): Promise<TaskPartType[]> => {
      const res = await DataService.get(endpoints.taskPart, { task: String(taskId), limit: 100 })

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
        start_date: normalizeIncomingDateTime(part.start_date),
        end_date: normalizeIncomingDateTime(part.end_date),
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

  const handleAdd = () => {
    setEditPart({} as TaskPartType)
    setEditForm({
      title: '',
      department: 0,
      assignee: 0,
      start_date: '',
      end_date: '',
      note: ''
    })
  }

  const handleSaveAdd = async () => {
    if (!taskId) return
    try {
      const errors: { [key: string]: string } = {}
      if (!editForm.title || !editForm.title.trim()) errors.title = String(t('errors.required'))
      if (!editForm.department || Number(editForm.department) <= 0) errors.department = String(t('errors.required'))
      if (!editForm.assignee || Number(editForm.assignee) <= 0) errors.assignee = String(t('errors.required'))
      if (!editForm.start_date) errors.start_date = String(t('errors.required'))
      if (!editForm.end_date) errors.end_date = String(t('errors.required'))
      if (editForm.start_date && editForm.end_date) {
        const s = new Date(editForm.start_date)
        const e = new Date(editForm.end_date)
        if (e < s) errors.end_date = String(t('errors.endAfterStart'))
      }
      if (!editForm.note || !String(editForm.note).trim()) errors.note = String(t('errors.required'))

      if (Object.keys(errors).length > 0) {
        toast.error(String(t('tasks.toast.partFormRequired')))

        return
      }

      await DataService.post(endpoints.taskPart, {
        task: taskId,
        title: editForm.title || '',
        department: editForm.department || 0,
        assignee: editForm.assignee || 0,
        start_date: moment(editForm.start_date).format('YYYY-MM-DD HH:mm') || '',
        end_date: moment(editForm.end_date).format('YYYY-MM-DD HH:mm') || '',
        status: 'new',
        note: editForm.note || '',
        created_by: user?.id
      })
      toast.success(String(t('tasks.toast.partCreated')))
      setEditPart(null)
      queryClient.invalidateQueries({ queryKey: ['task-parts', taskId] })
    } catch (e: any) {
      toast.error(e?.message || String(t('errors.somethingWentWrong')))
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
                <Item
                  label={String(t('tasks.view.document.fields.startDate'))}
                  value={formatDisplayDateTime(task.start_date)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Item
                  label={String(t('tasks.view.document.fields.endDate'))}
                  value={formatDisplayDateTime(task.end_date)}
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
        <TaskAttachment taskId={task.id} partId={null} isCompact />
      </Grid>

      <Grid item xs={12}>
        <TaskParts
          parts={parts || []}
          selectedPartId={selectedPartId}
          setSelectedPartId={setSelectedPartId}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAdd={handleAdd}
          taskId={taskId}
        />
      </Grid>
      {selectedPartId && (
        <>
          <Grid item xs={12}>
            <TaskAttachment taskId={null} partId={selectedPartId} />
          </Grid>
          <Grid item xs={12}>
            <TaskComments taskId={null} partId={selectedPartId} />
          </Grid>
        </>
      )}
      <Dialog open={!!editPart} onClose={() => setEditPart(null)} maxWidth='sm' fullWidth>
        <DialogTitle>
          {editPart?.id ? String(t('tasks.parts.dialog.editTitle')) : String(t('tasks.parts.dialog.title'))}
        </DialogTitle>
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
                options={performers || []}
                getOptionLabel={option => option.fullname}
                value={performers?.find(u => u.id === editForm.assignee) || null}
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
                type='datetime-local'
                label={String(t('tasks.parts.form.startDate'))}
                value={editForm.start_date}
                onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                type='datetime-local'
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
          <Button variant='contained' onClick={editPart?.id ? handleSaveEdit : handleSaveAdd}>
            {String(t('common.save'))}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
