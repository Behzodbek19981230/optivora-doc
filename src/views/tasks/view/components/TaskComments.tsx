import React from 'react'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Icon from 'src/@core/components/icon'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { UserDetailType, TaskPartType } from 'src/types/task'
import { useTranslation } from 'react-i18next'
import DeleteModal from 'src/@core/components/modals/DeleteModal'
import { useAuth } from 'src/hooks/useAuth'

type TaskCommentType = {
  id: number
  task: number
  part: number | null
  author: number
  author_detail?: UserDetailType
  text: string
  is_system: boolean
  created_by: number
  updated_by: number
  created_at?: string
}

const getInitials = (value: string) => {
  const v = (value || '').trim()
  if (!v) return '?'
  const parts = v.split(' ').filter(Boolean)
  const a = parts[0]?.[0] || ''
  const b = parts[1]?.[0] || ''

  return (a + b).toUpperCase() || v[0].toUpperCase()
}

export default function TaskComments({ taskId, partId }: { taskId: string | number | null; partId?: string | number }) {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const { data: partData } = useQuery<TaskPartType>({
    queryKey: ['task-part', partId],
    queryFn: async () => {
      const res = await DataService.get<TaskPartType>(endpoints.taskPartById(partId))

      return res.data
    },
    enabled: !!partId
  })

  const partStatus = partData?.status
  const { user } = useAuth()

  const { data, isLoading, isError } = useQuery<{ results: TaskCommentType[] }>({
    queryKey: ['task-comments', taskId, partId ?? null],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {
        task: taskId ?? '',
        limit: 50
      }
      if (partId != null) params.part = partId
      const res = await DataService.get<{ results: TaskCommentType[] }>(endpoints.taskComment, params)

      return res.data || { results: [] }
    },
    enabled: !!taskId || !!partId,
    staleTime: 10_000
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => DataService.delete(endpoints.taskCommentById(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-comments', taskId, partId ?? null] })
    }
  })

  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [deleteTitle, setDeleteTitle] = React.useState<string>('')

  const comments = (data?.results || []) as TaskCommentType[]

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant='text' width='25%' />
        <Skeleton variant='rectangular' height={72} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={72} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={72} sx={{ borderRadius: 2 }} />
      </Stack>
    )
  }

  if (isError) {
    return (
      <Typography variant='body2' color='error'>
        {String(t('tasks.view.comments.loadError'))}
      </Typography>
    )
  }

  if (!comments.length) {
    return (
      <Card>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            {String(t('tasks.view.comments.empty'))}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant='subtitle2'>{String(t('tasks.view.comments.title'))}</Typography>
          <Chip size='small' color='info' label={String(t('tasks.view.comments.count', { count: comments.length }))} />
        </Box>

        <List disablePadding>
          {comments.map((c, idx) => {
            const created = c.created_at ? new Date(c.created_at).toLocaleString() : ''
            const authorLabel = c.is_system ? String(t('tasks.view.comments.system')) : `${c.author_detail?.fullname}`

            return (
              <React.Fragment key={c.id ?? idx}>
                <ListItem
                  disableGutters
                  alignItems='flex-start'
                  secondaryAction={
                    partStatus === 'returned' && user?.id === c.author ? (
                      <Tooltip title={String(t('tasks.view.comments.delete'))}>
                        <IconButton
                          onClick={() => {
                            setDeleteId(c.id)
                            setDeleteTitle((c.text || '—').slice(0, 120))
                            setDeleteOpen(true)
                          }}
                          disabled={deleteMutation.isPending}
                          color='error'
                        >
                          <Icon icon='tabler:trash' />
                        </IconButton>
                      </Tooltip>
                    ) : null
                  }
                  sx={{
                    py: 1.25,
                    px: 1,
                    borderRadius: 2,
                    '&:hover': { backgroundColor: theme => theme.palette.action.hover }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme => (c.is_system ? theme.palette.grey[200] : theme.palette.primary.light),
                        color: theme => (c.is_system ? theme.palette.text.primary : theme.palette.primary.contrastText)
                      }}
                    >
                      {c.is_system ? <Icon icon='tabler:settings' /> : getInitials(authorLabel)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction='row' spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          {authorLabel}
                        </Typography>
                        {c.is_system ? (
                          <Chip
                            size='small'
                            color='default'
                            variant='outlined'
                            label={String(t('tasks.view.comments.system'))}
                          />
                        ) : null}
                        {c.part ? (
                          <Chip
                            size='small'
                            variant='outlined'
                            label={String(t('tasks.view.comments.partLabel', { id: c.part }))}
                          />
                        ) : null}
                        {created ? (
                          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                            • {created}
                          </Typography>
                        ) : null}
                      </Stack>
                    }
                    secondary={
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {c.text || '—'}
                      </Typography>
                    }
                  />
                </ListItem>
                {idx < comments.length - 1 ? <Divider sx={{ my: 1 }} /> : null}
              </React.Fragment>
            )
          })}
        </List>

        <DeleteModal
          open={deleteOpen}
          handleClose={() => {
            if (deleteMutation.isPending) return
            setDeleteOpen(false)
            setDeleteId(null)
            setDeleteTitle('')
          }}
          handleDelete={() => {
            if (!deleteId) return
            deleteMutation.mutate(deleteId, {
              onSuccess: () => {
                setDeleteOpen(false)
                setDeleteId(null)
                setDeleteTitle('')
              }
            })
          }}
          title={deleteTitle || '—'}
        />
      </CardContent>
    </Card>
  )
}
