import { useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Button } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import useThemedToast from 'src/@core/hooks/useThemedToast'

type DocForm = {
  id?: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

type Props = {
  open: boolean
  item: DocForm | null
  onClose: () => void
  onSaved: () => void
}

const defaultValues: DocForm = {
  name: '',
  name_en: '',
  name_uz: '',
  name_ru: ''
}

const DocumentFormDialog = ({ open, item, onClose, onSaved }: Props) => {
  const toast = useThemedToast()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<DocForm>({ defaultValues })

  useEffect(() => {
    reset(item || defaultValues)
  }, [item, reset])

  const onSubmit = async (values: DocForm) => {
    if (item?.id) {
      await DataService.put(endpoints.documentFormById(item.id), values)
      toast.success('Updated successfully')
    } else {
      await DataService.post(endpoints.documentForm, values)
      toast.success('Created successfully')
    }
    onSaved()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>{item?.id ? 'Edit Document Form' : 'New Document Form'}</DialogTitle>
      <DialogContent>
        <Stack spacing={4} sx={{ mt: 2 }}>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => <CustomTextField {...field} label='Name' fullWidth />}
          />
          <Controller
            name='name_en'
            control={control}
            rules={{ required: true }}
            render={({ field }) => <CustomTextField {...field} label='Name (EN)' fullWidth />}
          />
          <Controller
            name='name_uz'
            control={control}
            rules={{ required: true }}
            render={({ field }) => <CustomTextField {...field} label='Name (UZ)' fullWidth />}
          />
          <Controller
            name='name_ru'
            control={control}
            rules={{ required: true }}
            render={({ field }) => <CustomTextField {...field} label='Name (RU)' fullWidth />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {item?.id ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentFormDialog
