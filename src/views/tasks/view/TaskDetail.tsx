import { useEffect, useState } from 'react'
import { Tabs, Tab, Box, Grid, Chip, Stack, Typography, Divider } from '@mui/material'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import TaskPartPanel from './TaskPartPanel'

type Props = {
  id: string
}

type Task = {
  id: number
  name: string
  status: string
  type: string
  priority: string
  start_date: string
  end_date: string
  sending_org: string
  input_doc_number: string
  output_doc_number: string
}

type EventItem = { id: number; created_at?: string; event_type: string; message: string }

type CommentItem = { id: number; text: string; is_system: boolean }

type AttachmentItem = { id: number; title: string; file: string }

const TaskDetail = ({ id }: Props) => {
  const [tab, setTab] = useState(0)
  const [task, setTask] = useState<Task | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [comments, setComments] = useState<CommentItem[]>([])
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      const [t, e, c, a] = await Promise.all([
        DataService.get<Task>(endpoints.taskById(id)),
        DataService.get<any>(endpoints.taskEvent, { task: id, perPage: 50 }),
        DataService.get<any>(endpoints.taskComment, { task: id, perPage: 50 }),
        DataService.get<any>(endpoints.taskAttachment, { task: id, perPage: 50 })
      ])
      setTask(t.data as any)
      setEvents((e.data?.results || []) as EventItem[])
      setComments((c.data?.results || []) as CommentItem[])
      setAttachments((a.data?.results || []) as AttachmentItem[])
    }
    if (id) fetchAll()
  }, [id])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4} lg={3}>
        <TaskPartPanel taskId={id} />
      </Grid>
      <Grid item xs={12} md={8} lg={9}>
        <Box sx={{ mb: 3 }}>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Typography variant='h6'>{task?.name || `Task #${id}`}</Typography>
            {task?.status && <Chip label={task.status} color='primary' size='small' />}
            {task?.priority && <Chip label={task.priority} color='warning' size='small' />}
            {task?.type && <Chip label={task.type} color='info' size='small' />}
          </Stack>
          <Typography variant='body2' sx={{ mt: 1 }}>
            {task?.sending_org && `Yuboruvchi: ${task.sending_org}`}
          </Typography>
          <Typography variant='body2'>
            {task?.input_doc_number && `Kirish raqami: ${task.input_doc_number}`}
            {task?.output_doc_number && ` | Chiqish raqami: ${task.output_doc_number}`}
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4 }}>
          <Tab label='Hujjat' />
          <Tab label='Vazifalar tarixi' />
          <Tab label='Amalga oshirish jarayoni' />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              Izohlar (Chip/Tag)
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mb: 4 }}>
              {comments.map(c => (
                <Chip key={c.id} label={c.text} color={c.is_system ? 'default' : 'secondary'} variant='outlined' />
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              Fayllar (Attachments)
            </Typography>
            <Stack direction='column' spacing={1}>
              {attachments.map(a => (
                <Stack key={a.id} direction='row' spacing={2} alignItems='center'>
                  <Typography variant='body2'>{a.title}</Typography>
                  <a href={a.file} download>
                    download
                  </a>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              Vazifalar tarixi (TaskEvent list)
            </Typography>
            <Stack spacing={2}>
              {events.map(e => (
                <Box
                  key={e.id}
                  sx={{
                    p: 2,
                    border: theme => `1px solid rgba(${theme.palette.customColors.main}, 0.2)`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant='caption'>{e.created_at}</Typography>
                  <Typography variant='body2'>
                    [{e.event_type}] {e.message}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              Amalga oshirish jarayoni (Timeline)
            </Typography>
            <Stack spacing={2}>
              {events.map(e => (
                <Stack key={e.id} direction='row' spacing={2} alignItems='center'>
                  <Chip label={e.event_type} size='small' />
                  <Typography variant='body2'>{e.message}</Typography>
                  <Typography variant='caption'>{e.created_at}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Grid>
    </Grid>
  )
}

export default TaskDetail
