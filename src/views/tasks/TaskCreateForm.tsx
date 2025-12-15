import { useEffect, useState } from 'react'
import { Grid, Stack, Button, MenuItem, Card, CardContent } from '@mui/material'
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
  task_form: undefined,
  sending_org: undefined,
  input_doc_number: '',
  output_doc_number: '',
  start_date: '',
  end_date: '',
  priority: 'ordinary',
  department: undefined,
  signed_by: undefined,
  note: '',
  list_of_magazine: undefined
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

const TaskCreateForm = () => {
  const { control, handleSubmit } = useForm<TaskPayload>({
    defaultValues: defaults,
    resolver: yupResolver(schema)
  })
  const toast = useThemedToast()
  const router = useRouter()
  const { user } = useAuth()

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

  const onSubmit = async (values: TaskPayload) => {
    try {
      const res = await DataService.post(endpoints.task, { ...values, company: user?.company_id })
      const id = (res.data as any)?.id
      toast.success('Task created')
      if (id) router.push(`/tasks/update/${id}`)
      else router.push('/tasks')
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
    </Card>
  )
}

export default TaskCreateForm
