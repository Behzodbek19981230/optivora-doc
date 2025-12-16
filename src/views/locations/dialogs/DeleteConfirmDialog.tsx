import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  title?: string
  description?: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
  confirming?: boolean
}

const DeleteConfirmDialog = ({ open, onClose, onConfirm, confirming, title, description }: Props) => {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={confirming ? undefined : onClose} fullWidth maxWidth='xs'>
      <DialogTitle>{title || String(t('common.deleteConfirm.title'))}</DialogTitle>
      <DialogContent>
        <Typography variant='body2'>{description || String(t('common.deleteConfirm.description'))}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={Boolean(confirming)}>
          {String(t('common.cancel'))}
        </Button>
        <Button color='error' onClick={() => onConfirm()} disabled={Boolean(confirming)}>
          {confirming ? String(t('common.deleting')) : String(t('common.delete'))}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmDialog
