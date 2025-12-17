// ** React Import
import { useEffect, useMemo, useRef, useState } from 'react'

// ** MUI
import { useTheme } from '@mui/material/styles'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css'

// Shrink FullCalendar month cell size
import { useEffect as useLayoutEffect } from 'react'
import { CalendarType } from 'src/types/calendar'
import { useTranslation } from 'react-i18next'
import { DataService } from 'src/configs/dataService'
import { useAuth } from 'src/hooks/useAuth'

const getYearOptions = (centerYear: number, span = 10) => {
  const years: number[] = []
  for (let y = centerYear - span; y <= centerYear + span; y++) years.push(y)

  return years
}

const monthNamesByLang = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  ru: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ],
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
} as const

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
  // Inject compact cell CSS for month view
  useLayoutEffect(() => {
    const styleId = 'fc-compact-month-cells'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `
        /* Set month cell height to exactly 100px, including <td> */
        .fc-daygrid-day {
          min-height: 100px !important;
          height: 100px !important;
          max-height: 100px !important;
          padding: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          vertical-align: top !important;
        }
        .fc-daygrid-day-frame {
          min-height: 100px !important;
          height: 100px !important;
          max-height: 100px !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        .fc-daygrid-day-top {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .fc-daygrid-day-number {
        font-size: 18px !important;  
          display: inline-block !important;
        }
        .fc-daygrid-event {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        .fc-scrollgrid-sync-table {
          font-size: 12px !important;
        }
        /* Table row and cell fix for compactness */
        .fc-scrollgrid-sync-table tr {
          height: 100px !important;
          min-height: 100px !important;
          max-height: 100px !important;
        }
        .fc-scrollgrid-sync-table td[role="gridcell"],
        .fc-scrollgrid-sync-table td.fc-daygrid-day {
          height: 100px !important;
          min-height: 100px !important;
          max-height: 100px !important;
          vertical-align: top !important;
          padding: 0 !important;
        }
      `
      document.head.appendChild(style)
    }
    // After render, forcibly override inline style on all month gridcells
    setTimeout(() => {
      document.querySelectorAll('.fc-daygrid-day').forEach(td => {
        td.removeAttribute('style')
        td.setAttribute(
          'style',
          'height:100px;min-height:100px;max-height:100px;padding:0;vertical-align:top;cursor:pointer;'
        )
      })
    }, 100)
    return () => {
      const style = document.getElementById(styleId)
      if (style) style.remove()
    }
  }, [])
  const { i18n, t } = useTranslation()
  const theme = useTheme()

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
    handleAddEventSidebarToggle,
    handleSelectDate
  } = props

  // ** Refs
  const calendarRef = useRef<FullCalendar | null>(null)
  const { user } = useAuth()
  const [year, setYear] = useState<number>(() => new Date().getFullYear())
  const [month, setMonth] = useState<number>(() => new Date().getMonth())

  // YYYY-MM-DD of currently selected day in month grid
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  type StatusKey = 'new' | 'in_progress' | 'on_review' | 'returned' | 'done' | 'cancelled' | (string & {})

  type DayStats = {
    total: number
    byStatus?: Partial<Record<StatusKey, number>>
  }

  // Map of YYYY-MM-DD -> stats
  const [dayCounts, setDayCounts] = useState<Record<string, DayStats>>({})

  // When stats change, we'll re-render the current view without remounting the whole calendar
  // (remounting was resetting the injected year/month dropdown).
  const [statsTick, setStatsTick] = useState(0)

  const statusOrder: string[] = ['new', 'in_progress', 'on_review', 'returned', 'done', 'cancelled']

  const statusColors: Record<string, string> = {
    new: '#FF9F43',
    in_progress: '#00CFE8',
    on_review: '#7367F0',
    returned: '#EA5455',
    done: '#28C76F',
    cancelled: '#82868B'
  }

  useEffect(() => {
    if (!calendarApi) return
    try {
      const d = calendarApi.getDate?.()
      if (d instanceof Date && !Number.isNaN(d.getTime())) {
        setYear(d.getFullYear())
        setMonth(d.getMonth())
      }
    } catch {
      // ignore
    }
  }, [calendarApi])

  const fetchMonthStats = async (y: number, m: number) => {
    // Assumption: backend expects month 1..12
    const monthParam = m + 1
    try {
      const res = await DataService.post<any>('task-calendar/stats/by-start-date/', {
        year: y,
        month: monthParam,
        company: user?.company_id,
        assignee_id: user?.id
      })
      const payload = (res as any)?.data
      const nextMap: Record<string, DayStats> = {}

      // Preferred shape:
      // { by_start_date: [{ start_date: 'YYYY-MM-DD', total: n, by_status: { new: {count}, ... } }, ...] }
      const byStartDate = Array.isArray(payload?.by_start_date) ? payload.by_start_date : null
      if (byStartDate) {
        for (const row of byStartDate) {
          const d = row?.start_date
          const total = Number(row?.total ?? 0)
          if (typeof d !== 'string' || !Number.isFinite(total)) continue

          const byStatus: Record<string, number> = {}
          const bs = row?.by_status
          if (bs && typeof bs === 'object') {
            for (const [k, v] of Object.entries(bs)) {
              const c = Number((v as any)?.count ?? 0)
              if (Number.isFinite(c) && c > 0) byStatus[k] = c
            }
          }

          nextMap[d] = { total, byStatus }
        }

        setDayCounts(nextMap)
        setStatsTick(t => t + 1)

        return
      }

      // Accept multiple possible payload shapes
      if (Array.isArray(payload)) {
        for (const row of payload) {
          const d = row?.date || row?.day || row?.start_date
          const c = Number(row?.count ?? row?.total ?? row?.value ?? 0)
          if (typeof d === 'string' && Number.isFinite(c)) nextMap[d] = { total: c }
        }
      } else if (payload && typeof payload === 'object') {
        const rows = Array.isArray((payload as any).results) ? (payload as any).results : null
        if (rows) {
          for (const row of rows) {
            const d = row?.date || row?.day || row?.start_date
            const c = Number(row?.count ?? row?.total ?? row?.value ?? 0)
            if (typeof d === 'string' && Number.isFinite(c)) nextMap[d] = { total: c }
          }
        } else {
          for (const [k, v] of Object.entries(payload)) {
            const c = Number(v)
            if (typeof k === 'string' && Number.isFinite(c)) nextMap[k] = { total: c }
          }
        }
      }

      setDayCounts(nextMap)
      setStatsTick(t => t + 1)
    } catch {
      setDayCounts({})
      setStatsTick(t => t + 1)
    }
  }

  const injectMonthStatsIntoGrid = () => {
    // FullCalendar React component doesn't expose `el` in typings, but calendar API does.
    // @ts-ignore
    const root = calendarRef.current?.getApi?.()?.el as HTMLElement | undefined
    if (!root) return

    // Only for month grid
    const viewType = calendarRef.current?.getApi?.()?.view?.type
    if (viewType !== 'dayGridMonth') return

    const cells = root.querySelectorAll('.fc-daygrid-day')
    cells.forEach(cell => {
      const el = cell as HTMLElement
      const dateStr = el.getAttribute('data-date') // YYYY-MM-DD
      if (!dateStr) return

      const host = (el.querySelector('.fc-daygrid-day-events') as HTMLElement | null) || el

      // Always remove previous injected block first
      const prev = host.querySelector('[data-task-stats-block="1"]') as HTMLElement | null
      if (prev) prev.remove()

      const stats = dayCounts?.[dateStr]
      const total = Number(stats?.total ?? 0)
      const byStatus = (stats?.byStatus || {}) as Record<string, number>
      const hasAnyStatusCount = Object.values(byStatus).some(v => Number(v) > 0)
      const shouldRender = (Number.isFinite(total) && total > 0) || hasAnyStatusCount
      if (!shouldRender) return

      const block = document.createElement('div')
      block.setAttribute('data-task-stats-block', '1')
      block.style.display = 'flex'
      block.style.flexDirection = 'column'
      block.style.gap = '4px'

      const mkRow = (label: string, count: number, color?: string) => {
        const row = document.createElement('div')
        row.className = 'fc-daygrid-event fc-daygrid-block-event'
        row.style.display = 'flex'
        row.style.alignItems = 'center'
        row.style.justifyContent = 'space-between'
        row.style.padding = '2px 6px'
        row.style.borderRadius = '4px'
        row.style.fontSize = '12px'
        row.style.lineHeight = '16px'

        const left = document.createElement('span')
        left.style.display = 'inline-flex'
        left.style.alignItems = 'center'
        left.style.gap = '6px'

        if (color) {
          const dot = document.createElement('span')
          dot.style.width = '8px'
          dot.style.height = '8px'
          dot.style.borderRadius = '999px'
          dot.style.background = color
          dot.style.flex = '0 0 auto'
          left.appendChild(dot)
        }

        const text = document.createElement('span')
        text.textContent = label
        left.appendChild(text)

        const right = document.createElement('span')
        right.textContent = String(count)
        right.style.fontWeight = '700'
        right.style.color = color || 'inherit'

        row.appendChild(left)
        row.appendChild(right)
        return row
      }

      // Total row
      if (Number.isFinite(total) && total > 0) {
        block.appendChild(mkRow(String(t('calendar.stats.total') || 'Total'), total, 'rgba(115,103,240,0.95)'))
      }

      const statusKeyMap: Record<string, string> = {
        new: 'documents.status.new',
        in_progress: 'documents.status.inProgress',
        on_review: 'documents.status.onReview',
        returned: 'documents.status.returned',
        done: 'documents.status.done',
        cancelled: 'documents.status.cancelled'
      }
      const keys = [...statusOrder, ...Object.keys(byStatus).filter(k => !statusOrder.includes(k))]
      for (const k of keys) {
        const c = Number(byStatus[k] ?? 0)
        if (!Number.isFinite(c) || c <= 0) continue
        const label = statusKeyMap[k] ? String(t(statusKeyMap[k])) : k.replaceAll('_', ' ')
        block.appendChild(mkRow(label, c, statusColors[k] || '#999'))
      }

      host.appendChild(block)
    })
  }

  const injectListStats = () => {
    // @ts-ignore
    const root = calendarRef.current?.getApi?.()?.el as HTMLElement | undefined
    if (!root) return

    const viewType = calendarRef.current?.getApi?.()?.view?.type
    if (viewType !== 'listMonth') return

    // Remove all original list events to avoid duplication
    root.querySelectorAll('.fc-list-event').forEach(el => {
      ;(el as HTMLElement).style.display = 'none'
    })

    // Each day has a header row .fc-list-day with data-date
    const dayRows = root.querySelectorAll('.fc-list-day')
    dayRows.forEach(dayRow => {
      const row = dayRow as HTMLElement
      const dateStr = row.getAttribute('data-date')
      if (!dateStr) return

      // Remove previous injected block for this date
      const prev = root.querySelector(`[data-task-stats-list="${dateStr}"]`) as HTMLElement | null
      if (prev) prev.remove()

      const stats = dayCounts?.[dateStr]
      const total = Number(stats?.total ?? 0)
      const byStatus = (stats?.byStatus || {}) as Record<string, number>
      const hasAny = (Number.isFinite(total) && total > 0) || Object.values(byStatus).some(v => Number(v) > 0)
      if (!hasAny) return

      const container = document.createElement('tr')
      container.setAttribute('data-task-stats-list', dateStr)
      container.className = 'fc-list-event'

      const td = document.createElement('td')
      td.setAttribute('colspan', '3')
      td.style.padding = '6px 10px'

      const block = document.createElement('div')
      block.style.display = 'flex'
      block.style.flexDirection = 'column'
      block.style.gap = '6px'

      const mkRow = (label: string, count: number, color?: string) => {
        const chip = document.createElement('div')
        chip.style.display = 'inline-flex'
        chip.style.alignItems = 'center'
        chip.style.justifyContent = 'space-between'
        chip.style.gap = '10px'
        chip.style.padding = '4px 10px'
        chip.style.borderRadius = '8px'
        chip.style.background = 'rgba(0,0,0,0.04)'

        const left = document.createElement('span')
        left.style.display = 'inline-flex'
        left.style.alignItems = 'center'
        left.style.gap = '8px'

        if (color) {
          const dot = document.createElement('span')
          dot.style.width = '8px'
          dot.style.height = '8px'
          dot.style.borderRadius = '999px'
          dot.style.background = color
          left.appendChild(dot)
        }

        const text = document.createElement('span')
        text.textContent = label
        left.appendChild(text)

        const right = document.createElement('span')
        right.textContent = String(count)
        right.style.fontWeight = '700'

        chip.appendChild(left)
        chip.appendChild(right)
        return chip
      }

      if (Number.isFinite(total) && total > 0) {
        block.appendChild(mkRow(String(t('calendar.stats.total') || 'Total'), total, 'rgba(115,103,240,0.95)'))
      }

      const statusKeyMap: Record<string, string> = {
        new: 'documents.status.new',
        in_progress: 'documents.status.inProgress',
        on_review: 'documents.status.onReview',
        returned: 'documents.status.returned',
        done: 'documents.status.done',
        cancelled: 'documents.status.cancelled'
      }
      const keys = [...statusOrder, ...Object.keys(byStatus).filter(k => !statusOrder.includes(k))]
      for (const k of keys) {
        const c = Number(byStatus[k] ?? 0)
        if (!Number.isFinite(c) || c <= 0) continue
        const label = statusKeyMap[k] ? String(t(statusKeyMap[k])) : k.replaceAll('_', ' ')
        block.appendChild(mkRow(label, c, statusColors[k] || '#999'))
      }

      td.appendChild(block)
      container.appendChild(td)

      // Insert after the day header row
      row.insertAdjacentElement('afterend', container)
    })
  }

  const applyDayHighlights = () => {
    // @ts-ignore
    const root = calendarRef.current?.getApi?.()?.el as HTMLElement | undefined
    if (!root) return

    const viewType = calendarRef.current?.getApi?.()?.view?.type
    if (viewType !== 'dayGridMonth') return

    const todayStr = new Date().toISOString().slice(0, 10)

    root.querySelectorAll('.fc-daygrid-day').forEach(cell => {
      const el = cell as HTMLElement
      const dateStr = el.getAttribute('data-date')
      if (!dateStr) return

      // Make day cells obviously clickable
      el.style.cursor = 'pointer'
      el.style.padding = '4px'

      // reset
      el.style.background = ''
      el.style.borderRadius = ''
      el.style.boxShadow = ''

      const isSelected = selectedDate === dateStr
      const isToday = todayStr === dateStr
      if (!isSelected && !isToday) return
      if (isToday) {
        const bgToday = 'rgb(98 0 238 / 10%)'
        el.style.background = bgToday
      }
      if (isSelected) {
        const bg = 'rgb(115 103 240 / 70%)'
        el.style.background = bg
      }
      //   el.style.borderRadius = '10px'
      //   el.style.boxShadow = isSelected ? 'inset 0 0 0 2px rgba(0,0,0,0.08)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)'
    })
  }

  // Refresh injected stats whenever data changes or translations change.
  useEffect(() => {
    try {
      injectMonthStatsIntoGrid()
      injectListStats()
      applyDayHighlights()
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsTick, i18n.language, selectedDate])

  useEffect(() => {
    fetchMonthStats(year, month)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  const langKey = useMemo(() => {
    const lng = (i18n.language || 'ru').toLowerCase()
    if (lng.startsWith('uz')) return 'uz'
    if (lng.startsWith('ru')) return 'ru'

    return 'en'
  }, [i18n.language])

  const monthNames = monthNamesByLang[langKey]

  const applyYearMonth = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
    calendarRef.current?.getApi()?.gotoDate(new Date(y, m, 1))
  }

  // Inject year+month dropdowns into the FullCalendar toolbar so UI matches other header buttons.
  // This targets the actual `.fc-yearMonth-button` (custom button) and replaces its contents.
  useEffect(() => {
    // FullCalendar React component doesn't expose `el` in typings, but calendar API does.
    // @ts-ignore
    const root = calendarRef.current?.getApi?.()?.el as HTMLElement | undefined
    if (!root) return

    const btn = root.querySelector('.fc-yearMonth-button') as HTMLButtonElement | null
    if (!btn) return

    // Keep FC spacing/styling, but don't show a "blank" button.
    btn.classList.add('fc-button', 'fc-button-primary')
    btn.style.display = 'inline-flex'
    btn.style.alignItems = 'center'
    btn.style.background = 'transparent'
    btn.style.gap = '8px'
    btn.style.padding = '0'

    // Create/find host.
    let host = btn.querySelector('.fc-year-month-host') as HTMLSpanElement | null
    if (!host) {
      btn.innerHTML = ''
      host = document.createElement('span')
      host.className = 'fc-year-month-host'
      host.style.display = 'inline-flex'
      host.style.alignItems = 'center'
      host.style.gap = '8px'
      host.style.padding = '2px'
      btn.appendChild(host)
    } else {
      host.innerHTML = ''
    }

    const mkSelect = () => {
      const el = document.createElement('select')
      // Use FC button classes so it looks identical to other toolbar buttons.
      el.className = 'fc-button fc-button-primary'
      el.style.height = '32px'
      el.style.padding = '0 10px'
      el.style.borderRadius = '6px'
      el.style.cursor = 'pointer'
      // neutralize default select arrow differences
      el.style.appearance = 'none'
      // prevent select from expanding too much
      el.style.maxWidth = '140px'
      return el
    }

    const yearSelect = mkSelect()
    const monthSelect = mkSelect()

    // Fill year options
    const yearOptions = getYearOptions(year, 10)
    for (const y of yearOptions) {
      const opt = document.createElement('option')
      opt.value = String(y)
      opt.textContent = String(y)
      if (y === year) opt.selected = true
      yearSelect.appendChild(opt)
    }

    // Fill month options
    monthNames.forEach((label, idx) => {
      const opt = document.createElement('option')
      opt.value = String(idx)
      opt.textContent = label
      if (idx === month) opt.selected = true
      monthSelect.appendChild(opt)
    })

    const onYearChange = () => {
      const y = Number(yearSelect.value)
      if (!Number.isFinite(y)) return
      applyYearMonth(y, month)
    }

    const onMonthChange = () => {
      const m = Number(monthSelect.value)
      if (!Number.isFinite(m)) return
      applyYearMonth(year, m)
    }

    yearSelect.addEventListener('change', onYearChange)
    monthSelect.addEventListener('change', onMonthChange)

    host.appendChild(yearSelect)
    host.appendChild(monthSelect)

    return () => {
      yearSelect.removeEventListener('change', onYearChange)
      monthSelect.removeEventListener('change', onMonthChange)
    }
  }, [applyYearMonth, month, monthNames, year])

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
        end: 'yearMonth, dayGridMonth,listMonth'
      },
      buttonText: {
        today: String(t('calendar.today')),
        month: String(t('calendar.month')),
        week: String(t('calendar.week')),
        day: String(t('calendar.day')),
        list: String(t('calendar.list'))
      },
      views: {
        dayGridMonth: {
          fixedWeekCount: false,
          showNonCurrentDates: false
        }
      },

      // Month view title (e.g., "Dekabr 2025")
      titleFormat: { year: 'numeric' as const, month: 'long' as const },

      dayHeaderFormat: { weekday: 'long' as const },
      eventTimeFormat: { hour: '2-digit' as const, minute: '2-digit' as const, hour12: false },

      // Sync our internal year/month with calendar navigation (prev/next/today/title clicks).
      datesSet(arg: any) {
        const d = arg?.view?.currentStart || arg?.start
        if (d instanceof Date && !Number.isNaN(d.getTime())) {
          const y = d.getFullYear()
          const m = d.getMonth()
          if (y !== year) setYear(y)
          if (m !== month) setMonth(m)
        }

        // After navigation, ensure stats blocks are injected for currently visible month.
        // (dayCellDidMount won't re-run when stats arrive asynchronously.)
        try {
          injectMonthStatsIntoGrid()
          injectListStats()
          applyDayHighlights()
        } catch {
          // ignore
        }
      },

      // Stats blocks are injected via DOM scan when data/view changes.
      dayCellDidMount() {
        // no-op
      },

      //   dayCellClassNames(arg: any) {
      //     // Provide stable classnames for possible CSS hooks.
      //     const dateStr = arg?.date?.toISOString?.().slice(0, 10)
      //     const todayStr = new Date().toISOString().slice(0, 10)
      //     const classes: string[] = []
      //     if (dateStr && selectedDate && dateStr === selectedDate) classes.push('fc-day-selected')
      //     if (dateStr && dateStr === todayStr) classes.push('fc-day-today-primary')
      //     return classes
      //   },

      // In month grid, we want to show only stats badges instead of event blocks.
      eventDisplay: 'auto',
      eventDidMount(info: any) {
        if (info?.view?.type === 'dayGridMonth') {
          // Hide the rendered event element (keeps data for other views)
          const el = info.el as HTMLElement | undefined
          if (el) el.style.display = 'none'
        }

        if (info?.view?.type === 'listMonth') {
          const el = info.el as HTMLElement | undefined
          if (el) el.style.display = 'none'
        }
      },

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
        // Events are hidden in month grid, so ignore clicks there.
        // (Week/Day/List views still show events and clicks work.)
        // @ts-ignore
        const viewType = clickedEvent?._context?.viewApi?.type
        if (viewType === 'dayGridMonth') return

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
        },
        yearMonth: {
          text: '',
          click() {
            // no-op
          }
        }
      },

      dateClick(info: any) {
        // Mark selected day
        const dateStr = info?.dateStr as string | undefined
        if (dateStr) {
          setSelectedDate(dateStr)
          handleSelectDate(dateStr)
        }

        // Keep existing placeholder behavior
        const ev = { ...blankEvent }
        ev.start = info.date
        ev.end = info.date
        ev.allDay = true

        // Immediately update highlights
        try {
          applyDayHighlights()
        } catch {
          // ignore
        }
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
    return <FullCalendar key={String(i18n.language)} {...calendarOptions} />
  } else {
    return null
  }
}

export default Calendar
