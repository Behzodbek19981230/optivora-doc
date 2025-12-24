// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

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

  const { skin, direction } = settings
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  const [tasks, setTasks] = useState<TaskPartType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fetchTasks = async (selectedDate: string) => {
    setIsLoading(true)
    try {
      const response = (await DataService.get(endpoints.taskPart, {
        start_date: selectedDate,
        page: 1,
        perPage: 1000
      })) as { data?: { results?: TaskPartType[] } }
      setTasks((response?.data?.results as TaskPartType[]) || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
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
        />
        <Box sx={{ mt: 2 }}>
          <TaskTable data={tasks} loading={isLoading} total={tasks.length} />
        </Box>
      </Box>
    </CalendarWrapper>
  )
}

export default CalendarActions
