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
  Divider
} from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'
import Icon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'

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

const MyProfileAttendanceTable = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const {
    data = [],
    loading,
    total
  } = useFetchList<EmployeeAccountType>(
    endpoints.employeeAccount,
    {
      page,
      limit: pageSize,
      employee: user?.id
    },
    !!user?.id
  )

  const totalPages = Math.ceil(total / pageSize)

  return (
    <Card>
      <CardHeader
        title={String(t('myProfile.attendance.title') || 'Kirish/Chiqish tarixi')}
        avatar={<IconifyIcon icon='tabler:clock-hour-4' fontSize='1.5rem' />}
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              {String(t('myProfile.attendance.empty') || 'Ma\'lumot topilmadi')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {data.map((item, index) => {
              const isInput = item.type === 'input'
              const formattedDate = item.date ? moment(item.date).format('DD.MM.YYYY HH:mm') : '—'

              return (
                <Box key={item.id}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 1,
                      border: theme => `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'),
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: theme => theme.palette.primary.main,
                        backgroundColor: theme =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.02)',
                        boxShadow: theme => `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
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
                            isInput
                              ? `${theme.palette.success.main}15`
                              : `${theme.palette.error.main}15`,
                          color: theme => (isInput ? theme.palette.success.main : theme.palette.error.main),
                          flexShrink: 0
                        }}
                      >
                        <Icon
                          icon={isInput ? 'tabler:login' : 'tabler:logout'}
                          fontSize='1.5rem'
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 1 }}>
                          <Chip
                            label={isInput ? String(t('attendance.input') || 'Keldi') : String(t('attendance.output') || 'Ketdi')}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
            <Typography variant='body2' color='text.secondary'>
              {String(t('common.showing') || 'Ko\'rsatilmoqda')} {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} {String(t('common.of') || 'dan')} {total}
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

export default MyProfileAttendanceTable
