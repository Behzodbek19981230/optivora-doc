import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/@core/components/mui/text-field'
import Autocomplete from '@mui/material/Autocomplete'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useFetchList } from 'src/hooks/useFetchList'
import { useTranslation } from 'react-i18next'
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'

type CompanyForm = {
  id?: number
  code: string
  name: string
  is_active: boolean
  phone: string
  country: number
  region: number
  district: number
  address: string
  created_by: number
  logo?: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'create' | 'edit'
  item?: CompanyForm | null
}

const defaultValues: CompanyForm = {
  code: '',
  name: '',
  is_active: true,
  phone: '',
  country: 0,
  region: 0,
  district: 0,
  address: '',
  created_by: 0,
  logo: ''
}

const CompanyFormDialog = ({ open, onClose, onSaved, mode, item }: Props) => {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<CompanyForm>({ defaultValues })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch regions and districts
  const { data: countries = [] } = useFetchList<{ id: number; name: string }>(endpoints.country, { perPage: 100 })
  const { data: regions = [] } = useFetchList<{ id: number; name: string }>(endpoints.region, { perPage: 100 })
  const selectedRegion = watch('region')
  const districtEndpoint = selectedRegion ? `${endpoints.district}?region=${selectedRegion}` : endpoints.district
  const { data: districts = [] } = useFetchList<{ id: number; name: string; region_id: number }>(districtEndpoint, {
    perPage: 200
  })

  useEffect(() => {
    if (mode === 'edit' && item) {
      reset(item)
      setLogoPreview(item.logo || null)
    } else {
      reset(defaultValues)
      setLogoPreview(null)
    }
    setLogoFile(null)
  }, [mode, item, reset])

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile)
      setLogoPreview(url)

      return () => URL.revokeObjectURL(url)
    }
  }, [logoFile])

  const onSubmit = async (values: CompanyForm) => {
    try {
      if (mode === 'create') {
        // upload logo if chosen
        if (logoFile) {
          const form = new FormData()
          form.append('logo', logoFile)
          form.append('code', values.code)
          form.append('name', values.name)
          form.append('phone', values.phone)
          form.append('country', values.country.toString())
          form.append('region', values.region.toString())
          form.append('district', values.district.toString())
          form.append('address', values.address)

          await DataService.postForm(endpoints.company, form)
        } else await DataService.post<{ id: number }>(endpoints.company, values)
      } else if (mode === 'edit' && item?.id) {
        if (logoFile) {
          const form = new FormData()
          form.append('logo', logoFile)
          form.append('code', values.code)
          form.append('name', values.name)
          form.append('phone', values.phone)
          form.append('country', values.country.toString())
          form.append('region', values.region.toString())
          form.append('district', values.district.toString())
          form.append('address', values.address)

          await DataService.putForm(endpoints.companyById(item.id), form)
        } else {
          delete values.logo
          await DataService.put(endpoints.companyById(item.id), values)
        }
        if (!item?.is_active) {
          window.location.reload()
        }
      }
      toast.success(String(t('company.toast.saved')))
      onSaved()
      onClose()
    } catch (error) {
      console.error('Failed to save company:', error)
      toast.error(String(t('company.toast.saveError')))
    }
  }

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth='md'>
      <DialogTitle>
        {mode === 'create' ? String(t('company.create.title')) : String(t('company.edit.title'))}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  {String(t('company.table.logo'))}
                </Typography>
                <CustomAvatar
                  src={logoPreview || undefined}
                  variant='circular'
                  sx={{
                    width: 100,
                    height: 100,
                    cursor: 'pointer',
                    borderColor: 'primary.main',
                    '& img': { width: '100%', height: '100%', objectFit: 'contain' }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {!logoPreview && <Icon icon='tabler:camera-plus' />}
                </CustomAvatar>
                <input
                  type='file'
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept='image/*'
                  onChange={e => setLogoFile(e.target.files?.[0] || null)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='code'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={String(t('company.form.code'))}
                    {...field}
                    error={!!errors.code}
                    helperText={errors.code?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={String(t('company.form.name'))}
                    {...field}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='phone'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label={String(t('company.form.phone'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth label={String(t('company.form.address'))} {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='country'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={countries}
                    value={countries.find(c => c.id === field.value) || null}
                    onChange={(_, v) => field.onChange(v?.id ?? 0)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionLabel={o => o?.name || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label={String(t('company.form.country'))}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='region'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={regions}
                    value={regions.find(r => r.id === field.value) || null}
                    onChange={(_, v) => field.onChange(v?.id ?? 0)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionLabel={o => o?.name || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label={String(t('company.form.region'))}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='district'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={districts}
                    value={districts.find(d => d.id === field.value) || null}
                    onChange={(_, v) => field.onChange(v?.id ?? 0)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionLabel={o => o?.name || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label={String(t('company.form.district'))}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='is_active'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={!!field.value} onChange={(_, v) => field.onChange(v)} />}
                    label={String(t('company.form.active'))}
                  />
                )}
              />
            </Grid>
          </Grid>
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

export default CompanyFormDialog
