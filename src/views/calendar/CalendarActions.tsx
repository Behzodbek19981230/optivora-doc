// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled } from '@mui/material/styles'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import { TabContext } from '@mui/lab'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { ROLES } from 'src/configs/consts'

// ** Types
import { CalendarColors } from 'src/types/apps/calendarTypes'

import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'

// ** Actions
import { updateEvent, handleSelectEvent } from 'src/store/apps/calendar'
import Calendar from './components/CustomCalendar'
import { CalendarDataType } from 'src/types/calendar'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { TaskPartType } from 'src/types/task'
import TaskTable from './components/TaskTable'

// ** CalendarColors
const calendarsColor: CalendarColors = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info'
}

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  borderBottom: '0 !important',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))

const store: CalendarDataType = {
  events: [],
  selectedEvent: null,
  selectedCalendars: []
}

const CalendarActions = () => {
  // ** States
  const [calendarApi, setCalendarApi] = useState<null | any>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)

  // ** Hooks
  const { settings } = useSettings()
  const { user } = useAuth()
  const { t } = useTranslation()

  const { skin, direction } = settings
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const isAdminOrManager =
    !!user?.role_detail?.map(r => r.id.toString()).includes(ROLES.ADMIN) ||
    !!user?.role_detail?.map(r => r.id.toString()).includes(ROLES.MANAGER)

  const [ownerFilter, setOwnerFilter] = useState<'mine' | 'all'>(isAdminOrManager ? 'all' : 'mine')

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  const [tasks, setTasks] = useState<TaskPartType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fetchTasks = async (selectedDate: string) => {
    setIsLoading(true)
    try {
      const params: any = {
        date: selectedDate,
        page: 1,
        limit: 1000
      }

      if (ownerFilter === 'mine' && user?.id) {
        params.user_id = user.id
      }

      const response = await DataService.get(ownerFilter === 'mine' ? endpoints.taskMixSelf : endpoints.taskMix, params)

      // Response can be either { data: [...] } or directly [...]
      let tasks: TaskPartType[] = []
      if (Array.isArray(response)) {
        tasks = response as TaskPartType[]
      } else if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as { data?: TaskPartType[] }).data
        tasks = Array.isArray(data) ? data : []
      }

      setTasks(tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectDate = (selectedDate: string) => {
    fetchTasks(selectedDate)
  }

  return (
    <CalendarWrapper
      className='app-calendar'
      sx={{
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: theme => `1px solid ${theme.palette.divider}` })
      }}
    >
      <Card sx={{ width: '100%' }}>
        <CardHeader title={String(t('calendar.title') || 'Calendar')} />
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 6, pt: 2, pb: 2 }}>
            <TabContext value={ownerFilter}>
              <TabList value={ownerFilter} onChange={(_: any, v: any) => setOwnerFilter(v)}>
                <Tab value='mine' label={String(t('documents.myDocuments') || 'Mening hujjatlarim')} />
                {isAdminOrManager && <Tab value='all' label={String(t('documents.allDocuments') || 'Barchasi')} />}
              </TabList>
            </TabContext>
          </Box>

          <Box
            sx={{
              p: 6,
              pb: 0,
              flexGrow: 1,
              borderRadius: 1,
              boxShadow: 'none',
              backgroundColor: 'background.paper',
              ...(mdAbove ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {})
            }}
          >
            <Calendar
              store={store}
              direction={direction}
              updateEvent={updateEvent}
              calendarApi={calendarApi}
              calendarsColor={calendarsColor}
              setCalendarApi={setCalendarApi}
              handleSelectEvent={handleSelectEvent}
              handleLeftSidebarToggle={handleLeftSidebarToggle}
              handleAddEventSidebarToggle={handleAddEventSidebarToggle}
              handleSelectDate={handleSelectDate}
              ownerFilter={ownerFilter}
            />
            <Box sx={{ mt: 2 }}>
              <TaskTable data={tasks} loading={isLoading} total={tasks.length} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </CalendarWrapper>
  )
}

export default CalendarActions
