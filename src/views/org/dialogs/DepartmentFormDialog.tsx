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

export type Department = {
  id?: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'create' | 'edit'
  item?: Department | null
}

const defaultValues: Department = {
  name: '',
  name_en: '',
  name_uz: '',
  name_ru: ''
}

const DepartmentFormDialog = ({ open, onClose, onSaved, mode, item }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<Department>({ defaultValues })

  useEffect(() => {
    if (mode === 'edit' && item) {
      reset(item)
    } else if (mode === 'create') {
      reset(defaultValues)
    }
  }, [mode, item, reset])

  const onSubmit = async (values: Department) => {
    try {
      if (mode === 'create') await DataService.post(endpoints.department, values)
      else if (mode === 'edit' && item) await DataService.put(endpoints.departmentById(item.id), values)
      onSaved()
      onClose()
      toast.success('Bo\u2018lim muvaffaqiyatli saqlandi')
    } catch (error) {
      console.error('Failed to save department:', error)
    }
  }

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>{mode === 'create' ? 'Bo\u2018lim qo\u2018shish' : 'Bo\u2018limni tahrirlash'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => <CustomTextField fullWidth label='Nomi' {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_en'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label='Nomi (EN)' {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_uz'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label='Nomi (UZ)' {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='name_ru'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label='Nomi (RU)' {...field} />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type='button' variant='tonal' color='secondary' onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default DepartmentFormDialog
