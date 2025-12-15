import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Tabs,
  Tab,
  Typography,
  Chip,
  Divider,
  IconButton,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip
} from '@mui/material'
import MuiTimeline, { TimelineProps } from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineDot from '@mui/lab/TimelineDot'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Icon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'

// Simple types based on existing payloads
interface Task {
  id: number
  name: string
  status: string
  priority: string
  department?: number
  signed_by?: number
  sending_org?: number
  input_doc_number?: string
  output_doc_number?: string
  start_date?: string
  end_date?: string
  note?: string
}

interface TaskPart {
  id: number
  title: string
  department: number
  assignee: number
  status: string
  start_date: string
  end_date: string
  note: string
}

interface TaskEvent {
  id: number
  task: number
  task_detail?: any
  part?: number
  part_detail?: {
    id: number
    task: number
    title: string
    status: string
    assignee: number
    assignee_detail?: { fullname?: string }
    department: number
    department_detail?: { name?: string }
    start_date?: string
    end_date?: string
  }
  actor?: number
  actor_detail?: { fullname?: string }
  event_type: string
  message?: string
  from_status?: string | null
  to_status?: string | null
  extra?: any
  created_time?: string
  updated_time?: string
}

const RightActionsPanel = ({ task, selectedPart }: { task?: Task; selectedPart?: TaskPart | null }) => {
  return (
    <Card sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant='subtitle1'>Amallar</Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Chip label={task?.status || '—'} color='primary' variant='outlined' />
            <Chip label={task?.priority || '—'} color='secondary' variant='outlined' />
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
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              Qism holati
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Icon icon='mdi:subdirectory-arrow-right' />
              <Typography variant='body2'>{selectedPart?.status || '—'}</Typography>
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
          <Divider />
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              Fayllar
            </Typography>
            <Stack direction='row' spacing={1}>
              <Button size='small' startIcon={<Icon icon='mdi:paperclip' />} variant='outlined'>
                Fayl qo'shish
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              Izohlar
            </Typography>
            <Button size='small' startIcon={<Icon icon='mdi:comment' />} variant='outlined'>
              Izoh qo'shish
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

const TaskViewPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [tab, setTab] = useState(0)
  const [task, setTask] = useState<Task | undefined>(undefined)
  const [parts, setParts] = useState<TaskPart[]>([])
  const [events, setEvents] = useState<TaskEvent[]>([])
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null)
  const hiddenMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const Timeline = styled(MuiTimeline)<TimelineProps>(({ theme }) => ({
    '& .MuiTimelineItem-root': {
      width: '100%',
      '&:before': {
        display: 'none'
      }
    }
  }))

  const getDotColor = (type: string): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    const t = (type || '').toLowerCase()
    if (t.includes('created') || t.includes('assigned') || t.includes('started')) return 'success'
    if (t.includes('updated') || t.includes('progress')) return 'primary'
    if (t.includes('paused')) return 'warning'
    if (t.includes('failed') || t.includes('error') || t.includes('cancel')) return 'error'

    return 'info'
  }

  const getIcon = (type: string): string => {
    const t = (type || '').toLowerCase()
    if (t.includes('created')) return 'tabler:plus'
    if (t.includes('assigned')) return 'tabler:user-check'
    if (t.includes('started')) return 'tabler:player-play'
    if (t.includes('updated')) return 'tabler:pencil'
    if (t.includes('progress')) return 'tabler:loader-2'
    if (t.includes('paused')) return 'tabler:player-pause'
    if (t.includes('completed') || t.includes('finished')) return 'tabler:check'
    if (t.includes('failed') || t.includes('error')) return 'tabler:alert-triangle'
    if (t.includes('comment')) return 'tabler:message'

    return 'tabler:dot'
  }

  const selectedPart = useMemo(() => parts.find(p => p.id === selectedPartId) || null, [parts, selectedPartId])

  useEffect(() => {
    if (!id || Array.isArray(id)) return
    ;(async () => {
      try {
        const res = await DataService.get<Task>(endpoints.taskById(id))
        setTask(res.data as Task)
      } catch (e) {
        console.error('Failed to fetch task', e)
      }
    })()
  }, [id])

  useEffect(() => {
    if (!id || Array.isArray(id)) return
    ;(async () => {
      try {
        const res = await DataService.get<any>(endpoints.taskEvent, { task: id, perPage: 100 })
        setEvents((res.data?.results || []) as TaskEvent[])
      } catch (e) {
        // Optional: endpoint may not exist yet
      }
    })()
  }, [id])

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8} lg={9}>
          <Card>
            <CardContent>
              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='h6'>{task ? `Task: #${task.id} | ${task.name}` : 'Task'}</Typography>
                <Stack direction='row' spacing={1}>
                  <Chip label={`Status: ${task?.status || '—'}`} size='small' />
                  <Chip label={`Prioritet: ${task?.priority || '—'}`} size='small' />
                  {task?.end_date && <Chip label={`Muddat: ${task.end_date}`} size='small' />}
                </Stack>
              </Stack>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2 }} variant='scrollable' scrollButtons='auto'>
                <Tab label='Hujjat' />
                <Tab label='Vazifalar tarixi' />
                <Tab label='Amalga oshirish jarayoni' />
              </Tabs>
            </CardContent>
          </Card>

          {/* Tab content */}
          <Box sx={{ mt: 3 }}>
            {tab === 0 && (
              <Card>
                <CardContent>
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>
                    Qismlar (TaskPart)
                  </Typography>
                  {parts.length ? (
                    <List>
                      {parts.map(p => (
                        <ListItem
                          key={p.id}
                          selected={selectedPartId === p.id}
                          onClick={() => setSelectedPartId(p.id)}
                          button
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <Icon icon='mdi:subdirectory-arrow-right' />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${p.title} | Bo'lim: ${p.department} | Ijrochi: ${p.assignee}`}
                            secondary={`Status: ${p.status} | Muddat: ${p.end_date || '—'}`}
                          />
                          <Tooltip title='Oʻchirish'>
                            <IconButton size='small'>
                              <Icon icon='mdi:delete' />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      Qismlar mavjud emas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === 1 && (
              <Card>
                <CardContent>
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>
                    Vazifalar tarixi (TaskEvent)
                  </Typography>
                  {events.length ? (
                    <List>
                      {events.map(ev => (
                        <ListItem key={ev.id} alignItems='flex-start'>
                          <ListItemAvatar>
                            <Avatar>
                              <Icon icon='mdi:clock-outline' />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction='row' spacing={1} alignItems='center'>
                                <Chip size='small' label={ev.event_type} />
                                {ev.actor_detail?.fullname && (
                                  <Typography variant='body2'>By: {ev.actor_detail.fullname}</Typography>
                                )}
                                {ev.created_time && (
                                  <Typography variant='caption' color='text.secondary'>
                                    {new Date(ev.created_time).toLocaleString()}
                                  </Typography>
                                )}
                              </Stack>
                            }
                            secondary={
                              <Box>
                                <Typography variant='body2'>{ev.message}</Typography>
                                {ev.part_detail && (
                                  <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                                    <Chip size='small' variant='outlined' label={`Qism: ${ev.part_detail.title}`} />
                                    {ev.part_detail.department_detail?.name && (
                                      <Chip
                                        size='small'
                                        variant='outlined'
                                        label={`Bo'lim: ${ev.part_detail.department_detail.name}`}
                                      />
                                    )}
                                    {ev.part_detail.assignee_detail?.fullname && (
                                      <Chip
                                        size='small'
                                        variant='outlined'
                                        label={`Ijrochi: ${ev.part_detail.assignee_detail.fullname}`}
                                      />
                                    )}
                                  </Stack>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      Tarix hozircha yoʻq
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === 2 && (
              <Card>
                <CardContent>
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>
                    Amalga oshirish jarayoni
                  </Typography>
                  {events.length ? (
                    <Timeline position='right'>
                      {events.map(ev => (
                        <TimelineItem key={ev.id}>
                          <TimelineSeparator>
                            <TimelineDot color={getDotColor(ev.event_type)} />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent sx={{ '& svg': { verticalAlign: 'bottom', mx: 4 } }}>
                            <Box
                              sx={{
                                mb: 1.5,
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography variant='subtitle1' sx={{ mr: 2 }}>
                                {ev.actor_detail?.fullname || '—'} — {ev.message || ev.event_type}
                              </Typography>
                              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                                {ev.created_time ? new Date(ev.created_time).toLocaleString() : ''}
                              </Typography>
                            </Box>
                            <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
                              {ev.part_detail?.title && <Chip size='small' label={`Qism: ${ev.part_detail.title}`} />}
                              {ev.part_detail?.department_detail?.name && (
                                <Chip size='small' label={`Bo'lim: ${ev.part_detail.department_detail.name}`} />
                              )}
                              {ev.part_detail?.assignee_detail?.fullname && (
                                <Chip size='small' label={`Ijrochi: ${ev.part_detail.assignee_detail.fullname}`} />
                              )}
                            </Stack>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      Hech qanday jarayon elementi yoʻq
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>

        {/* Right actions panel */}
        <Grid item xs={12} md={4} lg={3}>
          <RightActionsPanel task={task} selectedPart={selectedPart} />
        </Grid>
      </Grid>
    </Box>
  )
}
export default TaskViewPage
