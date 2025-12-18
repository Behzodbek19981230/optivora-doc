import { useState } from 'react'
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
import { useTranslation } from 'react-i18next'

const TaskViewDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const [tab, setTab] = useState(0)
  const [selectedPartId, setSelectedPartId] = useState<number | undefined>(undefined)
  const { data: task, refetch: mutate } = useQuery<TaskType>({
    queryKey: ['task', id],
    enabled: !!id,
    queryFn: async (): Promise<TaskType> => {
      const res = await DataService.get<TaskType>(endpoints.taskById(id as string))

      return res.data as TaskType
    }
  })

  const { data: selectedPart, refetch: refetchSelectedPart } = useQuery<TaskPartType>({
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
                <Typography variant='h6'>
                  {task
                    ? String(t('tasks.view.header.titleWithId', { id: task.id, name: task.name }))
                    : String(t('tasks.view.header.title'))}
                </Typography>
                <Stack direction='row' spacing={1}>
                  <Chip label={String(t('tasks.view.header.status', { value: task?.status || '—' }))} size='small' />
                  <Chip
                    label={String(t('tasks.view.header.priority', { value: task?.priority || '—' }))}
                    size='small'
                  />
                  {task?.end_date && (
                    <Chip label={String(t('tasks.view.header.deadline', { value: task.end_date }))} size='small' />
                  )}
                </Stack>
              </Stack>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2 }} variant='scrollable' scrollButtons='auto'>
                <Tab label={String(t('tasks.view.tabs.document'))} />
                <Tab label={String(t('tasks.view.tabs.history'))} />
                <Tab label={String(t('tasks.view.tabs.process'))} />
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
          <RightActionsPanel
            task={task}
            part={selectedPart}
            mutate={() => {
              mutate()
              refetchSelectedPart()
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
export default TaskViewDetail
