import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import Avatar from '@mui/material/Avatar'
import { useQuery } from '@tanstack/react-query'
import Icon from 'src/@core/components/icon'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { UserDetailType } from 'src/types/task'

type TaskAttachmentType = {
  id: number
  task: number | null
  part: number | null
  title: string
  file: string
  uploaded_by?: number | null
  uploaded_by_detail?: UserDetailType | null
  created_by?: number | null
  created_by_detail?: UserDetailType | null
  updated_by?: number | null
  created_time?: string
  updated_time?: string
  created_at?: string
  updated_at?: string
}

const getFileLabel = (a: TaskAttachmentType) => {
  const name = (a.title || '').trim()
  if (name) return name
  const file = (a.file || '').trim()
  if (!file) return `Fayl #${a.id}`
  try {
    const base = file.split('?')[0]
    const parts = base.split('/')

    return decodeURIComponent(parts[parts.length - 1] || base)
  } catch {
    return file
  }
}

const getExt = (fileOrTitle: string) => {
  const v = (fileOrTitle || '').toLowerCase().split('?')[0]
  const last = v.split('.').pop()

  return last && last !== v ? last : ''
}

const getFileIcon = (ext: string) => {
  switch (ext) {
    case 'pdf':
      return 'tabler:file-type-pdf'
    case 'doc':
    case 'docx':
      return 'tabler:file-type-doc'
    case 'xls':
    case 'xlsx':
      return 'tabler:file-type-xls'
    case 'ppt':
    case 'pptx':
      return 'tabler:file-type-ppt'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'gif':
      return 'tabler:photo'
    case 'zip':
    case 'rar':
    case '7z':
      return 'tabler:archive'
    default:
      return 'tabler:file'
  }
}

export default function TaskAttachment({
  taskId,
  partId,
  isCompact
}: {
  taskId: string | number | null
  partId?: string | number | null
  isCompact?: boolean
}) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery<{ results: TaskAttachmentType[] }>({
    queryKey: ['task-attachments', taskId, partId === undefined ? 'all' : partId],
    queryFn: async () => {
      const params: any = {
        task: taskId,
        perPage: 50
      }
      if (partId !== undefined) {
        params.part = partId === null ? '' : partId
      }
      const res = await DataService.get<{ results: TaskAttachmentType[] }>(endpoints.taskAttachment, params)

      return res.data || { results: [] }
    },
    enabled: !!taskId || !!partId,
    staleTime: 10_000
  })

  const attachments = (data?.results || []) as TaskAttachmentType[]

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant='text' width='30%' />
        <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
      </Stack>
    )
  }

  if (isError) {
    return (
      <Typography variant='body2' color='error'>
        {String(t('tasks.view.attachments.loadError'))}
      </Typography>
    )
  }

  if (!attachments.length) {
    if (isCompact) return null

    return (
      <Card>
        <CardContent>
          <Box sx={{ py: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              {String(t('tasks.view.attachments.empty'))}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (isCompact) {
    return (
      <Card variant='outlined' sx={{ mb: 2 }}>
        <CardContent sx={{ py: '0.75rem !important' }}>
          <Stack direction='row' spacing={3} alignItems='center' flexWrap='wrap' useFlexGap>
            <Typography variant='subtitle2' sx={{ mr: 2 }}>
              {String(t('tasks.view.attachments.title'))}:
            </Typography>
            {attachments.map(a => {
              const label = getFileLabel(a)
              const ext = getExt(a.file || a.title)
              const icon = getFileIcon(ext)
              const href = a.file || '#'

              return (
                <Chip
                  key={a.id}
                  icon={<Icon icon={icon} />}
                  label={label}
                  component='a'
                  href={href}
                  target='_blank'
                  clickable
                  size='small'
                  variant='outlined'
                  color='primary'
                />
              )
            })}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant='subtitle2'>{String(t('tasks.view.attachments.title'))}</Typography>
          <Chip
            size='small'
            color='info'
            label={String(t('tasks.view.attachments.count', { count: attachments.length }))}
          />
        </Box>

        <List disablePadding>
          {attachments.map((a, idx) => {
            const label = getFileLabel(a)
            const ext = getExt(a.file || a.title)
            const icon = getFileIcon(ext)
            const createdIso = a.created_time || a.created_at || a.updated_time || a.updated_at
            const created = createdIso ? moment(createdIso).format('DD.MM.YYYY HH:mm') : ''
            const uploaderName =
              a.uploaded_by_detail?.fullname ||
              a.created_by_detail?.fullname ||
              (typeof a.uploaded_by === 'number'
                ? `#${a.uploaded_by}`
                : typeof a.created_by === 'number'
                ? `#${a.created_by}`
                : '')
            const href = a.file || '#'

            return (
              <React.Fragment key={a.id ?? idx}>
                <ListItem
                  disableGutters
                  secondaryAction={
                    href && href !== '#' ? (
                      <Tooltip title={String(t('tasks.view.attachments.openOrDownload'))}>
                        <IconButton component='a' href={href} target='_blank' rel='noreferrer'>
                          <Icon icon='tabler:download' />
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
                      variant='rounded'
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme => theme.palette.action.selected,
                        color: 'text.primary'
                      }}
                    >
                      <Icon icon={icon} />
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction='row' spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                        {href && href !== '#' ? (
                          <Link href={href} target='_blank' rel='noreferrer' underline='hover' color='inherit'>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                              {label}
                            </Typography>
                          </Link>
                        ) : (
                          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                            {label}
                          </Typography>
                        )}

                        {ext ? <Chip size='small' variant='outlined' label={ext.toUpperCase()} /> : null}
                        {a.part ? (
                          <Chip
                            size='small'
                            variant='outlined'
                            label={String(t('tasks.view.attachments.partLabel', { id: a.part }))}
                          />
                        ) : null}
                      </Stack>
                    }
                    secondary={
                      <Stack direction='row' spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
                        {created ? (
                          <Typography variant='caption' color='text.secondary'>
                            {created}
                          </Typography>
                        ) : null}
                        {uploaderName ? (
                          <Typography variant='caption' color='text.secondary'>
                            {String(t('tasks.view.attachments.uploader', { name: uploaderName }))}
                          </Typography>
                        ) : null}
                      </Stack>
                    }
                  />
                </ListItem>
                {idx < attachments.length - 1 ? <Divider sx={{ my: 1 }} /> : null}
              </React.Fragment>
            )
          })}
        </List>
      </CardContent>
    </Card>
  )
}
