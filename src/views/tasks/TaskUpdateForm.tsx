import { useEffect, useState } from 'react'
import {
  Grid,
  Stack,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Autocomplete,
  Box,
  Divider,
  Tooltip,
  Switch
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomTextField from 'src/@core/components/mui/text-field'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import { useRouter } from 'next/router'
import Link from 'next/link'
import 'react-datepicker/dist/react-datepicker.css'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { useFetchList } from 'src/hooks/useFetchList'
import DatePicker from 'react-datepicker'
import { useAuth } from 'src/hooks/useAuth'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const pad2 = (n: number) => String(n).padStart(2, '0')

const formatLocalDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(
    date.getMinutes()
  )}`

const parseDateTimeValue = (value?: string): Date | null => {
  if (!value) return null

  // Treat date-only values as local dates to avoid timezone shifting
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)

    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
  }

  const d = new Date(value)

  return Number.isNaN(d.getTime()) ? null : d
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

export type TaskPayload = {
  status?: string
  company?: number
  type?: string
  name?: string
  task_form?: number
  sending_org?: string
  input_doc_number?: string
  output_doc_number?: string
  start_date?: string
  end_date?: string
  priority?: string
  sending_respon_person?: string
  department?: number
  signed_by?: number
  note?: string
  created_by?: number
  updated_by?: number
  list_of_magazine?: number
  task_type?: 'simple' | 'divide_into_parts'
}

const defaults: TaskPayload = {
  status: 'new',
  type: 'task',
  name: '',
  task_form: 0,
  sending_org: '',
  input_doc_number: '',
  output_doc_number: '',
  start_date: '',
  end_date: '',
  priority: 'ordinary',
  department: 0,
  signed_by: 0,
  note: '',
  list_of_magazine: 0
}

const buildSchema = (t: (key: string, options?: any) => any): yup.ObjectSchema<TaskPayload> =>
  yup.object({
    type: yup
      .string()
      .oneOf(['task', 'application'])
      .required(String(t('errors.required'))),
    name: yup
      .string()
      .min(2, String(t('errors.minChars', { count: 2 })))
      .required(String(t('errors.required'))),
    task_form: yup
      .number()
      .typeError(String(t('errors.select')))
      .moreThan(0, String(t('errors.select')))
      .required(String(t('errors.required'))),
    sending_org: yup.string().required(String(t('errors.required'))),
    input_doc_number: yup.string().required(String(t('errors.required'))),
    output_doc_number: yup.string().required(String(t('errors.required'))),
    start_date: yup.string().required(String(t('errors.required'))),
    end_date: yup.string().required(String(t('errors.required'))),
    priority: yup
      .string()
      .oneOf(['ordinary', 'orgently'])
      .required(String(t('errors.required'))),
    department: yup
      .number()
      .typeError(String(t('errors.select')))
      .moreThan(0, String(t('errors.select')))
      .required(String(t('errors.required'))),
    list_of_magazine: yup
      .number()
      .typeError(String(t('errors.select')))
      .moreThan(0, String(t('errors.select')))
      .required(String(t('errors.required'))),
    signed_by: yup
      .number()
      .typeError(String(t('errors.select')))
      .moreThan(0, String(t('errors.select')))
      .required(String(t('errors.required')))
  }) as yup.ObjectSchema<TaskPayload>

type TaskPartPayload = {
  task: number
  title: string
  department: number
  assignee: number
  start_date: string
  end_date: string
  note: string
}

type TaskPartItem = TaskPartPayload & { id: number; status: string }

const TaskUpdateForm = () => {
  const { t } = useTranslation()
  const schema = buildSchema(t)
  const { control, handleSubmit, reset, getValues } = useForm<TaskPayload>({
    defaultValues: defaults,
    resolver: yupResolver(schema)
  })
  const toast = useThemedToast()
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  // State for assignment mode
  const [assignmentMode, setAssignmentMode] = useState<'simple' | 'divide_into_parts'>('simple')
  const [simpleAssignee, setSimpleAssignee] = useState<number>(0)
  const [simplePartId, setSimplePartId] = useState<number | null>(null)
  const [taskParts, setTaskParts] = useState<TaskPartItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [partForm, setPartForm] = useState<Partial<TaskPartPayload>>({
    title: '',
    department: 0,
    assignee: 0,
    start_date: '',
    end_date: '',
    note: ''
  })
  const [partErrors, setPartErrors] = useState<{ [K in keyof TaskPartPayload]?: string }>({})
  const [editingPartId, setEditingPartId] = useState<number | null>(null)

  // Attachment states for task parts
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false)
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null)
  const [existingPartFiles, setExistingPartFiles] = useState<any[]>([])
  const [newPartAttachments, setNewPartAttachments] = useState<AttachmentRow[]>([])
  const [uploadingPartFiles, setUploadingPartFiles] = useState(false)

  const { data: departments } = useFetchList<{ id: number; name: string }>(endpoints.department, {
    page: 1,
    limit: 100
  })
  const { data: users } = useFetchList<{ id: number; fullname: string }>(endpoints.users, {
    page: 1,
    limit: 100
  })
  const { data: performers } = useFetchList<{ id: number; fullname: string }>(endpoints.users, {
    page: 1,
    limit: 100,
    roles__name: 'Performer'
  })
  const { data: signatories } = useFetchList<{ id: number; fullname: string }>(endpoints.users, {
    page: 1,
    limit: 100,
    roles__name: 'Signatory'
  })

  const { data: docFormsData } = useFetchList(endpoints.documentForm, {
    page: 1,
    limit: 100
  })
  const docForms = (docFormsData as Array<{ id: number; name: string }>) || []

  const { data: magData } = useFetchList<{ id: number; name: string }>(endpoints.listOfMagazine, {
    page: 1,
    limit: 100
  })
  const safeMsg = (msg: any) => (typeof msg === 'string' ? msg : undefined)
  type AttachmentRow = { isLink: boolean; link: string; file: File | null }

  const [taskAttachments, setTaskAttachments] = useState<AttachmentRow[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    const fetchTask = async () => {
      if (!id || Array.isArray(id)) return
      const res = await DataService.get<TaskPayload>(endpoints.taskById(id))
      const data = res.data as TaskPayload
      setAssignmentMode(data.task_type || 'simple')
      if (data.task_type === 'simple') {
        const res = await DataService.get<TaskPartItem>(endpoints.taskPart, { task: id, limit: 50 })
        const data = (res.data as any)?.results?.[0] as TaskPartItem
        if (data) {
          setSimpleAssignee(data.assignee || 0)
          setSimplePartId(data.id || null)
        } else {
          setSimplePartId(null)
        }
      }
      reset({
        ...defaults,
        ...data,

        // Normalize numeric selects to numbers with fallback
        priority: data.priority || 'ordinary',
        task_form: typeof data.task_form === 'number' ? data.task_form : 0,
        sending_org: data.sending_org || '',
        department: typeof data.department === 'number' ? data.department : 0,
        signed_by: typeof data.signed_by === 'number' ? data.signed_by : 0,
        list_of_magazine: typeof data.list_of_magazine === 'number' ? data.list_of_magazine : 0,

        // Keep date + time (local) if present
        start_date: normalizeIncomingDateTime(data.start_date),
        end_date: normalizeIncomingDateTime(data.end_date)
      })
    }
    fetchTask()
  }, [id, reset])

  useEffect(() => {
    const fetchTaskParts = async () => {
      if (!id || Array.isArray(id)) return
      try {
        const res = await DataService.get<any>(endpoints.taskPart, { task: id, limit: 50 })
        setTaskParts((res.data?.results || []) as TaskPartItem[])
      } catch (e) {
        console.error('Error fetching task parts:', e)
      }
    }
    fetchTaskParts()
  }, [id])

  const handleCreateSimpleAssignment = async () => {
    if (!id || Array.isArray(id) || !simpleAssignee) return
    const { start_date, end_date, department } = getValues()
    try {
      if (!start_date || !end_date || !department) {
        toast.error(String(t('tasks.toast.startDateRequired')))

        return
      }
      const payload = {
        task: Number(id),
        title: String(t('tasks.parts.simpleTitle')),
        assignee: simpleAssignee,
        department: department,
        start_date: moment(start_date).format('YYYY-MM-DD HH:mm'),
        end_date: moment(end_date).format('YYYY-MM-DD HH:mm'),
        note: ''
      }

      // If a simple assignment already exists, update it instead of creating a duplicate
      if (simplePartId) {
        await DataService.patch(endpoints.taskPartById(simplePartId), {
          ...payload,
          updated_by: user?.id || 1
        })
      } else {
        await DataService.post(endpoints.taskPart, {
          ...payload,
          status: 'new',
          created_by: user?.id || 1
        })
      }
      toast.success(String(t('tasks.toast.assigneeAssigned')))

      // Refresh task parts
      const res = await DataService.get<any>(endpoints.taskPart, { task: id, limit: 50 })
      const refreshed = (res.data?.results || []) as TaskPartItem[]
      setTaskParts(refreshed)
      if (refreshed?.[0]?.id) setSimplePartId(refreshed[0].id)
    } catch (e: any) {
      toast.error(e?.message || String(t('errors.somethingWentWrong')))
    }
  }

  const handleOpenDialog = (partId?: number) => {
    if (partId) {
      const part = taskParts.find(p => p.id === partId)
      if (part) {
        setPartForm({
          title: part.title,
          department: part.department,
          assignee: part.assignee,
          start_date: normalizeIncomingDateTime(part.start_date),
          end_date: normalizeIncomingDateTime(part.end_date),
          note: part.note
        })
        setEditingPartId(partId)
      }
    } else {
      setPartForm({
        title: '',
        department: 0,
        assignee: 0,
        start_date: '',
        end_date: '',
        note: ''
      })
      setEditingPartId(null)
    }
    setPartErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPartId(null)
  }

  const handleSaveTaskPart = async () => {
    if (!id || Array.isArray(id)) return

    // Validate required fields
    const errors: { [K in keyof TaskPartPayload]?: string } = {}

    if (!partForm.title || !partForm.title.trim()) errors.title = String(t('errors.required'))
    if (!partForm.department || Number(partForm.department) <= 0) errors.department = String(t('errors.required'))
    if (!partForm.assignee || Number(partForm.assignee) <= 0) errors.assignee = String(t('errors.required'))
    if (!partForm.start_date) errors.start_date = String(t('errors.required'))
    if (!partForm.end_date) errors.end_date = String(t('errors.required'))
    if (partForm.start_date && partForm.end_date) {
      const s = new Date(partForm.start_date)
      const e = new Date(partForm.end_date)
      if (e < s) errors.end_date = String(t('errors.endAfterStart'))
    }
    if (!partForm.note || !String(partForm.note).trim()) errors.note = String(t('errors.required'))
    setPartErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error(String(t('tasks.toast.partFormRequired')))

      return
    }
    try {
      if (editingPartId) {
        await DataService.put(endpoints.taskPartById(editingPartId), {
          title: partForm.title || '',
          department: partForm.department || 0,
          assignee: partForm.assignee || 0,
          start_date: moment(partForm.start_date).format('YYYY-MM-DD HH:mm') || '',
          end_date: moment(partForm.end_date).format('YYYY-MM-DD HH:mm') || '',
          note: partForm.note || '',
          updated_by: user?.id || 1,
          task: Number(id)
        })
        toast.success(String(t('common.saved')))
      } else {
        await DataService.post(endpoints.taskPart, {
          task: Number(id),
          title: partForm.title || String(t('tasks.parts.newTitleFallback')),
          department: partForm.department || 0,
          assignee: partForm.assignee || 0,
          start_date: moment(partForm.start_date).format('YYYY-MM-DD HH:mm') || '',
          end_date: moment(partForm.end_date).format('YYYY-MM-DD HH:mm') || '',
          status: 'new',
          note: partForm.note || '',
          created_by: user?.id || 1
        })
        toast.success(String(t('tasks.toast.partCreated')))
      }
      setDialogOpen(false)
      setEditingPartId(null)

      // Refresh task parts
      const res = await DataService.get<any>(endpoints.taskPart, { task: id, limit: 50 })
      setTaskParts((res.data?.results || []) as TaskPartItem[])
    } catch (e: any) {
      toast.error(e?.message || String(t('errors.somethingWentWrong')))
    }
  }

  const handleDeleteTaskPart = async (partId: number) => {
    try {
      await DataService.delete(endpoints.taskPartById(partId))
      toast.success(String(t('tasks.toast.partDeleted')))
      setTaskParts(taskParts.filter(p => p.id !== partId))
    } catch (e: any) {
      toast.error(e?.message || String(t('errors.somethingWentWrong')))
    }
  }

  // Task Part Attachment Functions
  const fetchPartAttachments = async (partId: number) => {
    try {
      const res = await DataService.get<any>(endpoints.taskAttachment, { part: partId })
      const data = res.data
      setExistingPartFiles(data.results || data || [])
    } catch (e) {
      console.error('Error fetching part attachments:', e)
    }
  }

  const handleOpenAttachmentDialog = (partId: number) => {
    setSelectedPartId(partId)
    setNewPartAttachments([])
    fetchPartAttachments(partId)
    setAttachmentDialogOpen(true)
  }

  const handleCloseAttachmentDialog = () => {
    setAttachmentDialogOpen(false)
    setSelectedPartId(null)
    setExistingPartFiles([])
    setNewPartAttachments([])
  }

  const handleAddTaskAttachmentRow = () =>
    setTaskAttachments(prev => [...prev, { isLink: false, link: '', file: null }])
  const handleRemoveTaskAttachmentRow = (idx: number) => setTaskAttachments(prev => prev.filter((_, i) => i !== idx))
  const handleToggleTaskAttachmentType = (idx: number, isLink: boolean) =>
    setTaskAttachments(prev =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              isLink,
              link: isLink ? row.link : '',
              file: isLink ? null : row.file
            }
          : row
      )
    )
  const handleChangeTaskAttachmentLink = (idx: number, link: string) =>
    setTaskAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, link } : row)))
  const handleChangeTaskAttachmentFile = (idx: number, file: File | null) =>
    setTaskAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, file } : row)))

  const handleAddPartAttachmentRow = () => {
    setNewPartAttachments(prev => [...prev, { isLink: false, link: '', file: null }])
  }

  const handleRemovePartAttachmentRow = (idx: number) => {
    setNewPartAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  const handleTogglePartAttachmentType = (idx: number, isLink: boolean) => {
    setNewPartAttachments(prev =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              isLink,
              link: isLink ? row.link : '',
              file: isLink ? null : row.file
            }
          : row
      )
    )
  }

  const handleChangePartAttachmentLink = (idx: number, link: string) => {
    setNewPartAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, link } : row)))
  }

  const handleChangePartAttachmentFile = (idx: number, file: File | null) => {
    setNewPartAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, file } : row)))
  }

  const handleUploadPartAttachments = async () => {
    if (!selectedPartId || !id) return
    const rowsToUpload = newPartAttachments.filter(r => (r.isLink ? r.link.trim().length : !!r.file))
    if (!rowsToUpload.length) return toast.error(String(t('tasks.attachments.fileRequired')))

    try {
      setUploadingPartFiles(true)
      for (const row of rowsToUpload) {
        const formData = new FormData()
        formData.append('part', selectedPartId.toString())
        formData.append('title', '')
        formData.append('link', row.isLink ? row.link.trim() : '')
        if (!row.isLink && row.file) formData.append('file', row.file)
        formData.append('uploaded_by', user?.id?.toString() ?? '')
        await DataService.postForm(endpoints.taskAttachment, formData)
      }
      toast.success(String(t('tasks.attachments.attached')))
      setNewPartAttachments([])
      fetchPartAttachments(selectedPartId)
    } catch (e) {
      console.error('Error uploading part attachments:', e)
      toast.error(String(t('tasks.attachments.attachError')))
    } finally {
      setUploadingPartFiles(false)
    }
  }

  const handleDownloadPartFile = (file: any) => {
    if (file.file) {
      window.open(String(file.file), '_blank', 'noopener,noreferrer')
    }
  }

  const onSubmit = async (values: TaskPayload) => {
    try {
      if (!id || Array.isArray(id)) return
      if (taskAttachments.some(r => (r.isLink ? r.link.trim().length : !!r.file))) await submitAttachment()
      await DataService.put(endpoints.taskById(id), { ...values, company: user?.company_id })
      toast.success(String(t('tasks.toast.updated')))
    } catch (e: any) {
      toast.error(e?.message || String(t('tasks.toast.updateError')))
    }
  }
  const submitAttachment = async () => {
    if (!id) return
    const rowsToUpload = taskAttachments.filter(r => (r.isLink ? r.link.trim().length : !!r.file))
    if (!rowsToUpload.length) return toast.error(String(t('tasks.attachments.fileRequired')))

    try {
      setSaving(true)
      for (const row of rowsToUpload) {
        if (row.isLink && !row.link.trim()) continue
        if (!row.isLink && !row.file) continue

        const formData = new FormData()
        formData.append('task', id.toString())
        formData.append('title', '')
        formData.append('link', row.isLink ? row.link.trim() : '')

        if (!row.isLink && row.file) formData.append('file', row.file)

        formData.append('uploaded_by', user?.id?.toString() ?? '')
        await DataService.postForm(endpoints.taskAttachment, formData)
      }

      toast.success(String(t('tasks.attachments.attached')))
      setTaskAttachments([])
    } catch (e) {
      console.error('Failed to create attachment', e)
      toast.error(String(t('tasks.attachments.attachError')))

      return
    } finally {
      setSaving(false)
    }
  }

  const updateTaskType = async (type: 'simple' | 'divide_into_parts') => {
    if (!id || Array.isArray(id)) return
    await DataService.patch<any>(endpoints.taskById(id), { task_type: type })
  }

  return (
    <Stack spacing={4}>
      {/* Main form (top) */}
      <DatePickerWrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4} alignItems='stretch'>
            <Grid item xs={12} md={6}>
              <Card variant='outlined' sx={{ height: '100%' }}>
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='type'
                        control={control}
                        render={({ field, fieldState }) => {
                          const options = [
                            { value: 'task', label: String(t('tasks.type.task')) },
                            { value: 'application', label: String(t('tasks.type.application')) }
                          ]

                          return (
                            <Autocomplete
                              options={options}
                              value={options.find(o => o.value === field.value) || null}
                              onChange={(_, v) => field.onChange(v?.value || '')}
                              isOptionEqualToValue={(o, v) => o.value === v.value}
                              getOptionLabel={o => o.label}
                              renderInput={params => (
                                <CustomTextField
                                  {...params}
                                  fullWidth
                                  label={String(t('tasks.form.type'))}
                                  error={!!fieldState.error}
                                  helperText={safeMsg(fieldState.error?.message)}
                                />
                              )}
                            />
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='priority'
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormControl error={!!fieldState.error}>
                            <FormLabel>{String(t('tasks.form.priority'))}</FormLabel>
                            <RadioGroup row {...field} value={field.value || 'ordinary'}>
                              <FormControlLabel
                                value='ordinary'
                                control={<Radio />}
                                label={String(t('tasks.priority.ordinary'))}
                              />
                              <FormControlLabel
                                value='orgently'
                                control={<Radio />}
                                label={String(t('tasks.priority.orgently'))}
                              />
                            </RadioGroup>
                            {!!fieldState.error && (
                              <Typography variant='caption' color='error'>
                                {safeMsg(fieldState.error?.message)}
                              </Typography>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name='name'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            fullWidth
                            label={String(t('tasks.form.name'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='task_form'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => (
                          <Autocomplete
                            options={docForms || []}
                            value={(docForms || []).find(f => f.id === field.value) || null}
                            onChange={(_, v) => field.onChange(v?.id ?? 0)}
                            isOptionEqualToValue={(o, v) => o.id === v.id}
                            getOptionLabel={o => o?.name || ''}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                fullWidth
                                label={String(t('tasks.form.taskForm'))}
                                error={!!fieldState.error}
                                helperText={safeMsg(fieldState.error?.message)}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Stack spacing={2}>
                        {taskAttachments.map((row, idx) => (
                          <Card key={idx} variant='outlined'>
                            <CardContent sx={{ p: '1rem !important' }}>
                              <Grid container spacing={2} alignItems='center'>
                                <Grid item xs={12} md={3}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={row.isLink}
                                        onChange={e => handleToggleTaskAttachmentType(idx, e.target.checked)}
                                      />
                                    }
                                    label={row.isLink ? 'Link' : 'File'}
                                  />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                  {row.isLink ? (
                                    <CustomTextField
                                      fullWidth
                                      size='small'
                                      label={String(t('common.link', { defaultValue: 'Link' }))}
                                      value={row.link}
                                      onChange={e => handleChangeTaskAttachmentLink(idx, e.target.value)}
                                    />
                                  ) : (
                                    <Stack spacing={1}>
                                      <Button
                                        variant='outlined'
                                        component='label'
                                        size='small'
                                        startIcon={<Icon icon='tabler:paperclip' />}
                                        disabled={saving}
                                      >
                                        {String(t('tasks.attachments.chooseFiles'))}
                                        <input
                                          hidden
                                          type='file'
                                          onChange={e =>
                                            handleChangeTaskAttachmentFile(idx, e.target.files?.[0] || null)
                                          }
                                        />
                                      </Button>
                                      <Typography variant='caption' color='text.secondary'>
                                        {row.file
                                          ? row.file.name
                                          : String(t('replyLetter.attachments.form.noFileSelected'))}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Grid>
                                <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <IconButton
                                    color='error'
                                    disabled={saving}
                                    onClick={() => handleRemoveTaskAttachmentRow(idx)}
                                  >
                                    <Icon icon='tabler:trash' />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        ))}

                        <Button
                          variant='outlined'
                          size='small'
                          startIcon={<Icon icon='tabler:plus' />}
                          disabled={saving}
                          onClick={handleAddTaskAttachmentRow}
                        >
                          {String(t('replyLetter.attachments.addRow'))}
                        </Button>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='sending_org'
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            fullWidth
                            label={String(t('tasks.form.sendingOrg'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='list_of_magazine'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => (
                          <Autocomplete
                            options={magData || []}
                            value={(magData || []).find(m => m.id === field.value) || null}
                            onChange={(_, v) => field.onChange(v?.id ?? 0)}
                            isOptionEqualToValue={(o, v) => o.id === v.id}
                            getOptionLabel={o => o?.name || ''}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                fullWidth
                                label={String(t('tasks.form.magazine'))}
                                error={!!fieldState.error}
                                helperText={safeMsg(fieldState.error?.message)}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='output_doc_number'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            fullWidth
                            label={String(t('tasks.form.outputDocNumber'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='input_doc_number'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            fullWidth
                            label={String(t('tasks.form.inputDocNumber'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='start_date'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => {
                          const selectedDate = parseDateTimeValue(field.value)

                          return (
                            <div>
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => field.onChange(date ? formatLocalDateTime(date) : '')}
                                showTimeSelect
                                timeFormat='HH:mm'
                                timeIntervals={5}
                                dateFormat='yyyy-MM-dd HH:mm'
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode='scroll'
                                yearDropdownItemNumber={100}
                                scrollableYearDropdown
                                customInput={
                                  <CustomTextField
                                    label={String(t('tasks.form.startDate'))}
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={safeMsg(fieldState.error?.message)}
                                  />
                                }
                                showPopperArrow
                                isClearable
                              />
                            </div>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='end_date'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => {
                          const selectedDate = parseDateTimeValue(field.value)

                          return (
                            <div>
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => field.onChange(date ? formatLocalDateTime(date) : '')}
                                showTimeSelect
                                timeFormat='HH:mm'
                                timeIntervals={5}
                                dateFormat='yyyy-MM-dd HH:mm'
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode='scroll'
                                yearDropdownItemNumber={100}
                                scrollableYearDropdown
                                customInput={
                                  <CustomTextField
                                    label={String(t('tasks.form.endDate'))}
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={safeMsg(fieldState.error?.message)}
                                  />
                                }
                                showPopperArrow
                                isClearable
                              />
                            </div>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant='outlined' sx={{ height: '100%' }}>
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Controller
                        name='department'
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                          <Autocomplete
                            options={departments || []}
                            value={(departments || []).find(d => d.id === field.value) || null}
                            onChange={(_, v) => field.onChange(v?.id ?? 0)}
                            isOptionEqualToValue={(o, v) => o.id === v.id}
                            getOptionLabel={o => o?.name || ''}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                fullWidth
                                label={String(t('tasks.form.department'))}
                                error={!!fieldState.error}
                                helperText={safeMsg(fieldState.error?.message)}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name='signed_by'
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                          <Autocomplete
                            fullWidth
                            options={signatories || []}
                            getOptionLabel={option => option.fullname}
                            value={signatories?.find(u => u.id === field.value) || null}
                            onChange={(event, newValue) => field.onChange(newValue?.id || 0)}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label={String(t('tasks.form.signedBy'))}
                                error={!!fieldState.error}
                                helperText={safeMsg(fieldState.error?.message)}
                                placeholder={String(t('common.selectPlaceholder'))}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <Controller
                        name='note'
                        control={control}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            fullWidth
                            multiline
                            rows={3}
                            label={String(t('tasks.form.note'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Stack direction='row' spacing={2} justifyContent='flex-end'>
                <Button type='button' variant='outlined' onClick={() => router.back()}>
                  {String(t('common.cancel'))}
                </Button>

                <Button type='submit' variant='contained'>
                  {String(t('common.save'))}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </DatePickerWrapper>

      {/* Assignment Section */}
      <Card>
        <CardContent>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>{String(t('tasks.assignment.method'))}</FormLabel>
            <RadioGroup
              row
              value={assignmentMode}
              onChange={e => {
                setAssignmentMode(e.target.value as 'simple' | 'divide_into_parts')
                updateTaskType(e.target.value as 'simple' | 'divide_into_parts')
              }}
            >
              <FormControlLabel value='simple' control={<Radio />} label={String(t('tasks.assignment.simple'))} />
              <FormControlLabel
                value='divide_into_parts'
                control={<Radio />}
                label={String(t('tasks.assignment.split'))}
              />
            </RadioGroup>
          </FormControl>

          {assignmentMode === 'simple' ? (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Typography variant='subtitle2'>{String(t('tasks.assignment.chooseAssignee'))}</Typography>
              <Grid container spacing={2} alignItems='end'>
                <Grid item xs={12} sm={8}>
                  <Autocomplete
                    options={performers || []}
                    value={(performers || []).find(u => u.id === simpleAssignee) || null}
                    onChange={(_, v) => setSimpleAssignee(v?.id || 0)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionLabel={o => o?.fullname || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label={String(t('tasks.assignment.assignee'))}
                        placeholder={String(t('common.selectPlaceholder'))}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant='contained'
                    fullWidth
                    onClick={handleCreateSimpleAssignment}
                    disabled={!simpleAssignee}
                  >
                    {String(t('tasks.assignment.attach'))}
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='subtitle2'>{String(t('tasks.parts.title'))}</Typography>
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<Icon icon='mdi:plus' />}
                  onClick={() => handleOpenDialog()}
                >
                  {String(t('common.add'))}
                </Button>
              </Stack>

              {taskParts.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>{String(t('tasks.parts.table.title'))}</TableCell>
                        <TableCell>{String(t('tasks.parts.table.department'))}</TableCell>
                        <TableCell>{String(t('tasks.parts.table.assignee'))}</TableCell>
                        <TableCell>{String(t('tasks.parts.table.start'))}</TableCell>
                        <TableCell>{String(t('tasks.parts.table.end'))}</TableCell>
                        <TableCell>{String(t('tasks.parts.table.note'))}</TableCell>
                        <TableCell align='right'>{String(t('common.actions'))}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {taskParts.map(part => (
                        <TableRow key={part.id}>
                          <TableCell>{part.title}</TableCell>
                          <TableCell>
                            {departments?.find(d => d.id === part.department)?.name || part.department}
                          </TableCell>
                          <TableCell>{users?.find(u => u.id === part.assignee)?.fullname || part.assignee}</TableCell>
                          <TableCell>{formatDisplayDateTime(part.start_date)}</TableCell>
                          <TableCell>{formatDisplayDateTime(part.end_date)}</TableCell>
                          <TableCell>{part.note}</TableCell>
                          <TableCell align='right'>
                            <Stack direction='row' spacing={1} justifyContent='flex-end'>
                              <Tooltip title={String(t('task.addFile'))}>
                                <IconButton
                                  size='small'
                                  color='primary'
                                  onClick={() => handleOpenAttachmentDialog(part.id)}
                                >
                                  <Icon icon='tabler:paperclip' />
                                </IconButton>
                              </Tooltip>
                              <IconButton size='small' onClick={() => handleOpenDialog(part.id)}>
                                <Icon icon='mdi:pencil' />
                              </IconButton>
                              <IconButton size='small' color='error' onClick={() => handleDeleteTaskPart(part.id)}>
                                <Icon icon='mdi:delete' />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {String(t('tasks.parts.empty'))}
                </Typography>
              )}
            </Stack>
          )}
        </CardContent>

        {/* Dialog for adding task parts */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
          <DialogTitle>{editingPartId ? 'Edit Task Part' : String(t('tasks.parts.dialog.title'))}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={String(t('tasks.parts.form.title'))}
                  value={partForm.title}
                  onChange={e => setPartForm({ ...partForm, title: e.target.value })}
                  error={!!partErrors.title}
                  helperText={partErrors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  options={departments || []}
                  getOptionLabel={option => option.name}
                  value={departments?.find(d => d.id === partForm.department) || null}
                  onChange={(event, newValue) => setPartForm({ ...partForm, department: newValue?.id || 0 })}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label={String(t('tasks.parts.form.department'))}
                      error={!!partErrors.department}
                      helperText={partErrors.department}
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
                  value={performers?.find(u => u.id === partForm.assignee) || null}
                  onChange={(event, newValue) => setPartForm({ ...partForm, assignee: newValue?.id || 0 })}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label={String(t('tasks.parts.form.assignee'))}
                      error={!!partErrors.assignee}
                      helperText={partErrors.assignee}
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
                  value={partForm.start_date}
                  onChange={e => setPartForm({ ...partForm, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  error={!!partErrors.start_date}
                  helperText={partErrors.start_date}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  type='datetime-local'
                  label={String(t('tasks.parts.form.endDate'))}
                  value={partForm.end_date}
                  onChange={e => setPartForm({ ...partForm, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  error={!!partErrors.end_date}
                  helperText={partErrors.end_date}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  label={String(t('tasks.parts.form.note'))}
                  value={partForm.note}
                  onChange={e => setPartForm({ ...partForm, note: e.target.value })}
                  error={!!partErrors.note}
                  helperText={partErrors.note}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{String(t('common.cancel'))}</Button>
            <Button variant='contained' onClick={handleSaveTaskPart}>
              {String(t('common.save'))}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for task part attachments */}
        <Dialog open={attachmentDialogOpen} onClose={handleCloseAttachmentDialog} maxWidth='md' fullWidth>
          <DialogTitle>
            {String(t('replyLetter.attachments.title'))} -{' '}
            {taskParts.find(p => p.id === selectedPartId)?.title || String(t('tasks.parts.simpleTitle'))}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={4} sx={{ mt: 2 }}>
              {/* Existing files */}
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  {String(t('replyLetter.attachments.existing'))}
                </Typography>
                {existingPartFiles.length > 0 ? (
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>{String(t('replyLetter.attachments.table.file'))}</TableCell>
                          <TableCell align='right'>{String(t('replyLetter.attachments.table.actions'))}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {existingPartFiles.map(file => (
                          <TableRow key={file.id}>
                            <TableCell>
                              {file.link ? file.link : file.file ? file.file.split('/').pop() : '-'}
                            </TableCell>
                            <TableCell align='right'>
                              {file.link ? (
                                <Tooltip title={String(t('common.open', { defaultValue: 'Open' }))}>
                                  <IconButton
                                    size='small'
                                    component='a'
                                    href={String(file.link)}
                                    target='_blank'
                                    rel='noreferrer'
                                  >
                                    <Icon icon='tabler:external-link' />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title={String(t('replyLetter.attachments.actions.download'))}>
                                  <IconButton size='small' onClick={() => handleDownloadPartFile(file)}>
                                    <Icon icon='tabler:download' />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('replyLetter.attachments.empty'))}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Add new files */}
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  {String(t('replyLetter.attachments.addNew'))}
                </Typography>
                <Stack spacing={2}>
                  {newPartAttachments.map((row, idx) => (
                    <Card key={idx} variant='outlined'>
                      <CardContent sx={{ p: '1rem !important' }}>
                        <Grid container spacing={3} alignItems='center'>
                          <Grid item xs={12} md={10}>
                            <Stack spacing={1}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={row.isLink}
                                    onChange={e => handleTogglePartAttachmentType(idx, e.target.checked)}
                                  />
                                }
                                label={row.isLink ? 'Link' : 'File'}
                              />

                              {row.isLink ? (
                                <CustomTextField
                                  fullWidth
                                  label={String(t('common.link', { defaultValue: 'Link' }))}
                                  value={row.link}
                                  onChange={e => handleChangePartAttachmentLink(idx, e.target.value)}
                                />
                              ) : (
                                <Stack direction='row' spacing={2} alignItems='center'>
                                  <Button
                                    variant='outlined'
                                    component='label'
                                    size='small'
                                    startIcon={<Icon icon='tabler:paperclip' />}
                                  >
                                    {String(t('replyLetter.attachments.form.attachFile'))}
                                    <input
                                      hidden
                                      type='file'
                                      onChange={e => handleChangePartAttachmentFile(idx, e.target.files?.[0] || null)}
                                    />
                                  </Button>
                                  <Typography
                                    variant='caption'
                                    sx={{
                                      color: 'text.secondary',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {row.file
                                      ? row.file.name
                                      : String(t('replyLetter.attachments.form.noFileSelected'))}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton color='error' onClick={() => handleRemovePartAttachmentRow(idx)}>
                              <Icon icon='tabler:trash' />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}

                  <Stack direction='row' spacing={2}>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<Icon icon='tabler:plus' />}
                      onClick={handleAddPartAttachmentRow}
                    >
                      {String(t('replyLetter.attachments.addRow'))}
                    </Button>
                    {newPartAttachments.length > 0 && (
                      <Button
                        variant='contained'
                        color='success'
                        size='small'
                        onClick={handleUploadPartAttachments}
                        disabled={uploadingPartFiles}
                        startIcon={<Icon icon='tabler:upload' />}
                      >
                        {uploadingPartFiles ? String(t('common.loading')) : String(t('replyLetter.attachments.upload'))}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAttachmentDialog}>{String(t('common.close'))}</Button>
          </DialogActions>
        </Dialog>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
        <Button
          component={Link}
          href={`/tasks/view/${id}`}
          variant='contained'
          color='info'
          startIcon={<Icon icon='tabler:file-text' />}
        >
          {String(t('common.view'))}
        </Button>
      </Box>
    </Stack>
  )
}

export default TaskUpdateForm
