import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  open: boolean
  title?: string
  description?: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
  confirming?: boolean
}

const DeleteConfirmDialog = ({ open, onClose, onConfirm, confirming, title, description }: Props) => {
  return (
    <Dialog open={open} onClose={confirming ? undefined : onClose} fullWidth maxWidth='xs'>
      <DialogTitle>{title || 'O‘chirishni tasdiqlang'}</DialogTitle>
      <DialogContent>
        <Typography variant='body2'>
          {description || 'Bu amalni bekor qilib bo‘lmaydi. Haqiqatdan ham o‘chirmoqchimisiz?'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={Boolean(confirming)}>
          Bekor qilish
        </Button>
        <Button color='error' onClick={() => onConfirm()} disabled={Boolean(confirming)}>
          {confirming ? 'O‘chirilmoqda…' : 'O‘chirish'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmDialog
