// ** React Imports
import { Fragment, ReactNode } from 'react'
// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Translations from 'src/layouts/components/Translations'
interface FormModalProps {
  open: boolean
  handleClose: () => void
  handleSave?: () => void
  title: string
  children: ReactNode
  maxWidth?: 'sm' | 'lg' | 'md'
}
const FormModal = ({ open, handleClose, handleSave, title, children, maxWidth = 'sm' }: FormModalProps) => {
  // ** State

  return (
    <Fragment>
      <Dialog
        maxWidth={maxWidth}
        fullWidth={true}
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>
          <Translations text={`${title}`} />
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>
            <Translations text='Cancel' />
          </Button>
          <Button onClick={handleSave}>
            <Translations text='Save' />
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default FormModal
