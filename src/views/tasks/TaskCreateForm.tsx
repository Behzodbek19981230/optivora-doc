import { Grid, Stack, Button, Card, CardContent, Autocomplete } from '@mui/material'
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
import { useTranslation } from 'react-i18next'

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
      .required(String(t('errors.required'))),
    sending_org: yup.number().required(String(t('errors.required'))),
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
    department: yup.number().required(String(t('errors.required'))),
    note: yup.string().required(String(t('errors.required'))),
    list_of_magazine: yup.number().required(String(t('errors.required'))),
    signed_by: yup.number().required(String(t('errors.required')))
  }) as yup.ObjectSchema<TaskPayload>

const TaskCreateForm = () => {
  const { t } = useTranslation()
  const schema = buildSchema(t)
  const { control, handleSubmit } = useForm<TaskPayload>({
    defaultValues: defaults,
    resolver: yupResolver(schema)
  })
  const toast = useThemedToast()
  const router = useRouter()
  const { user } = useAuth()

  const { data: departments } = useFetchList<{ id: number; name: string }>(endpoints.department, {
    page: 1,
    limit: 100
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

  const onSubmit = async (values: TaskPayload) => {
    try {
      const res = await DataService.post(endpoints.task, { ...values, company: user?.company_id })
      const id = (res.data as any)?.id
      toast.success(String(t('tasks.toast.created')))
      if (id) router.push(`/tasks/update/${id}`)
      else router.push('/tasks')
    } catch (e: any) {
      toast.error(e?.message || String(t('tasks.toast.createError')))
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
                  render={({ field, fieldState }) => {
                    const options = [
                      { value: 'ordinary', label: String(t('tasks.priority.ordinary')) },
                      { value: 'orgently', label: String(t('tasks.priority.orgently')) }
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
                            label={String(t('tasks.form.priority'))}
                            error={!!fieldState.error}
                            helperText={safeMsg(fieldState.error?.message)}
                          />
                        )}
                      />
                    )
                  }}
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
                      onChange={(_, v) => field.onChange(v?.id ?? undefined)}
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
                      helperText={fieldState.error?.message}
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

              <Grid item xs={12} sm={6}>
                <Controller
                  name='department'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={departments || []}
                      value={(departments || []).find(d => d.id === field.value) || null}
                      onChange={(_, v) => field.onChange(v?.id ?? undefined)}
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
              <Grid item xs={12} sm={6}>
                <Controller
                  name='signed_by'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={signatories || []}
                      value={(signatories || []).find(u => u.id === field.value) || null}
                      onChange={(_, v) => field.onChange(v?.id ?? undefined)}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      getOptionLabel={o => o?.fullname || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label={String(t('tasks.form.signedBy'))}
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

              <Grid item xs={12} sm={6}>
                <Controller
                  name='list_of_magazine'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={magData || []}
                      value={(magData || []).find(m => m.id === field.value) || null}
                      onChange={(_, v) => field.onChange(v?.id ?? undefined)}
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
      </CardContent>
    </Card>
  )
}

export default TaskCreateForm
