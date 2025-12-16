// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline, { TimelineProps } from '@mui/lab/Timeline'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import CustomTimelineDot from 'src/@core/components/mui/timeline-dot'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { DataService } from 'src/configs/dataService'
import { useQuery } from '@tanstack/react-query'
import { TaskEventType } from 'src/types/task'
import endpoints from 'src/configs/endpoints'
import { Card, CardContent } from '@mui/material'

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>(({ theme }) => ({
  '& .MuiTimelineItem-root:nth-of-type(even) .MuiTimelineContent-root': {
    textAlign: 'left'
  },
  [theme.breakpoints.down('md')]: {
    '& .MuiTimelineItem-root': {
      width: '100%',
      '&:before': {
        display: 'none'
      }
    }
  }
}))

const getDotColor = (eventType: string) => {
  switch (eventType) {
    case 'assigned':
      return 'info'
    case 'part_created':
      return 'primary'
    case 'task_created':
      return 'primary'
    case 'commented':
      return 'warning'
    case 'file_added':
      return 'warning'
    case 'status_changed':
      return 'info'
    case 'part_completed':
    case 'task_completed':
      return 'success'
    case 'part_returned':
    case 'task_returned':
      return 'warning'
    case 'part_cancelled':
    case 'task_cancelled':
      return 'error'
    default:
      return 'grey'
  }
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'assigned':
      return 'tabler:user-check'

    case 'part_created':
      return 'tabler:subtask'

    case 'file_added':
      return 'tabler:paperclip'
    case 'commented':
      return 'tabler:message-circle'

    case 'task_created':
      return 'tabler:file-plus'
    case 'status_changed':
      return 'tabler:refresh'
    case 'part_completed':
    case 'task_completed':
      return 'tabler:circle-check'
    case 'part_returned':
    case 'task_returned':
      return 'tabler:arrow-back-up'
    case 'part_cancelled':
    case 'task_cancelled':
      return 'tabler:circle-x'
    default:
      return 'tabler:info-circle'
  }
}

const TaskProccessTab = ({ id }: { id: string }) => {
  const { data: events = [], isLoading } = useQuery<TaskEventType[]>({
    queryKey: ['task-events', id],
    queryFn: async (): Promise<TaskEventType[]> => {
      const res = await DataService.get<{ results: TaskEventType[] }>(endpoints.taskEvent, { task: id, perPage: 50 })
      return (res.data?.results as TaskEventType[]) || []
    },
    staleTime: 10_000
  })
  const { settings } = useSettings()
  const hiddenMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const { direction } = settings

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant='text' width='40%' />
        <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
      </Stack>
    )
  }

  return (
    <Card>
      <CardContent>
        <Timeline position={hiddenMD ? 'right' : 'alternate'}>
          {events.length ? (
            events.map((ev, idx) => {
              const icon = getEventIcon(ev.event_type)
              const color = getDotColor(ev.event_type)
              const actor = ev.actor_detail?.fullname || '—'
              const title = ev.message || ev.event_type
              const created = ev.created_time ? new Date(ev.created_time).toLocaleString() : ''

              return (
                <TimelineItem key={ev.id ?? idx}>
                  <TimelineSeparator>
                    <CustomTimelineDot skin='light' color={color}>
                      <Icon icon={icon} fontSize={20} />
                    </CustomTimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent sx={{ '& svg': { verticalAlign: 'bottom', mx: 1 } }}>
                    <Box
                      sx={{
                        mb: 1,
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Typography variant='subtitle1' sx={{ mr: 2 }}>
                        {actor} — {title}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        {created}
                      </Typography>
                    </Box>

                    <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                      {ev.part_detail?.title ? <Chip size='small' label={`Qism: ${ev.part_detail.title}`} /> : null}
                      {ev.part_detail?.department_detail?.name ? (
                        <Chip size='small' label={`Bo'lim: ${ev.part_detail.department_detail.name}`} />
                      ) : null}
                      {ev.part_detail?.assignee_detail?.fullname ? (
                        <Chip size='small' label={`Ijrochi: ${ev.part_detail.assignee_detail.fullname}`} />
                      ) : null}
                      {direction ? null : null}
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
              )
            })
          ) : (
            <Box sx={{ py: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Hech qanday jarayon elementi yoʻq
              </Typography>
            </Box>
          )}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default TaskProccessTab
