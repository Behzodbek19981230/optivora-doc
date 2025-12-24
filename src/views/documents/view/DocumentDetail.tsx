import { useEffect, useState } from 'react'
import { useRouter } from 'src/spa/router/useRouter'
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Divider,
  Stack,
  Tabs,
  Tab
} from '@mui/material'
import MuiTimeline, { TimelineProps } from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Icon from 'src/@core/components/icon'
import CustomTimelineDot from 'src/@core/components/mui/timeline-dot'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'

type Executor = {
  id: number
  name: string
  avatar?: string
  seen_at: string | null
}

type Chrono = {
  id: number
  time: string
  actor: string
  action: string
  note?: string
}

type DocDetail = {
  id: number
  number: string
  title: string
  company: string
  created_time: string
  status: string
  executors: Executor[]
  chronology: Chrono[]
}

const DocumentDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const [doc, setDoc] = useState<DocDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const hiddenMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const [tab, setTab] = useState<'info' | 'chronology'>('info')

  const Timeline = styled(MuiTimeline)<TimelineProps>(({ theme }) => ({
    '& .MuiTimelineItem-root:nth-of-type(even) .MuiTimelineContent-root': {
      textAlign: 'left'
    },
    [theme.breakpoints.down('md')]: {
      '& .MuiTimelineItem-root': {
        width: '100%',
        '&:before': { display: 'none' }
      }
    }
  }))

  const getDotColor = (action: string): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    const a = action.toLowerCase()
    if (a.includes('created') || a.includes('accepted')) return 'success'
    if (a.includes('updated') || a.includes('in progress')) return 'primary'
    if (a.includes('comment')) return 'info'
    if (a.includes('cancel') || a.includes('error')) return 'error'
    if (a.includes('return')) return 'warning'
    return 'primary'
  }

  const getIcon = (action: string): string => {
    const a = action.toLowerCase()
    if (a.includes('created')) return 'tabler:plus'
    if (a.includes('updated')) return 'tabler:pencil'
    if (a.includes('accepted')) return 'tabler:check'
    if (a.includes('comment')) return 'tabler:message'
    if (a.includes('cancel')) return 'tabler:x'
    if (a.includes('return')) return 'tabler:arrow-back-up'
    if (a.includes('progress')) return 'tabler:loader-2'
    return 'tabler:dot'
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    DataService.get<DocDetail>(endpoints.documentById(id)).then(res => {
      setDoc(res.data as any)
      setLoading(false)
    })
  }, [id])

  if (loading || !doc) {
    return (
      <Card>
        <CardHeader title='Document' />
        <CardContent>
          <Typography>Loading…</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={`Document ${doc.number}`} subheader={doc.title} />
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4 }}>
              <Tab value='info' label='Info' />
              <Tab value='chronology' label='Chronology' />
            </Tabs>
            {tab === 'info' ? (
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Chip label={`Company: ${doc.company}`} />
                <Chip label={`Created: ${doc.created_time}`} />
                <Chip label={`Status: ${doc.status}`} color='primary' variant='outlined' />
              </Stack>
            ) : null}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title={tab === 'chronology' ? 'Chronology' : 'Details'} />
          <CardContent>
            {tab === 'chronology' ? (
              doc.chronology.length === 0 ? (
                <Typography color='text.secondary'>No chronology yet.</Typography>
              ) : (
                <Timeline position={hiddenMD ? 'right' : 'alternate'}>
                  {doc.chronology.map(item => (
                    <TimelineItem key={item.id}>
                      <TimelineSeparator>
                        <CustomTimelineDot skin='light' color={getDotColor(item.action)}>
                          <Icon icon={getIcon(item.action)} fontSize={20} />
                        </CustomTimelineDot>
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
                            {item.actor} — {item.action}
                          </Typography>
                          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                            {new Date(item.time).toLocaleString()}
                          </Typography>
                        </Box>
                        {item.note ? (
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            {item.note}
                          </Typography>
                        ) : null}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )
            ) : (
              <Box>
                <Typography variant='body2' sx={{ mb: 2 }}>
                  Number: {doc.number}
                </Typography>
                <Typography variant='body2' sx={{ mb: 2 }}>
                  Title: {doc.title}
                </Typography>
                <Typography variant='body2' sx={{ mb: 2 }}>
                  Company: {doc.company}
                </Typography>
                <Typography variant='body2' sx={{ mb: 2 }}>
                  Created: {doc.created_time}
                </Typography>
                <Typography variant='body2'>Status: {doc.status}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title='Executors & Views' />
          <CardContent>
            <List>
              {doc.executors.map(ex => (
                <ListItem
                  key={ex.id}
                  disableGutters
                  secondaryAction={
                    ex.seen_at ? (
                      <Chip size='small' color='success' label={new Date(ex.seen_at).toLocaleString()} />
                    ) : (
                      <Chip size='small' color='warning' label='Not seen' />
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={ex.avatar}>{ex.name?.[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={ex.name} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DocumentDetail
