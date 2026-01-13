// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { alpha, useTheme } from '@mui/material/styles'

// ** Types / Hooks
import { CalendarType } from 'src/types/calendar'
import { useTranslation } from 'react-i18next'
import { DataService } from 'src/configs/dataService'
import { useAuth } from 'src/hooks/useAuth'

// ** Icon
import Icon from 'src/@core/components/icon'

type ViewMode = 'month' | 'list'

type StatusKey = 'new' | 'in_progress' | 'on_review' | 'returned' | 'done' | 'cancelled' | (string & {})

type DayStats = {
  total: number
  byStatus?: Partial<Record<StatusKey, number>>
}

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

const statusOrder: string[] = ['new', 'in_progress', 'on_review', 'returned', 'done', 'cancelled']

const statusColors: Record<string, string> = {
  new: '#FF9F43',
  in_progress: '#00CFE8',
  on_review: '#7367F0',
  returned: '#EA5455',
  done: '#28C76F',
  cancelled: '#82868B'
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const toISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const addDays = (d: Date, days: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + days)

  return x
}

const addMonths = (y: number, m: number, delta: number) => {
  const d = new Date(y, m, 1)
  d.setMonth(d.getMonth() + delta)

  return { year: d.getFullYear(), month: d.getMonth() }
}

// Monday-first
const startOfWeekMonday = (d: Date) => {
  const day = d.getDay() // 0 Sun .. 6 Sat
  const mondayBased = (day + 6) % 7 // 0 Mon .. 6 Sun

  return addDays(d, -mondayBased)
}

const endOfWeekSunday = (d: Date) => addDays(startOfWeekMonday(d), 6)

const buildMonthGrid = (year: number, month: number) => {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = startOfWeekMonday(first)
  const end = endOfWeekSunday(last)

  const weeks: Date[][] = []
  let cursor = start
  while (cursor <= end) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(cursor)
      cursor = addDays(cursor, 1)
    }
    weeks.push(week)
  }

  return weeks
}

