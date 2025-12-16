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
  TextField
} from '@mui/material'
import React from 'react'
import { TaskType, TaskPartType } from 'src/types/task'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useAuth } from 'src/hooks/useAuth'

const RightActionsPanel = ({ task, part }: { task?: TaskType; part?: TaskPartType }) => {
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

  const contentLabel = partId ? `Qism #${partId}` : taskId ? `Task #${taskId}` : '—'

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
      toast.error('Izoh matnini kiriting')
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

      toast.success('Izoh qo‘shildi')
      setCommentOpen(false)
      resetComment()
      await refreshComments()
    } catch (e) {
      console.error('Failed to create comment', e)
      toast.error('Izoh qo‘shishda xatolik')
    } finally {
      setSaving(false)
    }
  }

  const submitAttachment = async () => {
    if (!taskId) return
    if (!attachFile) {
      toast.error('Fayl tanlang')
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

      toast.success('Fayl biriktirildi')
      setAttachOpen(false)
      resetAttach()
      await refreshAttachments()
    } catch (e) {
      console.error('Failed to create attachment', e)
      toast.error('Fayl biriktirishda xatolik')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant='subtitle1'>Amallar</Typography>

          <Divider />
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              Tanlangan qism
            </Typography>

            {partId ? (
              <Stack spacing={1}>
                <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                  <Chip
                    size='small'
                    icon={<Icon icon='mdi:subdirectory-arrow-right' />}
                    label={`Qism #${partId}`}
                    variant='outlined'
                  />
                  {part?.title ? <Chip size='small' label={part.title} variant='outlined' /> : null}
                  {part?.status ? <Chip size='small' label={part.status} color='info' variant='outlined' /> : null}
                </Stack>
                <Typography variant='body2' color='text.secondary'>
                  Izoh va fayllar shu qismga qo‘shiladi.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={0.5}>
                <Typography variant='body2'>Qism tanlanmagan</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Izoh va fayllar task’ning o‘ziga qo‘shiladi.
                </Typography>
              </Stack>
            )}
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              Muddat
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Icon icon='mdi:calendar' />
              <Typography variant='body2'>{task?.end_date || 'Belgilanmagan'}</Typography>
            </Stack>
            <Button size='small' variant='outlined'>
              Muddati belgilash
            </Button>
          </Stack>
          <Divider />
          {partId && (
            <Stack spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                Qism holati
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Icon icon='mdi:subdirectory-arrow-right' />
                <Typography variant='body2'>{part?.status || 'Belgilanmagan'}</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <Button size='small' variant='contained'>
                  Boshlash
                </Button>
                <Button size='small' variant='outlined'>
                  Yakunlash
                </Button>
              </Stack>
            </Stack>
          )}
          <Divider />
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              Fayllar
            </Typography>
            <Stack direction='row' spacing={1}>
              <Button
                size='small'
                startIcon={<Icon icon='mdi:paperclip' />}
                variant='outlined'
                disabled={!taskId}
                onClick={() => setAttachOpen(true)}
              >
                Fayl qo'shish
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              Izohlar
            </Typography>
            <Button
              size='small'
              startIcon={<Icon icon='mdi:comment' />}
              variant='outlined'
              disabled={!taskId}
              onClick={() => setCommentOpen(true)}
            >
              Izoh qo'shish
            </Button>
          </Stack>
        </Stack>

        {/* Comment dialog */}
        <Dialog open={commentOpen} onClose={saving ? undefined : () => setCommentOpen(false)} fullWidth maxWidth='sm'>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='mdi:comment' />
            Izoh qo‘shish ({contentLabel})
          </DialogTitle>
          <DialogContent>
            <CustomTextField
              autoFocus
              fullWidth
              minRows={4}
              multiline
              label='Xabar'
              placeholder='Izoh… yozing'
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
              Bekor qilish
            </Button>
            <Button variant='contained' disabled={saving} onClick={submitComment}>
              Yuborish
            </Button>
          </DialogActions>
        </Dialog>

        {/* Attachment dialog */}
        <Dialog open={attachOpen} onClose={saving ? undefined : () => setAttachOpen(false)} fullWidth maxWidth='sm'>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='mdi:paperclip' />
            Fayl biriktirish ({contentLabel})
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <CustomTextField
                fullWidth
                label='Sarlavha (ixtiyoriy)'
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
                Fayl tanlash
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
              Bekor qilish
            </Button>
            <Button variant='contained' disabled={saving} onClick={submitAttachment}>
              Biriktirish
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default RightActionsPanel
