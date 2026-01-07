import { useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Card, CardContent, Grid, Stack, Tabs, Tab, Typography, Chip, Button } from '@mui/material'
import Link from 'next/link'
import Icon from 'src/@core/components/icon'

import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import DocumentTab from './components/DocumentTab'
import { TaskPartType, TaskType } from 'src/types/task'
import RightActionsPanel from './components/RightActionPanel'
import TaskHistoryTab from './components/TaskHistoryTab'
import TaskProccessTab from './components/TaskProccessTab'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import moment from 'moment'
import useThemedToast from 'src/@core/hooks/useThemedToast'

const TaskViewDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const [tab, setTab] = useState(0)
  const { user } = useAuth()
  const toast = useThemedToast()
  const [selectedPartId, setSelectedPartId] = useState<number | undefined>(undefined)
  const [sendingEmail, setSendingEmail] = useState(false)
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

  const translateStatus = (s?: string) => {
    if (!s) return '—'
    const toCamel = (str: string) =>
      str
        .split('_')
        .map((seg, i) => (i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
        .join('')

    const key = `documents.status.${toCamel(s)}`
    const translated = String(t(key))

    return translated === key ? s : translated
  }

  const translatePriority = (p?: string) => {
    if (!p) return '—'
    const normalized = p === 'orgently' ? 'orgently' : p === 'normal' ? 'ordinary' : p
    const key = `tasks.priority.${normalized}`
    const translated = String(t(key))

    return translated === key ? p : translated
  }

  const translateType = (tp?: string) => {
    if (!tp) return '—'
    const key = `tasks.type.${tp}`
    const translated = String(t(key))

    return translated === key ? tp : translated
  }

  const handleSendToEmail = async () => {
    if (!id || !task) {
      toast.error(String(t('errors.generic')) || 'Task ID not found')

      return
    }

    setSendingEmail(true)

    try {
      await DataService.post(endpoints.taskSendToEmail, { task_id: task.id })
      toast.success(String(t('tasks.view.parts.emailSent') || 'Email sent successfully'))
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || String(t('errors.generic'))
      toast.error(message)
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <Box>
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
                <Stack direction='row' spacing={1} alignItems='center'>
                  {['new'].includes(task?.status as string) &&
                    user?.role_detail?.some((role: any) => role.name !== 'Performer') && (
                      <Button
                        size='small'
                        variant='outlined'
                        component={Link}
                        href={id ? `/tasks/update/${id}` : '#'}
                        disabled={!id}
                        startIcon={<Icon icon='mdi:pencil' />}
                      >
                        {String(t('common.edit'))}
                      </Button>
                    )}
                  <Chip
                    label={String(t('tasks.view.header.status', { value: translateStatus(task?.status) }))}
                    size='small'
                  />
                  <Chip
                    label={String(t('tasks.view.header.priority', { value: translatePriority(task?.priority) }))}
                    size='small'
                  />
                  <Chip
                    label={String(t('tasks.view.header.type', { value: translateType(task?.type) }))}
                    size='small'
                  />
                  {task?.end_date && (
                    <Chip
                      label={String(
                        t('tasks.view.header.deadline', { value: moment(task.end_date).format('DD.MM.YYYY HH:mm') })
                      )}
                      size='small'
                    />
                  )}
                </Stack>
              </Stack>

              {/* Compact main document info (inline, wraps) */}
              <Box sx={{ mt: 1, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box>
                  <Typography component='span' sx={{ fontWeight: 700, mr: 1 }}>
                    {String(t('tasks.view.document.fields.inputDocNumber'))}:
                  </Typography>
                  <Typography component='span'>{task?.input_doc_number ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography component='span' sx={{ fontWeight: 700, mr: 1 }}>
                    {String(t('tasks.view.document.fields.outputDocNumber'))}:
                  </Typography>
                  <Typography component='span'>{task?.output_doc_number ?? '—'}</Typography>
                </Box>
              </Box>
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
          <Stack spacing={3}>
            <RightActionsPanel
              task={task}
              part={selectedPart}
              mutate={() => {
                mutate()
                refetchSelectedPart()
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {user?.role_detail?.some((role: any) => role.name === 'Admin' || role.name === 'Manager') &&
                task?.status === 'new' && (
                  <Button
                    variant='outlined'
                    onClick={handleSendToEmail}
                    disabled={sendingEmail || !task}
                    startIcon={<Icon icon={sendingEmail ? 'mdi:loading' : 'mdi:email-send'} />}
                  >
                    {String(t('tasks.view.parts.sendToEmail') || 'Send to email')}
                  </Button>
                )}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
export default TaskViewDetail
