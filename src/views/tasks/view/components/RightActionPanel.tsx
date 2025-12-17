import { Icon } from '@iconify/react'
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Skeleton
} from '@mui/material'
import React from 'react'
import { TaskType, TaskPartType } from 'src/types/task'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import DocumentTemplate from './DocumentTemplate'

const RightActionsPanel = ({ task, part }: { task?: TaskType; part?: TaskPartType }) => {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { user } = useAuth()
  const [commentOpen, setCommentOpen] = React.useState(false)
  const [attachOpen, setAttachOpen] = React.useState(false)
  const [commentText, setCommentText] = React.useState('')
  const [attachTitle, setAttachTitle] = React.useState('')
  const [attachFile, setAttachFile] = React.useState<File | null>(null)
  const [saving, setSaving] = React.useState(false)

  const taskId = task?.id
  const partId = part?.id

  const contentLabel = partId
    ? String(t('tasks.view.actions.selectedPartLabel', { id: partId }))
    : taskId
    ? String(t('tasks.view.actions.selectedTaskLabel', { id: taskId }))
    : '—'

  const { data, isLoading } = useQuery<{ parts: TaskPartType[]; task: TaskType }>({
    queryKey: ['/task/with-parts/by-id/', taskId],
    queryFn: async () => {
      const params = {
        task_id: Number(taskId)
      }
      const res = await DataService.post<{ parts: TaskPartType[]; task: TaskType }>('/task/with-parts/by-id/', params)

      return res.data || { parts: [], task: { id: 0, title: '', description: '' } }
    },
    enabled: !!taskId,
    staleTime: 10_000
  })

  const resetComment = () => {
    setCommentText('')
  }

  const resetAttach = () => {
    setAttachTitle('')
    setAttachFile(null)
  }

  const refreshComments = async () => {
    if (!taskId) return
    await qc.invalidateQueries({ queryKey: ['task-comments'] })
  }

  const refreshAttachments = async () => {
    if (!taskId) return
    await qc.invalidateQueries({ queryKey: ['task-attachments'] })
  }

  const submitComment = async () => {
    if (!taskId) return
    const text = commentText.trim()
    if (!text) {
      toast.error(String(t('tasks.view.actions.toasts.commentRequired')))

      return
    }

    try {
      setSaving(true)

      await DataService.post(endpoints.taskComment, {
        task: taskId,
        part: partId ?? null,
        author: user?.id,
        text
      })

      toast.success(String(t('tasks.view.actions.toasts.commentAdded')))
      setCommentOpen(false)
      resetComment()
      await refreshComments()
    } catch (e) {
      console.error('Failed to create comment', e)
      toast.error(String(t('tasks.view.actions.toasts.commentAddError')))
    } finally {
      setSaving(false)
    }
  }

  const submitAttachment = async () => {
    if (!taskId) return
    if (!attachFile) {
      toast.error(String(t('tasks.view.actions.toasts.fileRequired')))

      return
    }

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('file', attachFile)
      formData.append('title', attachTitle.trim() || attachFile.name)
      formData.append('task', taskId.toString())
      formData.append('part', partId ? partId.toString() : '')
      await DataService.postForm(endpoints.taskAttachment, formData)

      toast.success(String(t('tasks.view.actions.toasts.fileAttached')))
      setAttachOpen(false)
      resetAttach()
      await refreshAttachments()
    } catch (e) {
      console.error('Failed to create attachment', e)
      toast.error(String(t('tasks.view.actions.toasts.fileAttachError')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2
      }}
    >
      {isLoading ? <Skeleton variant='rectangular' height={100} /> : data && <DocumentTemplate fullTask={data} />}

      <Card sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='subtitle1'>{String(t('tasks.view.actions.title'))}</Typography>

            <Divider />
            <Stack spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                {String(t('tasks.view.actions.selectedSection'))}
              </Typography>

              {partId ? (
                <Stack spacing={1}>
                  <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                    <Chip
                      size='small'
                      icon={<Icon icon='mdi:subdirectory-arrow-right' />}
                      label={String(t('tasks.view.actions.selectedPartLabel', { id: partId }))}
                      variant='outlined'
                    />
                    {part?.title ? <Chip size='small' label={part.title} variant='outlined' /> : null}
                    {part?.status ? <Chip size='small' label={part.status} color='info' variant='outlined' /> : null}
                  </Stack>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('tasks.view.actions.attachmentsApplyToPart'))}
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={0.5}>
                  <Typography variant='body2'>{String(t('tasks.view.actions.noPartSelected'))}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('tasks.view.actions.attachmentsApplyToTask'))}
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Divider />
            <Stack spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                {String(t('tasks.view.actions.deadline'))}
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Icon icon='mdi:calendar' />
                <Typography variant='body2'>{task?.end_date || String(t('common.notSet'))}</Typography>
              </Stack>
              <Button size='small' variant='outlined'>
                {String(t('tasks.view.actions.setDeadline'))}
              </Button>
            </Stack>
            <Divider />
            {partId && (
              <Stack spacing={1}>
                <Typography variant='caption' color='text.secondary'>
                  {String(t('tasks.view.actions.partStatus'))}
                </Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Icon icon='mdi:subdirectory-arrow-right' />
                  <Typography variant='body2'>{part?.status || String(t('common.notSet'))}</Typography>
                </Stack>
                <Stack direction='row' spacing={1}>
                  <Button size='small' variant='contained'>
                    {String(t('common.start'))}
                  </Button>
                  <Button size='small' variant='outlined'>
                    {String(t('common.finish'))}
                  </Button>
                </Stack>
              </Stack>
            )}
            <Divider />
            <Stack spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                {String(t('tasks.view.actions.files'))}
              </Typography>
              <Stack direction='row' spacing={1}>
                <Button
                  size='small'
                  startIcon={<Icon icon='mdi:paperclip' />}
                  variant='outlined'
                  disabled={!taskId}
                  onClick={() => setAttachOpen(true)}
                >
                  {String(t('tasks.view.actions.addFile'))}
                </Button>
              </Stack>
            </Stack>
            <Divider />
            <Stack spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                {String(t('tasks.view.actions.comments'))}
              </Typography>
              <Button
                size='small'
                startIcon={<Icon icon='mdi:comment' />}
                variant='outlined'
                disabled={!taskId}
                onClick={() => setCommentOpen(true)}
              >
                {String(t('tasks.view.actions.addComment'))}
              </Button>
            </Stack>
          </Stack>

          {/* Comment dialog */}
          <Dialog open={commentOpen} onClose={saving ? undefined : () => setCommentOpen(false)} fullWidth maxWidth='sm'>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon='mdi:comment' />
              {String(t('tasks.view.actions.commentDialog.title', { target: contentLabel }))}
            </DialogTitle>
            <DialogContent>
              <CustomTextField
                autoFocus
                fullWidth
                minRows={4}
                multiline
                label={String(t('tasks.view.actions.commentDialog.messageLabel'))}
                placeholder={String(t('tasks.view.actions.commentDialog.messagePlaceholder'))}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={saving}
                sx={{ mt: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant='text'
                color='secondary'
                disabled={saving}
                onClick={() => {
                  setCommentOpen(false)
                  resetComment()
                }}
              >
                {String(t('common.cancel'))}
              </Button>
              <Button variant='contained' disabled={saving} onClick={submitComment}>
                {String(t('common.send'))}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Attachment dialog */}
          <Dialog open={attachOpen} onClose={saving ? undefined : () => setAttachOpen(false)} fullWidth maxWidth='sm'>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon='mdi:paperclip' />
              {String(t('tasks.view.actions.attachmentDialog.title', { target: contentLabel }))}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <CustomTextField
                  fullWidth
                  label={String(t('tasks.view.actions.attachmentDialog.titleLabel'))}
                  value={attachTitle}
                  onChange={e => setAttachTitle(e.target.value)}
                  disabled={saving}
                />

                <Button
                  component='label'
                  variant='outlined'
                  disabled={saving}
                  startIcon={<Icon icon='mdi:file-upload' />}
                >
                  {String(t('tasks.view.actions.attachmentDialog.chooseFile'))}
                  <input hidden type='file' onChange={e => setAttachFile(e.target.files?.[0] || null)} />
                </Button>

                {attachFile ? (
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Chip
                      icon={<Icon icon='mdi:file' />}
                      label={attachFile.name}
                      variant='outlined'
                      onDelete={saving ? undefined : () => setAttachFile(null)}
                    />
                  </Stack>
                ) : null}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                variant='text'
                color='secondary'
                disabled={saving}
                onClick={() => {
                  setAttachOpen(false)
                  resetAttach()
                }}
              >
                {String(t('common.cancel'))}
              </Button>
              <Button variant='contained' disabled={saving} onClick={submitAttachment}>
                {String(t('tasks.view.actions.attachmentDialog.attach'))}
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  )
}

export default RightActionsPanel
