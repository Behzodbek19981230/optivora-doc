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
import { FormControlLabel, Switch, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material'
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
  type AttachmentRow = { isLink: boolean; link: string; file: File | null }
  const [newAttachments, setNewAttachments] = React.useState<AttachmentRow[]>([])
  const [savingCombined, setSavingCombined] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    comment?: string
    file?: string
  }>({
    comment: '',
    file: ''
  })

  const handleAddAttachmentRow = () => setNewAttachments(prev => [...prev, { isLink: false, link: '', file: null }])
  const handleRemoveAttachmentRow = (idx: number) => setNewAttachments(prev => prev.filter((_, i) => i !== idx))
  const handleToggleAttachmentType = (idx: number, isLink: boolean) =>
    setNewAttachments(prev =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              isLink,
              link: isLink ? row.link : '',
              file: isLink ? null : row.file
            }
          : row
      )
    )

  const handleChangeAttachmentLink = (idx: number, link: string) =>
    setNewAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, link } : row)))

  const handleChangeAttachmentFile = (idx: number, file: File | null) =>
    setNewAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, file } : row)))

  // Prefill 1 empty row when drawer opens (ReplyLetterForm-like UX)
  React.useEffect(() => {
    if (open && newAttachments.length === 0) {
      setNewAttachments([{ isLink: false, link: '', file: null }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const resetCombined = () => {
    setCommentText(EditorState.createEmpty())
    setNewAttachments([])
    setErrors({
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
    const hasAttachment = newAttachments.some(r => (r.isLink ? !!r.link?.trim() : !!r.file))
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
    if (!hasAttachment) {
      setErrors(prev => ({
        ...prev,
        file: String(t('tasks.view.actions.toasts.fileRequired') || 'Attachment is required')
      }))

      return
    } else {
      setErrors(prev => ({
        ...prev,
        file: ''
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

      if (hasAttachment) {
        const rowsToUpload = newAttachments.filter(r => (r.isLink ? r.link.trim().length : !!r.file))
        if (!rowsToUpload.length) {
          toast.error(String(t('tasks.view.actions.toasts.fileRequired') || 'Attachment is required'))

          return
        }
        for (const row of rowsToUpload) {
          const formData = new FormData()
          formData.append('title', '')
          formData.append('link', row.isLink ? row.link.trim() : '')
          formData.append('part', partId ? partId.toString() : '')
          formData.append('uploaded_by', user?.id?.toString() ?? '')
          if (!row.isLink && row.file) formData.append('file', row.file)
          await DataService.postForm(endpoints.taskAttachment, formData)
        }
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
      sx={{ '& .MuiDrawer-paper': { width: [420, 760] } }}
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
                <Typography variant='subtitle2'>
                  {String(t('tasks.view.actions.attachmentDialog.title') || '')}
                </Typography>

                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>{String(t('common.file') || 'File')}</TableCell>
                      <TableCell align='right'>{String(t('common.actions') || 'Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newAttachments.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ width: '90%' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={row.isLink}
                                onChange={e => handleToggleAttachmentType(idx, e.target.checked)}
                              />
                            }
                            label={row.isLink ? 'Link' : 'File'}
                          />

                          {row.isLink ? (
                            <CustomTextField
                              fullWidth
                              size='small'
                              label={String(t('common.link', { defaultValue: 'Link' }))}
                              value={row.link}
                              onChange={e => handleChangeAttachmentLink(idx, e.target.value)}
                            />
                          ) : (
                            <>
                              <Button
                                component='label'
                                variant='outlined'
                                size='small'
                                startIcon={<Icon icon='tabler:upload' />}
                              >
                                {String(t('tasks.view.actions.attachmentDialog.chooseFile') || 'Choose file')}
                                <input
                                  hidden
                                  type='file'
                                  onChange={e => handleChangeAttachmentFile(idx, e.target.files?.[0] || null)}
                                />
                              </Button>
                              <Typography variant='caption' sx={{ display: 'block', mt: 1 }} color='text.secondary'>
                                {row.file
                                  ? row.file.name
                                  : String(
                                      t('tasks.view.actions.attachmentDialog.noFileSelected') || 'No file selected'
                                    )}
                              </Typography>
                            </>
                          )}
                        </TableCell>
                        <TableCell align='right'>
                          <Tooltip title={String(t('common.delete') || 'Delete')}>
                            <IconButton size='small' color='error' onClick={() => handleRemoveAttachmentRow(idx)}>
                              <Icon icon='mdi:delete' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box>
                  <Button
                    variant='text'
                    size='small'
                    startIcon={<Icon icon='mdi:plus' />}
                    onClick={handleAddAttachmentRow}
                  >
                    {String(t('tasks.view.actions.attachmentDialog.addRow') || 'Add file')}
                  </Button>
                </Box>
                {errors.file ? (
                  <Typography color='error' variant='caption' sx={{ mb: 1 }}>
                    {errors.file}
                  </Typography>
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
