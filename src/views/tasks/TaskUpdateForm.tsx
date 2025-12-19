import { useEffect, useState } from 'react'
import {
  Grid,
  Stack,
  Button,
  MenuItem,
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
  Chip,
  Autocomplete
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomTextField from 'src/@core/components/mui/text-field'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import { useRouter } from 'next/router'
import 'react-datepicker/dist/react-datepicker.css'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { useFetchList } from 'src/hooks/useFetchList'
import DatePicker from 'react-datepicker'
import { useAuth } from 'src/hooks/useAuth'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'

export type TaskPayload = {
  status?: string
  company?: number
  type?: string
  name?: string
  task_form?: number
  sending_org?: number
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
}

const defaults: TaskPayload = {
  status: 'new',
  type: 'task',
  name: '',
  task_form: 0,
  sending_org: 0,
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
    sending_org: yup
      .number()
      .typeError(String(t('errors.select')))
      .moreThan(0, String(t('errors.select')))
      .required(String(t('errors.required'))),
    input_doc_number: yup.string().required(String(t('errors.required'))),
    output_doc_number: yup.string().required(String(t('errors.required'))),
    start_date: yup.string().required(String(t('errors.required'))),
    end_date: yup
      .string()
      .optional()
      .default('')
      .test('end-after-start', String(t('errors.endAfterStart')), function (value) {
        const { start_date } = this.parent as TaskPayload
        if (!start_date || !value) return true

        return new Date(value) >= new Date(start_date)
      }),
    priority: yup
      .string()
      .oneOf(['ordinary', 'orgently'])
      .required(String(t('errors.required'))),
    department: yup
      .number()
      .typeError(String(t('errors.select')))
      .moreThan(0, String(t('errors.select')))
      .required(String(t('errors.required'))),
    note: yup.string().required(String(t('errors.required'))),
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
  const { control, handleSubmit, reset } = useForm<TaskPayload>({
    defaultValues: defaults,
    resolver: yupResolver(schema)
  })
  const toast = useThemedToast()
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  // State for assignment mode
  const [assignmentMode, setAssignmentMode] = useState<'simple' | 'split'>('simple')
  const [simpleAssignee, setSimpleAssignee] = useState<number>(0)
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

  const { data: departments } = useFetchList<{ id: number; name: string }>(endpoints.department, {
    page: 1,
    perPage: 100
  })
  const { data: users } = useFetchList<{ id: number; fullname: string }>(endpoints.users, {
    page: 1,
    perPage: 100
  })
  const { data: companies } = useFetchList<{ id: number; name: string }>(endpoints.company, {
    page: 1,
    perPage: 100
  })
  const { data: docFormsData } = useFetchList(endpoints.documentForm, {
    page: 1,
    perPage: 100
  })
  const docForms = (docFormsData as Array<{ id: number; name: string }>) || []

  const { data: magData } = useFetchList<{ id: number; name: string }>(endpoints.listOfMagazine, {
    page: 1,
    perPage: 100
  })
  const safeMsg = (msg: any) => (typeof msg === 'string' ? msg : undefined)
  const [attachFiles, setAttachFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    const fetchTask = async () => {
      if (!id || Array.isArray(id)) return
      const res = await DataService.get<TaskPayload>(endpoints.taskById(id))
      const data = res.data as TaskPayload

      // Reset form with existing values
      reset({
        ...defaults,
        ...data,

        // Normalize numeric selects to numbers with fallback
        priority: data.priority || 'ordinary',
        task_form: typeof data.task_form === 'number' ? data.task_form : 0,
        sending_org: data.sending_org || 0,
        department: typeof data.department === 'number' ? data.department : 0,
        signed_by: typeof data.signed_by === 'number' ? data.signed_by : 0,
        list_of_magazine: typeof data.list_of_magazine === 'number' ? data.list_of_magazine : 0,

        // Ensure dates are ISO yyyy-MM-dd if present
        start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 10) : '',
        end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 10) : ''
      })
    }
    fetchTask()
  }, [id, reset])

  useEffect(() => {
    const fetchTaskParts = async () => {
      if (!id || Array.isArray(id)) return
      try {
        const res = await DataService.get<any>(endpoints.taskPart, { task: id, perPage: 50 })
        setTaskParts((res.data?.results || []) as TaskPartItem[])
      } catch (e) {
        console.error('Error fetching task parts:', e)
      }
    }
    fetchTaskParts()
  }, [id])

  const handleCreateSimpleAssignment = async () => {
    if (!id || Array.isArray(id) || !simpleAssignee) return
    try {
      await DataService.post(endpoints.taskPart, {
        task: Number(id),
        title: String(t('tasks.parts.simpleTitle')),
        department: 0,
        assignee: simpleAssignee,
        start_date: '',
        end_date: '',
        status: 'new',
        note: '',
        created_by: user?.id || 1,
        updated_by: user?.id || 1
      })
      toast.success(String(t('tasks.toast.assigneeAssigned')))

      // Refresh task parts
      const res = await DataService.get<any>(endpoints.taskPart, { task: id, perPage: 50 })
      setTaskParts((res.data?.results || []) as TaskPartItem[])
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
          start_date: part.start_date,
          end_date: part.end_date,
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
          start_date: partForm.start_date || '',
          end_date: partForm.end_date || '',
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
          start_date: partForm.start_date || '',
          end_date: partForm.end_date || '',
          status: 'new',
          note: partForm.note || '',
          created_by: user?.id || 1,
          updated_by: user?.id || 1
        })
        toast.success(String(t('tasks.toast.partCreated')))
      }
      setDialogOpen(false)
      setEditingPartId(null)

      // Refresh task parts
      const res = await DataService.get<any>(endpoints.taskPart, { task: id, perPage: 50 })
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

  const onSubmit = async (values: TaskPayload) => {
    try {
      if (!id || Array.isArray(id)) return
      if (attachFiles.length) await submitAttachment()
      await DataService.put(endpoints.taskById(id), { ...values, company: user?.company_id })
      toast.success(String(t('tasks.toast.updated')))
      router.push(`/tasks/view/${id}`)
    } catch (e: any) {
      toast.error(e?.message || String(t('tasks.toast.updateError')))
    }
  }
  const submitAttachment = async () => {
    if (!id) return
    if (!attachFiles.length) {
      toast.error(String(t('tasks.attachments.fileRequired')))
      return
    }

    try {
      setSaving(true)
      for (const fileItem of attachFiles) {
        const formData = new FormData()
        formData.append('file', fileItem)
        formData.append('title', fileItem.name)
        formData.append('task', id.toString())
        await DataService.postForm(endpoints.taskAttachment, formData)
      }

      toast.success(String(t('tasks.attachments.attached')))
      setAttachFiles([])
    } catch (e) {
      console.error('Failed to create attachment', e)
      toast.error(String(t('tasks.attachments.attachError')))
      return
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={4}>
      {/* Main form (top) */}
      <DatePickerWrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card variant='outlined'>
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='type'
                        control={control}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            select
                            fullWidth
                            label={String(t('tasks.form.type'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          >
                            <MenuItem value='task'>{String(t('tasks.type.task'))}</MenuItem>
                            <MenuItem value='application'>{String(t('tasks.type.application'))}</MenuItem>
                          </CustomTextField>
                        )}
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
                          <CustomTextField
                            select
                            fullWidth
                            label={String(t('tasks.form.taskForm'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          >
                            <MenuItem value={0}>{String(t('common.selectPlaceholder'))}</MenuItem>
                            {(docForms || []).map(f => (
                              <MenuItem key={f.id} value={f.id}>
                                {f.name}
                              </MenuItem>
                            ))}
                          </CustomTextField>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='sending_org'
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            fullWidth
                            select
                            label={String(t('tasks.form.sendingOrg'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          >
                            <MenuItem value={0}>{String(t('common.selectPlaceholder'))}</MenuItem>
                            {(companies || []).map(c => (
                              <MenuItem key={c.id} value={c.id}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component='label'
                        variant='outlined'
                        disabled={saving}
                        startIcon={<Icon icon='mdi:file-upload' />}
                      >
                        {String(t('tasks.attachments.chooseFiles'))}
                        <input
                          hidden
                          type='file'
                          multiple
                          onChange={e => {
                            const files = Array.from(e.target.files || [])
                            if (!files.length) return
                            setAttachFiles(prev => {
                              const map = new Map<string, File>()
                              for (const f of prev) map.set(`${f.name}-${f.size}-${f.lastModified}`, f)
                              for (const f of files) map.set(`${f.name}-${f.size}-${f.lastModified}`, f)

                              return Array.from(map.values())
                            })
                            // allow choosing same file again later
                            e.target.value = ''
                          }}
                        />
                      </Button>

                      {attachFiles.length ? (
                        <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap marginTop={5}>
                          {attachFiles.map(file => {
                            const key = `${file.name}-${file.size}-${file.lastModified}`

                            return (
                              <Chip
                                key={key}
                                icon={<Icon icon='mdi:file' />}
                                label={file.name}
                                variant='outlined'
                                onDelete={
                                  saving
                                    ? undefined
                                    : () =>
                                        setAttachFiles(prev =>
                                          prev.filter(f => `${f.name}-${f.size}-${f.lastModified}` !== key)
                                        )
                                }
                              />
                            )
                          })}
                        </Stack>
                      ) : null}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name='list_of_magazine'
                        control={control}
                        rules={{ required: String(t('errors.required')) }}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            select
                            fullWidth
                            label={String(t('tasks.form.magazine'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          >
                            <MenuItem value={0}>{String(t('common.selectPlaceholder'))}</MenuItem>
                            {(magData || []).map(m => (
                              <MenuItem key={m.id} value={m.id}>
                                {m.name}
                              </MenuItem>
                            ))}
                          </CustomTextField>
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
                          const selectedDate = field.value ? new Date(field.value) : null

                          return (
                            <div>
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) =>
                                  field.onChange(date ? date.toISOString().slice(0, 10) : '')
                                }
                                dateFormat='yyyy-MM-dd'
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
                          const selectedDate = field.value ? new Date(field.value) : null

                          return (
                            <div>
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) =>
                                  field.onChange(date ? date.toISOString().slice(0, 10) : '')
                                }
                                dateFormat='yyyy-MM-dd'
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
              <Card variant='outlined'>
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Controller
                        name='department'
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                          <CustomTextField
                            select
                            fullWidth
                            label={String(t('tasks.form.department'))}
                            {...field}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          >
                            <MenuItem value={0}>{String(t('common.selectPlaceholder'))}</MenuItem>
                            {(departments || []).map(d => (
                              <MenuItem key={d.id} value={d.id}>
                                {d.name}
                              </MenuItem>
                            ))}
                          </CustomTextField>
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
                            options={users || []}
                            getOptionLabel={option => option.fullname}
                            value={users?.find(u => u.id === field.value) || null}
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
              onChange={e => setAssignmentMode(e.target.value as 'simple' | 'split')}
            >
              <FormControlLabel value='simple' control={<Radio />} label={String(t('tasks.assignment.simple'))} />
              <FormControlLabel value='split' control={<Radio />} label={String(t('tasks.assignment.split'))} />
            </RadioGroup>
          </FormControl>

          {assignmentMode === 'simple' ? (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Typography variant='subtitle2'>{String(t('tasks.assignment.chooseAssignee'))}</Typography>
              <Grid container spacing={2} alignItems='end'>
                <Grid item xs={12} sm={8}>
                  <CustomTextField
                    select
                    fullWidth
                    label={String(t('tasks.assignment.assignee'))}
                    value={simpleAssignee}
                    onChange={e => setSimpleAssignee(Number(e.target.value))}
                  >
                    <MenuItem value={0}>{String(t('common.selectPlaceholder'))}</MenuItem>
                    {(users || []).map(u => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.fullname}
                      </MenuItem>
                    ))}
                  </CustomTextField>
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
                          <TableCell>{part.start_date}</TableCell>
                          <TableCell>{part.end_date}</TableCell>
                          <TableCell>{part.note}</TableCell>
                          <TableCell align='right'>
                            <Stack direction='row' spacing={1}>
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
                  options={users || []}
                  getOptionLabel={option => option.fullname}
                  value={users?.find(u => u.id === partForm.assignee) || null}
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
                  type='date'
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
                  type='date'
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
      </Card>
    </Stack>
  )
}

export default TaskUpdateForm
