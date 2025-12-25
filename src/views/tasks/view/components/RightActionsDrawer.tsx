// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import React from 'react'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Chip } from '@mui/material'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
import EditorControlled from 'src/views/forms/form-elements/editor/EditorControlled'
import { EditorState } from 'draft-js'
import { TaskPartType, TaskType } from 'src/types/task'

interface Props {
  open: boolean
  toggle: () => void
  taskId?: number | null
  partId?: number | null
  part?: TaskPartType | null
  task?: TaskType | null
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const RightActionsDrawer = ({ open, toggle, taskId, partId, part, task }: Props) => {
  const { user } = useAuth()
  const { t } = useTranslation()

  // Comment + Attachment fields (moved into drawer)

  const [commentText, setCommentText] = React.useState(EditorState.createEmpty())
  const [attachTitle, setAttachTitle] = React.useState('')
  const [attachFile, setAttachFile] = React.useState<File | null>(null)
  const [savingCombined, setSavingCombined] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    title?: string
    comment?: string
    file?: string
  }>({
    title: '',
    comment: '',
    file: ''
  })
  const resetCombined = () => {
    setCommentText(EditorState.createEmpty())
    setAttachTitle('')
    setAttachFile(null)
    setErrors({
      title: '',
      comment: '',
      file: ''
    })
  }

  const handleCombinedSubmit = async () => {
    if (!taskId) {
      toast.error(String(t('tasks.view.actions.toasts.taskRequired') || 'Task id required'))

      return
    }

    const hasComment = commentText.getCurrentContent().hasText()
    const hasFile = !!attachFile
    if (!hasComment) {
      setErrors(prev => ({
        ...prev,
        comment: String(t('tasks.view.actions.toasts.commentRequired') || 'Comment is required')
      }))

      return
    } else {
      setErrors(prev => ({
        ...prev,
        comment: ''
      }))
    }
    if (!hasFile) {
      setErrors(prev => ({
        ...prev,
        file: String(t('tasks.view.actions.toasts.fileRequired') || 'File is required')
      }))

      return
    } else {
      setErrors(prev => ({
        ...prev,
        file: ''
      }))
    }

    if (!Boolean(attachTitle)) {
      setErrors(prev => ({
        ...prev,
        title: String(t('tasks.view.actions.toasts.titleRequired') || 'Title is required')
      }))

      return
    } else {
      setErrors(prev => ({
        ...prev,
        title: ''
      }))
    }

    try {
      setSavingCombined(true)

      if (hasComment) {
        await DataService.post(endpoints.taskComment, {
          part: partId ?? null,
          author: user?.id,
          text: commentText.getCurrentContent().getPlainText()
        })
      }

      if (hasFile && attachFile) {
        const formData = new FormData()
        formData.append('file', attachFile)
        formData.append('title', attachTitle.trim() || attachFile.name)
        formData.append('part', partId ? partId.toString() : '')
        formData.append('uploaded_by', user?.id?.toString() ?? '')
        await DataService.postForm(endpoints.taskAttachment, formData)
      }

      await DataService.patch(endpoints.taskPartById(partId ?? null), {
        status: 'on_review',
        task: taskId
      })

      toast.success(String(t('tasks.view.actions.toasts.saved') || 'Saved'))
      resetCombined()
      toggle()
    } catch (e) {
      console.error('Failed to submit combined from drawer', e)
      toast.error(String(t('tasks.view.actions.toasts.saveError') || 'Failed to save'))
    } finally {
      setSavingCombined(false)
      resetCombined()
    }
  }