const CustomCalendar = (props: CalendarType) => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const { user } = useAuth()

  const { handleLeftSidebarToggle, handleSelectDate, setCalendarApi } = props

  // Tuning (compact like your screenshot)
  const MONTH_CELL_HEIGHT = 56

  const [view, setView] = useState<ViewMode>('month')
  const [year, setYear] = useState<number>(() => new Date().getFullYear())
  const [month, setMonth] = useState<number>(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [detailDate, setDetailDate] = useState<string | null>(null)

  const [dayCounts, setDayCounts] = useState<Record<string, DayStats>>({})

  const langKey = useMemo(() => {
    const lng = (i18n.language || 'ru').toLowerCase()
    if (lng.startsWith('uz')) return 'uz'
    if (lng.startsWith('ru')) return 'ru'

    return 'en'
  }, [i18n.language])

  const intlLocale = useMemo(() => {
    const lng = (i18n.language || 'ru').toLowerCase()
    if (lng.startsWith('ru')) return 'ru-RU'
    if (lng.startsWith('uz')) return 'uz-UZ'

    return 'en-GB'
  }, [i18n.language])

  const monthNames = monthNamesByLang[langKey]

  const title = useMemo(() => `${monthNames[month]} ${year}`, [monthNames, month, year])

  const weekdayLabels = useMemo(() => {
    // Monday-first headers
    const base = startOfWeekMonday(new Date(2025, 0, 6)) // a Monday
    const fmt = new Intl.DateTimeFormat(intlLocale, { weekday: 'long' })

    return Array.from({ length: 7 }).map((_, i) => fmt.format(addDays(base, i)))
  }, [intlLocale])

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month])

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const fetchMonthStats = async (y: number, m: number) => {
    const monthParam = m + 1
    try {
      const roleNames = user?.role_detail?.map(r => r.name) || []
      const isAdminOrManager = roleNames.includes('Admin') || roleNames.includes('Manager')

      const payloadBody: any = {
        year: y,
        month: monthParam,
        company: user?.company_id
      }

      // Admin/Manager should see all tasks: do NOT filter by assignee_id
      if (!isAdminOrManager) {
        payloadBody.assignee_id = user?.id
      }

      const res = await DataService.post<any>('task-calendar/stats/by-start-date/', payloadBody)
      const payload = (res as any)?.data
      const nextMap: Record<string, DayStats> = {}

      const byStartDate = Array.isArray(payload?.by_start_date) ? payload.by_start_date : null
      if (byStartDate) {
        // First pass: group by date and aggregate totals and status counts
        const dateGroups: Record<string, { total: number; byStatus: Record<string, number> }> = {}

        for (const row of byStartDate) {
          const d = row?.start_date
          const total = Number(row?.total ?? 0)
          if (typeof d !== 'string' || !Number.isFinite(total)) continue

          // Convert ISO datetime string to YYYY-MM-DD format
          let dateKey: string
          try {
            const dateObj = new Date(d)
            if (!Number.isNaN(dateObj.getTime())) {
              dateKey = toISODate(dateObj)
            } else {
              // Fallback: try to extract YYYY-MM-DD from string
              const match = d.match(/^(\d{4}-\d{2}-\d{2})/)
              dateKey = match ? match[1] : d
            }
          } catch {
            // Fallback: try to extract YYYY-MM-DD from string
            const match = d.match(/^(\d{4}-\d{2}-\d{2})/)
            dateKey = match ? match[1] : d
          }

          // Initialize date group if it doesn't exist
          if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = { total: 0, byStatus: {} }
          }

          // Aggregate total
          dateGroups[dateKey].total += total

          // Aggregate by_status counts
          const bs = row?.by_status
          if (bs && typeof bs === 'object') {
            for (const [k, v] of Object.entries(bs)) {
              const c = Number((v as any)?.count ?? 0)
              if (Number.isFinite(c) && c > 0) {
                dateGroups[dateKey].byStatus[k] = (dateGroups[dateKey].byStatus[k] || 0) + c
              }
            }
          }
        }

        // Convert grouped data to the expected format
        for (const [dateKey, group] of Object.entries(dateGroups)) {
          nextMap[dateKey] = { total: group.total, byStatus: group.byStatus }
        }

        setDayCounts(nextMap)

        return
      }

      // fallback shapes
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
    } catch {
      setDayCounts({})
    }
  }

  useEffect(() => {
    fetchMonthStats(year, month)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, user?.company_id, user?.id])

  // Provide a small API object for compatibility (not used elsewhere today).
  useEffect(() => {
    setCalendarApi?.({
      getDate: () => new Date(year, month, 1),
      gotoDate: (d: Date) => {
        setYear(d.getFullYear())
        setMonth(d.getMonth())
      },
      prev: () => {
        const next = addMonths(year, month, -1)
        setYear(next.year)
        setMonth(next.month)
      },
      next: () => {
        const next = addMonths(year, month, 1)
        setYear(next.year)
        setMonth(next.month)
      }
    })
  }, [setCalendarApi, year, month])

  const onPickDate = (dateStr: string) => {
    setSelectedDate(dateStr)
    handleSelectDate(dateStr)
  }

  const handleCellClick = (dateStr: string) => {
    const stats = dayCounts?.[dateStr]
    const total = Number(stats?.total ?? 0)
    const byStatus = (stats?.byStatus || {}) as Record<string, number>
    const hasAnyStatus = Object.values(byStatus).some(v => Number(v) > 0)
    const hasData = (Number.isFinite(total) && total > 0) || hasAnyStatus

    if (hasData) {
      setDetailDate(dateStr)
      onPickDate(dateStr)
    } else {
      onPickDate(dateStr)
    }
  }

  const renderStats = (dateStr: string, compact = true) => {
    const stats = dayCounts?.[dateStr]
    const total = Number(stats?.total ?? 0)
    const byStatus = (stats?.byStatus || {}) as Record<string, number>
    const hasAnyStatus = Object.values(byStatus).some(v => Number(v) > 0)
    const shouldRender = (Number.isFinite(total) && total > 0) || hasAnyStatus
    if (!shouldRender) return null

    const statusKeyMap: Record<string, string> = {
      new: 'documents.status.new',
      in_progress: 'documents.status.inProgress',
      on_review: 'documents.status.onReview',
      returned: 'documents.status.returned',
      done: 'documents.status.done',
      cancelled: 'documents.status.cancelled'
    }

    const keys = [...statusOrder, ...Object.keys(byStatus).filter(k => !statusOrder.includes(k))]

    const Row = ({ label, count, color }: { label: string; count: number; color: string }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: compact ? 1 : 2,
          py: compact ? 0.25 : 0.75,
          borderRadius: 1,
          fontSize: compact ? '10px' : '14px',
          lineHeight: compact ? '12px' : '20px',
          backgroundColor: alpha(color, 0.12)
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: compact ? 8 : 12,
              height: compact ? 8 : 12,
              borderRadius: 999,
              backgroundColor: color,
              flex: '0 0 auto'
            }}
          />
          <Typography sx={{ fontSize: compact ? 10 : 14 }} noWrap>
            {label}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: compact ? 10 : 14, fontWeight: 700, color }} noWrap>
          {String(count)}
        </Typography>
      </Box>
    )

    if (compact) {
      return (
        <Stack spacing={0.5} sx={{ mt: 0.5, overflow: 'hidden' }}>
          {Number.isFinite(total) && total > 0 ? (
            <Row label={String(t('calendar.stats.total') || 'Total')} count={total} color={'rgba(115,103,240,0.95)'} />
          ) : null}
          {keys.map(k => {
            const c = Number(byStatus[k] ?? 0)
            if (!Number.isFinite(c) || c <= 0) return null
            const label = statusKeyMap[k] ? String(t(statusKeyMap[k])) : k.replaceAll('_', ' ')

            return <Row key={k} label={label} count={c} color={statusColors[k] || '#999'} />
          })}
        </Stack>
      )
    }

    // Non-compact view: 3 columns grid
    const statusItems = keys
      .map(k => {
        const c = Number(byStatus[k] ?? 0)
        if (!Number.isFinite(c) || c <= 0) return null
        const label = statusKeyMap[k] ? String(t(statusKeyMap[k])) : k.replaceAll('_', ' ')

        return { key: k, label, count: c, color: statusColors[k] || '#999' }
      })
      .filter(Boolean) as Array<{ key: string; label: string; count: number; color: string }>

    return (
      <Box>
        <Grid container spacing={2}>
          {Number.isFinite(total) && total > 0 && (
            <Grid item xs={12} sm={6} md={4} key={'total'} sx={{ mb: 2 }}>
              <Row
                label={String(t('calendar.stats.total') || 'Total')}
                count={total}
                color={'rgba(115,103,240,0.95)'}
              />
            </Grid>
          )}
          {statusItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.key}>
              <Row label={item.label} count={item.count} color={item.color} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  const goToday = () => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  const goPrev = () => {
    const next = addMonths(year, month, -1)
    setYear(next.year)
    setMonth(next.month)
  }

  const goNext = () => {
    const next = addMonths(year, month, 1)
    setYear(next.year)
    setMonth(next.month)
  }

  const yearOptions = useMemo(() => getYearOptions(year, 10), [year])

  return (
    <Box sx={{ width: '100%' }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={handleLeftSidebarToggle} size='small' aria-label='sidebar'>
            <Icon icon='bi:list' />
          </IconButton>

          <IconButton onClick={goPrev} size='small' aria-label='prev'>
            <Icon icon='bi:chevron-left' />
          </IconButton>
          <IconButton onClick={goNext} size='small' aria-label='next'>
            <Icon icon='bi:chevron-right' />
          </IconButton>

          <Typography sx={{ ml: 1, ...theme.typography.h5 }} noWrap>
            {title}
          </Typography>

          <Button onClick={goToday} size='small' variant='outlined' sx={{ ml: 1 }}>
            {String(t('calendar.today') || 'Today')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Select
            size='small'
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            sx={{ height: 34, minWidth: 110 }}
          >
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>

          <Select
            size='small'
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            sx={{ height: 34, minWidth: 140 }}
          >
            {monthNames.map((label, idx) => (
              <MenuItem key={label} value={idx}>
                {label}
              </MenuItem>
            ))}
          </Select>

          <ButtonGroup variant='contained' size='small'>
            <Button
              onClick={() => setView('month')}
              variant={view === 'month' ? 'contained' : 'outlined'}
              sx={{ textTransform: 'capitalize' }}
            >
              {String(t('calendar.month') || 'Month')}
            </Button>
            <Button
              onClick={() => setView('list')}
              variant={view === 'list' ? 'contained' : 'outlined'}
              sx={{ textTransform: 'capitalize' }}
            >
              {String(t('calendar.list') || 'List')}
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Body */}
      {view === 'month' ? (
        <Box sx={{ minHeight: 380 }}>
          {/* Weekday header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              border: `1px solid ${theme.palette.divider}`,
              borderBottom: 0,
              backgroundColor: theme.palette.action.hover
            }}
          >
            {weekdayLabels.map(label => (
              <Box key={label} sx={{ px: 2, py: 1, borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 13 }} noWrap>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            {weeks.flat().map(d => {
              const isCurrentMonth = d.getMonth() === month
              const dateStr = toISODate(d)

              const isSelected = selectedDate === dateStr
              const isToday = todayStr === dateStr

              // mimic FC showNonCurrentDates=false
              const showNumber = isCurrentMonth

              const bg = isSelected
                ? alpha(theme.palette.primary.main, 0.35)
                : isToday
                ? alpha(theme.palette.primary.main, 0.1)
                : 'transparent'

              const stats = dayCounts?.[dateStr]
              const total = Number(stats?.total ?? 0)
              const byStatus = (stats?.byStatus || {}) as Record<string, number>
              const hasAnyStatus = Object.values(byStatus).some(v => Number(v) > 0)
              const hasData = (Number.isFinite(total) && total > 0) || hasAnyStatus

              return (
                <Box
                  key={dateStr}
                  onClick={showNumber ? () => handleCellClick(dateStr) : undefined}
                  sx={{
                    height: MONTH_CELL_HEIGHT,
                    minHeight: MONTH_CELL_HEIGHT,
                    maxHeight: MONTH_CELL_HEIGHT,
                    px: 1,
                    py: 0.5,
                    cursor: showNumber ? 'pointer' : 'default',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    backgroundColor: bg,
                    overflow: 'hidden',
                    opacity: showNumber ? 1 : 0.35
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {showNumber ? (
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', lineHeight: 1 }}>
                        {d.getDate()}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: 12, lineHeight: 1 }}>&nbsp;</Typography>
                    )}
                  </Box>

                  {showNumber && hasData ? (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'primary.main',
                          textAlign: 'center',
                          lineHeight: 1.2
                        }}
                      >
                        {total > 0 ? `${total} ${String(t('calendar.stats.total') || 'Total')}` : ''}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              )
            })}
          </Box>
        </Box>
      ) : (
        <Box sx={{ minHeight: 480 }}>
          <Stack spacing={2}>
            {Array.from({ length: new Date(year, month + 1, 0).getDate() }).map((_, i) => {
              const d = new Date(year, month, i + 1)
              const dateStr = toISODate(d)
              const stats = dayCounts?.[dateStr]
              const total = Number(stats?.total ?? 0)
              const byStatus = (stats?.byStatus || {}) as Record<string, number>
              const hasAny = (Number.isFinite(total) && total > 0) || Object.values(byStatus).some(v => Number(v) > 0)
              if (!hasAny) return null

              const isSelected = selectedDate === dateStr
              const isToday = todayStr === dateStr

              const fmt = new Intl.DateTimeFormat(intlLocale, { day: '2-digit', month: 'long', year: 'numeric' })
              const label = fmt.format(d)

              return (
                <Paper
                  key={dateStr}
                  variant='outlined'
                  onClick={() => onPickDate(dateStr)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
                    backgroundColor: isSelected
                      ? alpha(theme.palette.primary.main, 0.08)
                      : isToday
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'background.paper'
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{label}</Typography>
                  {renderStats(dateStr)}
                </Paper>
              )
            })}
          </Stack>
        </Box>
      )}

      {/* Detail Card - Shows below calendar when date is selected */}
      {detailDate && dayCounts?.[detailDate] && <div>{renderStats(detailDate, false)}</div>}
    </Box>
  )
}

export default CustomCalendar
