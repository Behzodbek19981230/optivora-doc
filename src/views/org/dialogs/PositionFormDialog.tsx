import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CustomTextField from 'src/@core/components/mui/text-field'
import MenuItem from '@mui/material/MenuItem'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export type Position = {
  id?: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
  department: number
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'create' | 'edit'
  item?: Position | null
}

const defaultValues: Position = {
  name: '',
  name_en: '',
  name_uz: '',
  name_ru: '',
  department: 0
}

const PositionFormDialog = ({ open, onClose, onSaved, mode, item }: Props) => {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<Position>({ defaultValues })

  // Lazy-load departments only when dialog is opened to avoid unnecessary API calls
  const [departments, setDepartments] = useState<any[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false)
  useEffect(() => {
    const loadDeps = async () => {
      if (!open) return
      setLoadingDepartments(true)
      try {
        const res = await DataService.get<any>(`${endpoints.department}?perPage=100`)
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.results) ? res.data.results : []
        setDepartments(list)
      } finally {
        setLoadingDepartments(false)
      }
    }
    loadDeps()
  }, [open])

  useEffect(() => {
    if (mode === 'edit' && item) {
      reset(item)
    } else if (mode === 'create') {
      reset(defaultValues)
    }
  }, [mode, item, reset])

  const onSubmit = async (values: Position) => {
    try {
      if (mode === 'create') await DataService.post(endpoints.position, values)
      else if (mode === 'edit' && item) await DataService.put(endpoints.positionById(item.id), values)
      onSaved()
      onClose()
      toast.success(String(t('org.positions.toast.saved')))
    } catch (error) {
      console.error('Failed to save position:', error)
    }
  }

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {mode === 'create' ? String(t('org.positions.create.title')) : String(t('org.positions.edit.title'))}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field }) => (
                  <CustomTextField fullWidth label={String(t('org.positions.form.name'))} {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_en'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label={String(t('org.common.nameEn'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_uz'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label={String(t('org.common.nameUz'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_ru'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label={String(t('org.common.nameRu'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='department'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={String(t('org.positions.form.department'))}
                    {...field}
                    value={field.value || ''}
                  >
                    {loadingDepartments ? (
                      <MenuItem value='' disabled>
                        {String(t('common.loading'))}
                      </MenuItem>
                    ) : departments.length > 0 ? (
                      departments.map((d: any) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name_uz || d.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value='' disabled>
                        {String(t('org.positions.form.noDepartments'))}
                      </MenuItem>
                    )}
                  </CustomTextField>
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

export default PositionFormDialog
