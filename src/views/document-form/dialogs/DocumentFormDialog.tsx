import { useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Button } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
      toast.success(String(t('documentForm.toast.updated')))
    } else {
      await DataService.post(endpoints.documentForm, values)
      toast.success(String(t('documentForm.toast.created')))
    }
    onSaved()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {item?.id ? String(t('documentForm.edit.title')) : String(t('documentForm.create.title'))}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4} sx={{ mt: 2 }}>
          <Controller
            name='name_en'
            control={control}
            rules={{ required: true }}
            render={({ field }) => <CustomTextField {...field} label={String(t('common.nameEn'))} fullWidth />}
          />
          <Controller
            name='name_uz'
            control={control}
            rules={{ required: true }}
            render={({ field }) => <CustomTextField {...field} label={String(t('common.nameUz'))} fullWidth />}
          />
          <Controller
            name='name_ru'
            control={control}
            rules={{ required: true }}
            render={({ field }) => <CustomTextField {...field} label={String(t('common.nameRu'))} fullWidth />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose} disabled={isSubmitting}>
          {String(t('common.cancel'))}
        </Button>
        <Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {item?.id ? String(t('common.save')) : String(t('common.create'))}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentFormDialog
