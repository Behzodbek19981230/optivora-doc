// ** React Import
import { useEffect, useMemo, useRef, useState } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'

// ** MUI
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css'
import { CalendarType } from 'src/types/calendar'
import { useTranslation } from 'react-i18next'

const getYearOptions = (centerYear: number, span = 10) => {
  const years: number[] = []
  for (let y = centerYear - span; y <= centerYear + span; y++) years.push(y)

  return years
}

// FullCalendar locales can be incomplete for some languages.
// We rely on `Intl` via a BCP-47 locale string for month/day names.

const uzWeekdaysLong = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
const uzWeekdaysShort = ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha']
const uzMonthsLong = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr'
]
const uzMonthsShort = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

const Calendar = (props: CalendarType) => {
  const { i18n, t } = useTranslation()

  // ** Props
  const {
    store,

    direction,
    updateEvent,
    calendarApi,
    calendarsColor,
    setCalendarApi,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle
  } = props

  // ** Refs
  const calendarRef = useRef<FullCalendar | null>(null)

  const [year, setYear] = useState<number>(() => new Date().getFullYear())

  useEffect(() => {
    if (!calendarApi) return
    try {
      const d = calendarApi.getDate?.()
      if (d instanceof Date && !Number.isNaN(d.getTime())) setYear(d.getFullYear())
    } catch {
      // ignore
    }
  }, [calendarApi])

  const intlLocale = useMemo(() => {
    const lng = (i18n.language || 'ru').toLowerCase()
    if (lng.startsWith('ru')) return 'ru-RU'
    if (lng.startsWith('uz')) return 'uz-UZ'

    return 'en-GB'
  }, [i18n.language])

  // FullCalendar custom locale that guarantees Uzbek month/week day names.
  // FullCalendar expects Moment-like arrays for `monthNames`/`dayNames` when using built-in date parsing.
  const fullCalendarLocale = useMemo(() => {
    const lng = (i18n.language || 'ru').toLowerCase()

    if (lng.startsWith('uz')) {
      return {
        code: 'uz',
        week: { dow: 1, doy: 4 },
        buttonText: {
          prev: 'Oldingi',
          next: 'Keyingi',
          today: 'Bugun',
          month: 'Oy',
          week: 'Hafta',
          day: 'Kun',
          list: "Ro'yxat"
        },
        weekText: 'Hafta',
        allDayText: 'Butun kun',
        moreLinkText: 'Yana +{{n}}',
        noEventsText: "Tadbirlar yo'q"
        // dayNames: uzWeekdaysLong,

        // dayNamesShort: uzWeekdaysShort,
        // monthNames: uzMonthsLong,
        // monthNamesShort: uzMonthsShort
      }
    }

    // For other languages, rely on Intl locale strings + our own buttonText.
    return intlLocale
  }, [i18n.language, intlLocale])

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
  }, [calendarApi, setCalendarApi])

  // Make sure FullCalendar updates its locale when the app language changes.
  useEffect(() => {
    if (!calendarApi) return
    try {
      calendarApi.setOption('locale', fullCalendarLocale)
    } catch (e) {
      // ignore
    }
  }, [calendarApi, fullCalendarLocale])

  if (store) {
    const totalCount = store.events?.length || 0

    const yearOptions = getYearOptions(year, 10)

    // ** calendarOptions(Props)
    const calendarOptions: any = {
      events: store.events.length ? (store.events as any) : [],
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
      initialView: 'dayGridMonth',
      // Register built-in / custom locales.
      locales: typeof fullCalendarLocale === 'string' ? [] : [fullCalendarLocale],
      locale: fullCalendarLocale,
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      buttonText: {
        today: String(t('calendar.today')),
        // Keep view buttons compact; list view will show a badge via customButtons below.
        month: String(t('calendar.month')),
        week: String(t('calendar.week')),
        day: String(t('calendar.day')),
        list: String(t('calendar.list'))
      },
      views: {
        week: {
          titleFormat: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const }
        },
        day: {
          titleFormat: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const }
        }
      },

      // Month view title (e.g., "Dekabr 2025")
      titleFormat: { year: 'numeric' as const, month: 'long' as const },

      dayHeaderFormat: { weekday: 'long' as const },
      eventTimeFormat: { hour: '2-digit' as const, minute: '2-digit' as const, hour12: false },

      /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
      editable: true,

      /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
      eventResizableFromStart: true,

      /*
        Automatically scroll the scroll-containers during event drag-and-drop and date selecting
        ? Docs: https://fullcalendar.io/docs/dragScroll
      */
      dragScroll: true,

      /*
        Max number of events within a given day
        ? Docs: https://fullcalendar.io/docs/dayMaxEvents
      */
      dayMaxEvents: 2,

      /*
        Determines if day names and week names are clickable
        ? Docs: https://fullcalendar.io/docs/navLinks
      */
      navLinks: true,

      eventClassNames({ event: calendarEvent }: any) {
        // @ts-ignore
        const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]

        return [
          // Background Color
          `bg-${colorName}`
        ]
      },

      eventClick({ event: clickedEvent }: any) {
        // dispatch(handleSelectEvent(clickedEvent))
        handleAddEventSidebarToggle()

        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)

        // isAddNewEventSidebarActive.value = true
      },

      customButtons: {
        sidebarToggle: {
          icon: 'bi bi-list',
          click() {
            handleLeftSidebarToggle()
          }
        }
      },

      dateClick(info: any) {
        const ev = { ...blankEvent }
        ev.start = info.date
        ev.end = info.date
        ev.allDay = true

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
        handleAddEventSidebarToggle()
      },

      /*
        Handle event drop (Also include dragged event)
        ? Docs: https://fullcalendar.io/docs/eventDrop
        ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
      */
      eventDrop({ event: droppedEvent }: any) {
        // dispatch(updateEvent(droppedEvent))
      },

      /*
        Handle event resize
        ? Docs: https://fullcalendar.io/docs/eventResize
      */
      eventResize({ event: resizedEvent }: any) {
        // dispatch(updateEvent(resizedEvent))
      },

      ref: calendarRef,

      // Get direction from app state (store)
      direction
    }

    // Force a remount on language change so FullCalendar re-renders month/day names.
    return (
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            zIndex: 2,
            top: 12,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>
            {String(t('calendar.year'))}
          </Typography>
          <Select
            size='small'
            value={year}
            onChange={e => {
              const y = Number(e.target.value)
              setYear(y)
              // @ts-ignore
              calendarRef.current?.getApi()?.gotoDate(new Date(y, 0, 1))
            }}
            sx={{ minWidth: 110 }}
          >
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>

          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 22,
              height: 22,
              px: 1,
              borderRadius: 999,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: 12,
              lineHeight: '22px'
            }}
            title={String(t('calendar.list'))}
          >
            {totalCount}
          </Box>
        </Box>

        <FullCalendar key={String(i18n.language)} {...calendarOptions} />
      </Box>
    )
  } else {
    return null
  }
}

export default Calendar
