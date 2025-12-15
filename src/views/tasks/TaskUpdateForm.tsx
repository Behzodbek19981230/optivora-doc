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
  Typography
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

// Yup validation schema
const schema: yup.ObjectSchema<TaskPayload> = yup.object({
  type: yup.string().oneOf(['task', 'application']).required('Majburiy maydon'),
  name: yup.string().min(2, 'Kamida 2 ta belgi').required('Majburiy maydon'),
  task_form: yup.number().typeError('Tanlang').required('Majburiy maydon'),
  sending_org: yup.number().required('Majburiy maydon'),
  input_doc_number: yup.string().required('Majburiy maydon'),
  output_doc_number: yup.string().required('Majburiy maydon'),
  start_date: yup.string().required('Majburiy maydon'),
  end_date: yup
    .string()
    .optional()
    .default('')
    .test('end-after-start', 'Tugash sanasi boshlanishdan keyin bo‘lsin', function (value) {
      const { start_date } = this.parent as TaskPayload
      if (!start_date || !value) return true

      return new Date(value) >= new Date(start_date)
    }),
  priority: yup.string().oneOf(['ordinary', 'orgently']).required('Majburiy maydon'),
  department: yup.number().required('Majburiy maydon'),
  note: yup.string().required('Majburiy maydon'),
  list_of_magazine: yup.number().required('Majburiy maydon'),
  signed_by: yup.number().required('Majburiy maydon')
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
        title: 'Oddiy topshiriq',
        department: 0,
        assignee: simpleAssignee,
        start_date: '',
        end_date: '',
        status: 'new',
        note: '',
        created_by: user?.id || 1,
        updated_by: user?.id || 1
      })
      toast.success('Ijrochi biriktirildi')

      // Refresh task parts
      const res = await DataService.get<any>(endpoints.taskPart, { task: id, perPage: 50 })
      setTaskParts((res.data?.results || []) as TaskPartItem[])
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi')
    }
  }

  const handleOpenDialog = () => {
    setPartForm({
      title: '',
      department: 0,
      assignee: 0,
      start_date: '',
      end_date: '',
      note: ''
    })
    setPartErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleSaveTaskPart = async () => {
    if (!id || Array.isArray(id)) return

    // Validate required fields
    const errors: { [K in keyof TaskPartPayload]?: string } = {}
    if (!partForm.title || !partForm.title.trim()) errors.title = 'Majburiy maydon'
    if (!partForm.department || Number(partForm.department) <= 0) errors.department = 'Majburiy maydon'
    if (!partForm.assignee || Number(partForm.assignee) <= 0) errors.assignee = 'Majburiy maydon'
    if (!partForm.start_date) errors.start_date = 'Majburiy maydon'
    if (!partForm.end_date) errors.end_date = 'Majburiy maydon'
    if (partForm.start_date && partForm.end_date) {
      const s = new Date(partForm.start_date)
      const e = new Date(partForm.end_date)
      if (e < s) errors.end_date = 'Tugash sanasi boshlanishdan keyin bo‘lsin'
    }
    if (!partForm.note || !String(partForm.note).trim()) errors.note = 'Majburiy maydon'
    setPartErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error('Qismlar formasi to‘ldirilishi shart')

      return
    }
    try {
      await DataService.post(endpoints.taskPart, {
        task: Number(id),
        title: partForm.title || 'Yangi qism',
        department: partForm.department || 0,
        assignee: partForm.assignee || 0,
        start_date: partForm.start_date || '',
        end_date: partForm.end_date || '',
        status: 'new',
        note: partForm.note || '',
        created_by: user?.id || 1,
        updated_by: user?.id || 1
      })
      toast.success('Task part yaratildi')
      setDialogOpen(false)

      // Refresh task parts
      const res = await DataService.get<any>(endpoints.taskPart, { task: id, perPage: 50 })
      setTaskParts((res.data?.results || []) as TaskPartItem[])
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi')
    }
  }

  const handleDeleteTaskPart = async (partId: number) => {
    try {
      await DataService.delete(endpoints.taskPartById(partId))
      toast.success("Task part o'chirildi")
      setTaskParts(taskParts.filter(p => p.id !== partId))
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi')
    }
  }

  const onSubmit = async (values: TaskPayload) => {
    try {
      if (!id || Array.isArray(id)) return
      await DataService.put(endpoints.taskById(id), { ...values, company: user?.company_id })
      toast.success('Task updated')
      router.push(`/tasks/view/${id}`)
    } catch (e: any) {
      toast.error(e?.message || 'Error creating task')
    }
  }

  return (
    <Card>
      <CardContent>
        <DatePickerWrapper>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField select fullWidth label='Tip (Type)' {...field}>
                      <MenuItem value='task'>Task</MenuItem>
                      <MenuItem value='application'>Application</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='priority'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField select fullWidth label='Prioritet (Priority)' {...field}>
                      <MenuItem value='ordinary'>Ordinary</MenuItem>
                      <MenuItem value='orgently'>Urgently</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      fullWidth
                      label='Task raqami/nomi'
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
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label='Hujjat shakli'
                      {...field}
                      error={!!fieldState.error}
                      helperText={safeMsg(fieldState.error?.message)}
                    >
                      <MenuItem value={0}>---</MenuItem>
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
                      label='Yuboruvchi (sending_org)'
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value={0}>---</MenuItem>
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
                <Controller
                  name='input_doc_number'
                  control={control}
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      fullWidth
                      label='Kirish raqami (input_doc_number)'
                      {...field}
                      error={!!fieldState.error}
                      helperText={safeMsg(fieldState.error?.message)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='output_doc_number'
                  control={control}
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      fullWidth
                      label='Chiqish raqami (output_doc_number)'
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
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => {
                    const selectedDate = field.value ? new Date(field.value) : null

                    return (
                      <div>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                          dateFormat='yyyy-MM-dd'
                          customInput={
                            <CustomTextField
                              label='Boshlanish sanasi'
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
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => {
                    const selectedDate = field.value ? new Date(field.value) : null

                    return (
                      <div>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                          dateFormat='yyyy-MM-dd'
                          customInput={
                            <CustomTextField
                              label='Tugash sanasi'
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
                  name='department'
                  control={control}
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label="Bo'lim (department)"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value={0}>---</MenuItem>
                      {(departments || []).map(d => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='signed_by'
                  control={control}
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label='Imzolovchi (signed_by)'
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value={0}>---</MenuItem>
                      {(users || []).map(u => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.fullname}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='note'
                  control={control}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      fullWidth
                      multiline
                      rows={3}
                      label='Izoh (note)'
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
                  rules={{ required: 'Majburiy maydon' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label='Jurnal (List of Magazine)'
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value={0}>---</MenuItem>
                      {(magData || []).map(m => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction='row' spacing={2} justifyContent='flex-end'>
                  <Button type='button' variant='outlined' onClick={() => router.back()}>
                    Bekor qilish
                  </Button>
                  <Button type='submit' variant='contained'>
                    Saqlash
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </DatePickerWrapper>
      </CardContent>

      {/* Assignment Section */}
      <CardContent>
        <FormControl component='fieldset'>
          <FormLabel component='legend'>Ijrochi biriktiruvi usuli</FormLabel>
          <RadioGroup
            row
            value={assignmentMode}
            onChange={e => setAssignmentMode(e.target.value as 'simple' | 'split')}
          >
            <FormControlLabel value='simple' control={<Radio />} label='Oddiy biriktirish' />
            <FormControlLabel value='split' control={<Radio />} label="Qismlarga bo'lish" />
          </RadioGroup>
        </FormControl>

        {assignmentMode === 'simple' ? (
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Typography variant='subtitle2'>Bitta ijrochi tanlang:</Typography>
            <Grid container spacing={2} alignItems='end'>
              <Grid item xs={12} sm={8}>
                <CustomTextField
                  select
                  fullWidth
                  label='Ijrochi'
                  value={simpleAssignee}
                  onChange={e => setSimpleAssignee(Number(e.target.value))}
                >
                  <MenuItem value={0}>---</MenuItem>
                  {(users || []).map(u => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.fullname}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant='contained' fullWidth onClick={handleCreateSimpleAssignment} disabled={!simpleAssignee}>
                  Biriktirish
                </Button>
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='subtitle2'>Task qismlari:</Typography>
              <Button variant='contained' size='small' startIcon={<Icon icon='mdi:plus' />} onClick={handleOpenDialog}>
                Qo'shish
              </Button>
            </Stack>

            {taskParts.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sarlavha</TableCell>
                      <TableCell>Bo'lim</TableCell>
                      <TableCell>Ijrochi</TableCell>
                      <TableCell>Bosh. sanasi</TableCell>
                      <TableCell>Tug. sanasi</TableCell>
                      <TableCell>Izoh</TableCell>
                      <TableCell align='right'>Amal</TableCell>
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
                          <IconButton size='small' color='error' onClick={() => handleDeleteTaskPart(part.id)}>
                            <Icon icon='mdi:delete' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Hali qismlar qo'shilmagan
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>

      {/* Dialog for adding task parts */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Task part qo'shish</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Sarlavha'
                value={partForm.title}
                onChange={e => setPartForm({ ...partForm, title: e.target.value })}
                error={!!partErrors.title}
                helperText={partErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                select
                fullWidth
                label="Bo'lim"
                value={partForm.department}
                onChange={e => setPartForm({ ...partForm, department: Number(e.target.value) })}
                error={!!partErrors.department}
                helperText={partErrors.department}
              >
                <MenuItem value={0}>---</MenuItem>
                {(departments || []).map(d => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                select
                fullWidth
                label='Ijrochi'
                value={partForm.assignee}
                onChange={e => setPartForm({ ...partForm, assignee: Number(e.target.value) })}
                error={!!partErrors.assignee}
                helperText={partErrors.assignee}
              >
                <MenuItem value={0}>---</MenuItem>
                {(users || []).map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.fullname}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                type='date'
                label='Boshlanish sanasi'
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
                label='Tugash sanasi'
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
                label='Izoh'
                value={partForm.note}
                onChange={e => setPartForm({ ...partForm, note: e.target.value })}
                error={!!partErrors.note}
                helperText={partErrors.note}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Bekor qilish</Button>
          <Button variant='contained' onClick={handleSaveTaskPart}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default TaskUpdateForm
