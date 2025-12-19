import { useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { useTranslation } from 'react-i18next'

type Magazine = {
  id?: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

type Props = {
  open: boolean
  item: Magazine | null
  onClose: () => void
  onSaved: () => void
}

const defaultValues: Magazine = {
  name: '',
  name_en: '',
  name_uz: '',
  name_ru: ''
}

const MagazineListDialog = ({ open, item, onClose, onSaved }: Props) => {
  const toast = useThemedToast()
  const { t } = useTranslation()
  const { control, handleSubmit, reset } = useForm<Magazine>({ defaultValues })

  useEffect(() => {
    if (item) reset(item)
    else reset(defaultValues)
  }, [item, reset])

  const onSubmit = async (values: Magazine) => {
    try {
      if (item?.id) {
        await DataService.put(endpoints.listOfMagazineById(item.id), values)
        toast.success(String(t('listOfMagazine.toast.updated')))
      } else {
        await DataService.post(endpoints.listOfMagazine, values)
        toast.success(String(t('listOfMagazine.toast.created')))
      }
      onSaved()
    } catch (e: any) {
      toast.error(e?.message || String(t('common.error')))
    }
  }

  return (
    <Dialog fullWidth maxWidth='sm' open={open} onClose={onClose}>
      <DialogTitle>
        {item ? String(t('listOfMagazine.edit.title')) : String(t('listOfMagazine.create.title'))}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name_en'
                control={control}
                rules={{ required: true }}
                render={({ field }) => <CustomTextField fullWidth label={String(t('common.nameEn'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name_uz'
                control={control}
                rules={{ required: true }}
                render={({ field }) => <CustomTextField fullWidth label={String(t('common.nameUz'))} {...field} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name_ru'
                control={control}
                rules={{ required: true }}
                render={({ field }) => <CustomTextField fullWidth label={String(t('common.nameRu'))} {...field} />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={onClose}>
            {String(t('common.cancel'))}
          </Button>
          <Button variant='contained' type='submit'>
            {String(t('common.save'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default MagazineListDialog
