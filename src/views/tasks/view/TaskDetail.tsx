import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Card, CardContent, Grid, Stack, Tabs, Tab, Typography, Chip } from '@mui/material'

import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import DocumentTab from './components/DocumentTab'
import { TaskPartType, TaskType } from 'src/types/task'
import RightActionsPanel from './components/RightActionPanel'
import TaskHistoryTab from './components/TaskHistoryTab'
import TaskProccessTab from './components/TaskProccessTab'
import { useQuery } from '@tanstack/react-query'

const TaskViewDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const [tab, setTab] = useState(0)
  const [task, setTask] = useState<TaskType>()
  const [selectedPartId, setSelectedPartId] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!id || Array.isArray(id)) return
    ;(async () => {
      try {
        const res = await DataService.get<TaskType>(endpoints.taskById(id))
        setTask(res.data as TaskType)
      } catch (e) {
        console.error('Failed to fetch task', e)
      }
    })()
  }, [id])

  const { data: selectedPart } = useQuery<TaskPartType>({
    queryKey: ['task-part', selectedPartId],
    enabled: !!selectedPartId,
    queryFn: async (): Promise<TaskPartType> => {
      const res = await DataService.get<TaskPartType>(endpoints.taskPartById(selectedPartId as number))
      return res.data as TaskPartType
    }
  })

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
              <DocumentTab
                task={task}
                selectedPartId={selectedPartId ?? undefined}
                setSelectedPartId={setSelectedPartId}
              />
            )}

            {tab === 1 && <TaskHistoryTab id={id as string} />}

            {tab === 2 && <TaskProccessTab id={id as string} />}
          </Box>
        </Grid>

        {/* Right actions panel */}
        <Grid item xs={12} md={4} lg={3}>
          <RightActionsPanel task={task} part={selectedPart} />
        </Grid>
      </Grid>
    </Box>
  )
}
export default TaskViewDetail
