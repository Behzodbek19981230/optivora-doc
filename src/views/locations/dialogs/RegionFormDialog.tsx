import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CustomTextField from 'src/@core/components/mui/text-field'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export type Region = {
  id?: number
  code: string
  name: string
  name_en: string
  name_uz: string
  name_ru: string
  name_lt: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'create' | 'edit'
  item?: Region | null
}

const defaultValues: Region = {
  code: '',
  name: '',
  name_en: '',
  name_uz: '',
  name_ru: '',
  name_lt: ''
}

const RegionFormDialog = ({ open, onClose, onSaved, mode, item }: Props) => {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<Region>({ defaultValues })

  useEffect(() => {
    if (mode === 'edit' && item) {
      reset(item)
    } else if (mode === 'create') {
      reset(defaultValues)
    }
  }, [mode, item, reset])

  const onSubmit = async (values: Region) => {
    // TODO: Replace with your actual DataService and endpoints
    try {
      if (mode === 'create') await DataService.post(endpoints.region, values)
      else if (mode === 'edit' && item) await DataService.put(endpoints.regionById(item.id), values)
      onSaved()
      onClose()
      toast.success(String(t('locations.regions.toast.saved')))
    } catch (error) {
      console.error('Failed to save region:', error)
    }
  }
  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {mode === 'create' ? String(t('locations.regions.create.title')) : String(t('locations.regions.edit.title'))}
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

export default RegionFormDialog