  const handleResendCombined = async () => {
    const hasComment = commentText.getCurrentContent().hasText()
    if (!hasComment) {
      setErrors(prev => ({
        ...prev,
        comment: String(t('tasks.view.actions.toasts.commentRequired') || 'Comment is required')
      }))

      return
    } else {
      setErrors(prev => ({
        ...prev,
        comment: ''
      }))
    }
    try {
      setSavingCombined(true)
      await DataService.patch(endpoints.taskPartById(partId ?? null), {
        status: 'returned',
        task: taskId
      })
      toast.success(String(t('tasks.view.actions.toasts.resend') || 'Resend'))
    } catch (e) {
      console.error('Failed to resend combined', e)
      toast.error(String(t('tasks.view.actions.toasts.resendError') || 'Failed to resend'))
    } finally {
      setSavingCombined(false)
      resetCombined()
      toggle()
    }
  }
  const handleCancelCombined = async () => {
    const hasComment = commentText.getCurrentContent().hasText()
    if (!hasComment) {
      setErrors(prev => ({
        ...prev,
        comment: String(t('tasks.view.actions.toasts.commentRequired') || 'Comment is required')
      }))

      return
    } else {
      setErrors(prev => ({
        ...prev,
        comment: ''
      }))
    }
    try {
      setSavingCombined(true)
      await DataService.patch(endpoints.taskPartById(partId ?? null), {
        status: 'cancelled',
        task: taskId
      })
      toast.success(String(t('tasks.view.actions.toasts.cancel') || 'Cancel'))
    } catch (e) {
      console.error('Failed to cancel combined', e)
    } finally {
      setSavingCombined(false)
      resetCombined()
      toggle()
    }
  }
  const handleDoneCombined = async () => {
    const hasComment = commentText.getCurrentContent().hasText()
    if (!hasComment) {
      setErrors(prev => ({
        ...prev,
        comment: String(t('tasks.view.actions.toasts.commentRequired') || 'Comment is required')
      }))

      return
    } else {
      setErrors(prev => ({
        ...prev,
        comment: ''
      }))
    }
    try {
      setSavingCombined(true)
      await DataService.patch(endpoints.taskPartById(partId ?? null), {
        status: 'done',
        task: taskId
      })
      toast.success(String(t('tasks.view.actions.toasts.done') || 'Done'))
    } catch (e) {
      console.error('Failed to complete combined', e)
    } finally {
      setSavingCombined(false)
      resetCombined()
      toggle()
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={toggle}
      sx={{ '& .MuiDrawer-paper': { width: [300, 400] } }}
      ModalProps={{ keepMounted: true }}
    >
      <Header>
        <Typography variant='h5'>{String(t('tasks.view.actions.drawerTitle') || 'Send / Execute')}</Typography>
        <IconButton
          size='small'
          onClick={toggle}
          sx={{
            p: '0.375rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Header>
      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        {/* Combined Comment + Attachment section inside drawer */}
        <Box>
          {user?.id === part?.assignee_detail?.id &&
            partId &&
            (part?.status === 'new' || part?.status === 'in_progress' || part?.status === 'returned') && (
              <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomTextField
                  fullWidth
                  label={String(t('tasks.view.actions.attachmentDialog.titleLabel') || 'Attachment title')}
                  value={attachTitle}
                  onChange={e => setAttachTitle(e.target.value)}
                  sx={{ mb: 1 }}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                />

                <Button component='label' variant='outlined' startIcon={<Icon icon='tabler:upload' />} sx={{ mb: 1 }}>
                  {String(t('tasks.view.actions.attachmentDialog.chooseFile') || 'Choose file')}
                  <input hidden type='file' onChange={e => setAttachFile(e.target.files?.[0] || null)} />
                </Button>
                {errors.file ? (
                  <Typography color='error' variant='caption' sx={{ mb: 1 }}>
                    {errors.file}
                  </Typography>
                ) : null}

                {attachFile ? (
                  <Box sx={{ mb: 1 }}>
                    <Chip label={attachFile.name} />
                  </Box>
                ) : null}
              </Box>
            )}

          <EditorWrapper>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>{String(t('commands.form.basis'))}</div>
            <EditorControlled
              editorState={commentText}
              onEditorStateChange={state => {
                setCommentText(state)
              }}
            />
            <Typography color='error' variant='caption' sx={{ mb: 1 }}>
              {errors.comment}
            </Typography>
          </EditorWrapper>
          {user?.id == part?.assignee_detail?.id &&
            partId &&
            (part?.status === 'new' || part?.status === 'in_progress' || part?.status === 'returned') && (
              <Box sx={{ display: 'flex', gap: 2, mt: 20 }}>
                <Button variant='contained' onClick={handleCombinedSubmit} disabled={savingCombined}>
                  {String(t('tasks.view.actions.drawer.executeCombined') || 'Bajarish')}
                </Button>
                <Button variant='outlined' color='secondary' onClick={() => resetCombined()} disabled={savingCombined}>
                  {String(t('common.clear') || 'Clear')}
                </Button>
              </Box>
            )}
          {user?.id === task?.signed_by_detail?.id &&
            partId &&
            part?.status !== 'new' &&
            part?.status !== 'in_progress' &&
            part?.status !== 'returned' && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 20 }}>
                <Button variant='contained' color='warning' onClick={handleResendCombined} disabled={savingCombined}>
                  {String(t('tasks.view.actions.resendForReview') || 'Resend for review')}
                </Button>
                <Button variant='contained' color='error' onClick={handleCancelCombined} disabled={savingCombined}>
                  {String(t('tasks.view.actions.cancel') || String(t('common.cancel')) || 'Cancel')}
                </Button>
                <Button variant='contained' onClick={handleDoneCombined} disabled={savingCombined}>
                  {String(t('tasks.view.actions.done') || 'Done')}
                </Button>
              </Box>
            )}
        </Box>
      </Box>
    </Drawer>
  )
}

export default RightActionsDrawer
