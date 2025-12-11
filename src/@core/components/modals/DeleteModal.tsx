// ** React Imports
import { Fragment, useState } from 'react'
// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Translations from 'src/layouts/components/Translations'
interface DeleteModalProps {
  open: boolean
  handleClose: () => void
  handleDelete: () => void
  title: string
}
const DeleteModal = ({ open, handleClose, handleDelete, title }: DeleteModalProps) => {
  // ** State

  return (
    <Fragment>
      <Dialog
        maxWidth='sm'
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
          <Translations text='Do you want to delete?' />
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>{title}</DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>
            <Translations text='Cancel' />
          </Button>
          <Button onClick={handleDelete}>
            <Translations text='Delete' />
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default DeleteModal
