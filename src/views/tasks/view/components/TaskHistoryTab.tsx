import { Box, Chip, Skeleton, Stack, styled, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import MuiTimeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineConnector from '@mui/lab/TimelineConnector'
import { Card, CardContent } from '@mui/material'
import { TaskEventType } from 'src/types/task'
import { useTranslation } from 'react-i18next'
const Timeline = styled(MuiTimeline)({
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})
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

export default function TaskHistoryTab({ id }: { id: string }) {
  const { t } = useTranslation()
  const { data: events = [], isLoading } = useQuery<TaskEventType[]>({
    queryKey: ['task-events', id],
    queryFn: async (): Promise<TaskEventType[]> => {
      const res = await DataService.get<{ results: TaskEventType[] }>(endpoints.taskEvent, { task: id, perPage: 50 })
      return (res.data?.results as TaskEventType[]) || []
    },
    staleTime: 10_000
  })

  return (
    <Card>
      <CardContent>
        <Typography variant='subtitle2' sx={{ mb: 2 }}>
          {String(t('tasks.view.history.title'))}
        </Typography>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant='text' width='40%' />
            <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
            <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
            <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : events.length ? (
          <Timeline>
            {events.map(ev => (
              <TimelineItem key={ev.id}>
                <TimelineSeparator>
                  <TimelineDot color={getDotColor(ev.event_type)} variant='outlined' />
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
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            {String(t('tasks.view.history.empty'))}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
