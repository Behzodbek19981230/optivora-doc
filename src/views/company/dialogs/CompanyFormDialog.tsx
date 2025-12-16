import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CustomTextField from 'src/@core/components/mui/text-field'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useFetchList } from 'src/hooks/useFetchList'
import { useTranslation } from 'react-i18next'

type CompanyForm = {
  id?: number
  code: string
  name: string
  is_active: boolean
  phone: string
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

  // Fetch regions and districts
  const { data: regions = [] } = useFetchList<{ id: number; name: string }>(endpoints.region, { perPage: 100 })
  const selectedRegion = watch('region')
  const districtEndpoint = selectedRegion ? `${endpoints.district}?region=${selectedRegion}` : endpoints.district
  const { data: districts = [] } = useFetchList<{ id: number; name: string; region_id: number }>(districtEndpoint, {
    perPage: 200
  })

  useEffect(() => {
    if (mode === 'edit' && item) {
      reset(item)
    } else {
      reset(defaultValues)
    }
  }, [mode, item, reset])

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
          form.append('region', values.region.toString())
          form.append('district', values.district.toString())
          form.append('address', values.address)

          await DataService.postForm(endpoints.company, form)
        } else await DataService.post<{ id: number }>(endpoints.company, values)
      } else if (mode === 'edit' && item?.id) {
        await DataService.put(endpoints.companyById(item.id), values)
        if (logoFile) {
          const form = new FormData()
          form.append('logo', logoFile)
          form.append('code', values.code)
          form.append('name', values.name)
          form.append('phone', values.phone)
          form.append('region', values.region.toString())
          form.append('district', values.district.toString())
          form.append('address', values.address)

          await DataService.postForm(endpoints.companyById(item.id), form)
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
                name='region'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={String(t('company.form.region'))}
                    {...field}
                    error={!!errors.region}
                    helperText={errors.region?.message}
                  >
                    {regions.map(r => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
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
                    label={String(t('company.form.district'))}
                    {...field}
                    error={!!errors.district}
                    helperText={errors.district?.message}
                  >
                    {districts.map(d => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <input type='file' onChange={e => setLogoFile(e.target.files?.[0] || null)} />
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
