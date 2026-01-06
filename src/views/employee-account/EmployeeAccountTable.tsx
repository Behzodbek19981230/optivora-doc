import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
  Pagination,
  CircularProgress,
  Divider,
  Grid,
  Button
} from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'
import Icon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import Autocomplete from '@mui/material/Autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import MenuItem from '@mui/material/MenuItem'
import { SelectChangeEvent } from '@mui/material/Select'

type EmployeeAccountType = {
  id: number
  company: number
  company_detail?: {
    id: number
    name: string
  }
  employee: number
  employee_detail?: {
    id: number
    fullname: string
    username: string
  }
  date: string
  type: 'input' | 'output'
  comment?: string
  created_time?: string
}

const EmployeeAccountTable = () => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; fullname: string; username: string } | null>(
    null
  )
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedType, setSelectedType] = useState<string>('')

  // Fetch employees for filter
  const { data: employees = [] } = useFetchList<{ id: number; fullname: string; username: string }>(endpoints.users, {
    page: 1,
    limit: 100
  })

  // Build filter params
  const filterParams: Record<string, string | number> = {
    page,
    limit: pageSize
  }

  if (selectedEmployee) {
    filterParams.employee = selectedEmployee.id
  }

  if (startDate) {
    filterParams.date_from = moment(startDate).format('YYYY-MM-DD')
  }

  if (endDate) {
    filterParams.date_to = moment(endDate).format('YYYY-MM-DD')
  }

  if (selectedType) {
    filterParams.type = selectedType
  }

  const { data = [], loading, total } = useFetchList<EmployeeAccountType>(endpoints.employeeAccount, filterParams)

  const totalPages = Math.ceil(total / pageSize)

  const handleClearFilters = () => {
    setSelectedEmployee(null)
    setStartDate(null)
    setEndDate(null)
    setSelectedType('')
    setPage(1)
  }

  const handleTypeChange = (e: SelectChangeEvent<unknown>) => {
    setSelectedType(e.target.value as string)
    setPage(1)
  }

  const hasFilters = selectedEmployee || startDate || endDate || selectedType

  return (
    <Card>
      <CardHeader
        title={String(t('employeeAccount.title') || 'Employee Account')}
        avatar={<IconifyIcon icon='tabler:clock-hour-4' fontSize='1.5rem' />}
      />
      <CardContent>
        {/* Filters */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 1,
            border: theme => `1px solid ${theme.palette.divider}`,
            bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)')
          }}
        >
          <Grid container spacing={3} alignItems='flex-end'>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={employees}
                value={selectedEmployee}
                onChange={(_, newValue) => {
                  setSelectedEmployee(newValue)
                  setPage(1)
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={option => option?.fullname || option?.username || ''}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    fullWidth
                    label={String(t('employeeAccount.filter.employee') || 'Xodim')}
                    placeholder={String(t('common.search') || 'Qidirish...')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <CustomTextField
                select
                fullWidth
                label={String(t('employeeAccount.filter.type') || 'Turi')}
                value={selectedType}
                SelectProps={{
                  displayEmpty: true,
                  value: selectedType,
                  onChange: handleTypeChange
                }}
              >
                <MenuItem value=''>{String(t('employeeAccount.filter.all') || 'Barchasi')}</MenuItem>
                <MenuItem value='input'>{String(t('attendance.input') || 'Keldi')}</MenuItem>
                <MenuItem value='output'>{String(t('attendance.output') || 'Ketdi')}</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => {
                  setStartDate(date)
                  setPage(1)
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText={String(t('employeeAccount.filter.dateFrom') || 'Dan')}
                showMonthDropdown
                showYearDropdown
                dropdownMode='scroll'
                customInput={
                  <CustomTextField fullWidth label={String(t('employeeAccount.filter.dateFrom') || 'Dan')} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => {
                  setEndDate(date)
                  setPage(1)
                }}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText={String(t('employeeAccount.filter.dateTo') || 'Gacha')}
                showMonthDropdown
                showYearDropdown
                dropdownMode='scroll'
                customInput={
                  <CustomTextField fullWidth label={String(t('employeeAccount.filter.dateTo') || 'Gacha')} />
                }
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <Button
                fullWidth
                variant='outlined'
                onClick={handleClearFilters}
                disabled={!hasFilters}
                startIcon={<Icon icon='tabler:x' />}
              >
                {String(t('common.clear') || 'Tozalash')}
              </Button>
            </Grid>
          </Grid>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              {String(t('employeeAccount.empty') || "Ma'lumot topilmadi")}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {data.map((item, index) => {
              const isInput = item.type === 'input'
              const formattedDate = item.date ? moment(item.date).format('DD.MM.YYYY HH:mm') : '—'
              const employeeName = item.employee_detail?.fullname || item.employee_detail?.username || '—'

              return (
                <Box key={item.id}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 1,
                      border: theme => `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: theme => theme.palette.primary.main,
                        backgroundColor: theme =>
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                        boxShadow: theme =>
                          `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
                      }
                    }}
                  >
                    <Stack direction='row' spacing={2} alignItems='flex-start'>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme =>
                            isInput ? `${theme.palette.success.main}15` : `${theme.palette.error.main}15`,
                          color: theme => (isInput ? theme.palette.success.main : theme.palette.error.main),
                          flexShrink: 0
                        }}
                      >
                        <Icon icon={isInput ? 'tabler:login' : 'tabler:logout'} fontSize='1.5rem' />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 1.5 }}>
                          <Typography variant='body1' sx={{ fontWeight: 500 }}>
                            {employeeName}
                          </Typography>
                        </Stack>
                        <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 1 }}>
                          <Chip
                            label={
                              isInput
                                ? String(t('attendance.input') || 'Keldi')
                                : String(t('attendance.output') || 'Ketdi')
                            }
                            color={isInput ? 'success' : 'error'}
                            size='small'
                            sx={{ fontWeight: 600 }}
                          />
                          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                            {formattedDate}
                          </Typography>
                        </Stack>
                        {item.comment && (
                          <Box
                            sx={{
                              mt: 1.5,
                              p: 2,
                              borderRadius: 1,
                              backgroundColor: theme =>
                                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
                            }}
                          >
                            <Typography variant='body2' color='text.secondary'>
                              {item.comment}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                  {index < data.length - 1 && <Divider sx={{ my: 0 }} />}
                </Box>
              )
            })}
          </Stack>
        )}
        {!loading && total > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              {String(t('common.showing') || "Ko'rsatilmoqda")} {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, total)} {String(t('common.of') || 'dan')} {total}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color='primary'
              size='medium'
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default EmployeeAccountTable
