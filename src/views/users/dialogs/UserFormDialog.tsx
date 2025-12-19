import { useEffect, useMemo, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useFetchList } from 'src/hooks/useFetchList'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { useAuth } from 'src/hooks/useAuth'
import { getInitials } from 'src/@core/utils/get-initials'
import { useTranslation } from 'react-i18next'
import { ROLES_OPTIONS } from 'src/configs/consts'

export type UserForm = {
  id?: number
  username: string
  fullname: string
  is_active: boolean
  date_of_birthday?: string
  gender?: string
  phone_number?: string
  avatar?: string
  email: string
  role: string[]
  password?: string
  region: number
  district: number
  address?: string
  companies: number[]
  roles_detail?: any[]
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'create' | 'edit'
  item?: UserForm | null
}

const defaultValues: UserForm = {
  username: '',
  fullname: '',
  is_active: true,
  date_of_birthday: '',
  gender: '',
  phone_number: '',
  avatar: '',
  email: '',
  role: [],
  password: '',
  region: 0,
  district: 0,
  address: '',
  companies: [],
  roles_detail: []
}

const UserFormDialog = ({ open, onClose, onSaved, mode, item }: Props) => {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<UserForm>({ defaultValues })
  const { user } = useAuth()
  // region/district selects
  const { data: regions = [] } = useFetchList<any>(endpoints.region, { perPage: 100 })
  const selectedRegion = watch('region')
  const districtEndpoint = selectedRegion ? `${endpoints.district}?region=${selectedRegion}` : endpoints.district
  const { data: districts = [] } = useFetchList<any>(districtEndpoint, { perPage: 200 })

  // companies multi-select
  const { data: companies = [] } = useFetchList<any>(endpoints.company, { perPage: 200 })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (mode === 'edit' && item) {
      reset({ ...item, password: '', role: item.roles_detail?.map((r: any) => r.id) || [] })
      setPreviewUrl(item.avatar || '')
    } else {
      reset(defaultValues)
      setPreviewUrl('')
    }
  }, [mode, item, reset])

  // Update preview when a new file is chosen
  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    // if no file chosen, keep existing preview (from item) or empty
  }, [avatarFile])

  const onSubmit = async (values: UserForm) => {
    try {
      const payload = { ...values }
      if (!payload.password) delete (payload as any).password

      if (mode === 'create') {
        const form = new FormData()
        if (avatarFile) form.append('avatar', avatarFile)
        Object.keys(values).forEach(item => {
          if (item == 'roles') return
          if (item == 'role') {
            values.role?.forEach(roleId => {
              form.append('roles', roleId)
            })
            return
          }

          if (item == 'companies') {
            values.companies.forEach(companyId => {
              form.append('companies', companyId.toString())
            })
          } else form.append(item, (values as any)[item])
        })
        await DataService.postForm(endpoints.users, form)
      } else if (mode === 'edit' && item?.id) {
        const form = new FormData()
        Object.keys(values).forEach(item => {
          if (item == 'roles') return
          if (item == 'role') {
            values.role?.forEach(roleId => {
              form.append('roles', roleId)
            })
            return
          }
          if (item == 'companies') {
            values.companies.forEach((companyId, index) => {
              form.append(`companies`, companyId.toString())
            })
          } else {
            if (item == 'avatar') return
            form.append(item, (values as any)[item])
          }
        })
        if (avatarFile) form.append('avatar', avatarFile)

        await DataService.putForm(endpoints.userById(item.id), form)
      }
      toast.success(String(t('users.toast.saved')))
      onSaved()
      onClose()
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error(String(t('users.toast.saveError')))
    }
  }

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth='md'>
      <DialogTitle>{mode === 'create' ? String(t('users.create.title')) : String(t('users.edit.title'))}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DatePickerWrapper>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Controller
                  name='fullname'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      label={String(t('users.form.fullname'))}
                      {...field}
                      error={!!errors.fullname}
                      helperText={errors.fullname?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      type='email'
                      label={String(t('users.form.email'))}
                      {...field}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='phone_number'
                  control={control}
                  render={({ field }) => <CustomTextField fullWidth label={String(t('users.form.phone'))} {...field} />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='date_of_birthday'
                  control={control}
                  render={({ field }) => {
                    const selectedDate = field.value ? new Date(field.value) : null
                    return (
                      <div>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                          dateFormat='yyyy-MM-dd'
                          customInput={<CustomTextField label={String(t('users.form.birthDate'))} fullWidth />}
                          showPopperArrow
                          isClearable
                        />
                      </div>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='gender'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field }) => (
                    <FormControl error={!!errors.gender}>
                      <FormLabel>{String(t('users.form.gender'))}</FormLabel>
                      <RadioGroup row {...field}>
                        <FormControlLabel value='male' control={<Radio />} label={String(t('users.gender.male'))} />
                        <FormControlLabel value='female' control={<Radio />} label={String(t('users.gender.female'))} />
                      </RadioGroup>
                      {errors.gender && <FormHelperText>{errors.gender.message as string}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='role'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label={String(t('users.form.role'))}
                      SelectProps={{ multiple: true }}
                      value={Array.isArray(field.value) ? field.value : field.value ? [field.value] : []}
                      onChange={e => {
                        const value = e.target.value
                        field.onChange(typeof value === 'string' ? value.split(',') : value)
                      }}
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    >
                      {ROLES_OPTIONS.map(role => (
                        <MenuItem key={role.value} value={role.value}>
                          {t(`users.roles.${role.label.toLowerCase()}`)}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='username'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      label={String(t('users.form.username'))}
                      {...field}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      type='password'
                      label={String(t('users.form.password'))}
                      {...field}
                      autoComplete='new-password'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='region'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label={String(t('users.form.region'))}
                      {...field}
                      error={!!errors.region}
                      helperText={errors.region?.message}
                    >
                      {regions.map((r: any) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name_uz || r.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='district'
                  control={control}
                  rules={{ required: String(t('errors.required')) }}
                  render={({ field }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label={String(t('users.form.district'))}
                      {...field}
                      error={!!errors.district}
                      helperText={errors.district?.message}
                    >
                      {districts.map((d: any) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name_uz || d.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='address'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField fullWidth label={String(t('users.form.address'))} {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='companies'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label={String(t('users.form.companies'))}
                      {...field}
                      SelectProps={{ multiple: true }}
                    >
                      {companies.map((c: any) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  hidden
                  type='file'
                  accept='image/*'
                  onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <CustomAvatar
                    src={previewUrl || undefined}
                    variant='circular'
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      width: 96,
                      height: 96,
                      cursor: 'pointer',
                      borderRadius: '50%',
                      '& img': { width: '100%', height: '100%', objectFit: 'cover' }
                    }}
                  >
                    {getInitials(watch('fullname') || watch('username') || 'U')}
                  </CustomAvatar>
                  <Button variant='outlined' onClick={() => fileInputRef.current?.click()}>
                    {String(t('users.form.uploadAvatar'))}
                  </Button>
                </div>
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name='is_active'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={!!field.value} onChange={(_, v) => field.onChange(v)} />}
                      label={String(t('users.form.active'))}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DatePickerWrapper>
        </DialogContent>
        <DialogActions>
          <Button type='button' variant='tonal' color='secondary' onClick={onClose} disabled={isSubmitting}>
            {String(t('common.cancel'))}
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? String(t('common.saving')) : String(t('common.save'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UserFormDialog
