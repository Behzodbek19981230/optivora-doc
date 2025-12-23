import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CustomTextField from 'src/@core/components/mui/text-field'
import Autocomplete from '@mui/material/Autocomplete'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export type District = {
  id?: number
  code: string
  name: string
  name_en: string
  name_uz: string
  name_ru: string
  name_lt: string
  region: number
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'create' | 'edit'
  item?: District | null
}

const defaultValues: District = {
  code: '',
  name: '',
  name_en: '',
  name_uz: '',
  name_ru: '',
  name_lt: '',
  region: 0
}

const DistrictFormDialog = ({ open, onClose, onSaved, mode, item }: Props) => {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<District>({ defaultValues })

  // Fetch region list
  const { data: regions = [], loading: loadingRegions } = useFetchList<any>('/region', { perPage: 100 })

  useEffect(() => {
    if (mode === 'edit' && item) {
      reset(item)
    } else if (mode === 'create') {
      reset(defaultValues)
    }
  }, [mode, item, reset])

  const onSubmit = async (values: District) => {
    // TODO: Replace with your actual DataService and endpoints
    try {
      if (mode === 'create') await DataService.post(endpoints.district, values)
      else if (mode === 'edit' && item) await DataService.put(endpoints.districtById(item.id), values)
      onSaved()
      onClose()
      toast.success(String(t('locations.districts.toast.saved')))
    } catch (error) {
      console.error('Failed to save district:', error)
    }
  }

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {mode === 'create'
          ? String(t('locations.districts.create.title'))
          : String(t('locations.districts.edit.title'))}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='code'
                control={control}
                rules={{ required: true }}
                render={({ field }) => <CustomTextField fullWidth label={String(t('chooseCompany.code'))} {...field} />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='name_en'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label={String(t('common.nameEn'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_uz'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label={String(t('common.nameUz'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_ru'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label={String(t('common.nameRu'))} {...field} />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='region'
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    loading={loadingRegions}
                    options={regions}
                    value={regions.find((r: any) => Number(r.id) === Number(field.value)) || null}
                    onChange={(_, v) => field.onChange(v?.id ? Number(v.id) : 0)}
                    isOptionEqualToValue={(o: any, v: any) => Number(o.id) === Number(v.id)}
                    getOptionLabel={(o: any) => o?.name_uz || o?.name || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label={String(t('locations.districts.form.region'))}
                        error={!!fieldState.error}
                        helperText={fieldState.error ? String(t('errors.required')) : undefined}
                      />
                    )}
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

export default DistrictFormDialog
