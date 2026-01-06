import { Grid, Card, CardContent, Box, Avatar, Typography, Chip, Divider } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import Icon from 'src/@core/components/icon'
import { getInitials } from 'src/@core/utils/get-initials'
import moment from 'moment'
import MyProfileAttendanceTable from './MyProfileAttendanceTable'

const MyProfilePage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Grid container spacing={4}>
      {/* Profile Header */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Avatar
                src={user.avatar || undefined}
                alt={user.fullname || user.username}
                sx={{ width: 100, height: 100, fontSize: '2.5rem' }}
              >
                {getInitials(user.fullname || user.username || 'U')}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant='h5' sx={{ mb: 1 }}>
                  {user.fullname || user.username}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  @{user.username}
                </Typography>
                {user.role_detail && user.role_detail.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user.role_detail.map(role => (
                      <Chip key={role.id} label={role.name} size='small' color='primary' variant='outlined' />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Personal Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              {String(t('users.form.personalInfo') || 'Personal Information')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {user.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:mail' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.email') || 'Email')}
                    </Typography>
                    <Typography variant='body2'>{user.email}</Typography>
                  </Box>
                </Box>
              )}
              {user.phone_number && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:phone' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.phoneNumber') || 'Phone Number')}
                    </Typography>
                    <Typography variant='body2'>{user.phone_number}</Typography>
                  </Box>
                </Box>
              )}
              {user.date_of_birthday && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:calendar' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.dateOfBirthday') || 'Date of Birthday')}
                    </Typography>
                    <Typography variant='body2'>
                      {moment(user.date_of_birthday).isValid()
                        ? moment(user.date_of_birthday).format('DD.MM.YYYY')
                        : user.date_of_birthday}
                    </Typography>
                  </Box>
                </Box>
              )}
              {user.gender && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:gender-male' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.gender') || 'Gender')}
                    </Typography>
                    <Typography variant='body2'>
                      {user.gender === 'male'
                        ? String(t('users.gender.male') || 'Male')
                        : user.gender === 'female'
                        ? String(t('users.gender.female') || 'Female')
                        : user.gender}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Additional Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              {String(t('users.form.additionalInfo') || 'Additional Information')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {user.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:map-pin' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.address') || 'Address')}
                    </Typography>
                    <Typography variant='body2'>{user.address}</Typography>
                  </Box>
                </Box>
              )}
              {user.region && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:map' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.region') || 'Region')}
                    </Typography>
                    <Typography variant='body2'>{user.region}</Typography>
                  </Box>
                </Box>
              )}
              {user.district && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:map-pin' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.district') || 'District')}
                    </Typography>
                    <Typography variant='body2'>{user.district}</Typography>
                  </Box>
                </Box>
              )}
              {user.date_joined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:calendar-event' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.dateJoined') || 'Date Joined')}
                    </Typography>
                    <Typography variant='body2'>
                      {moment(user.date_joined).isValid()
                        ? moment(user.date_joined).format('DD.MM.YYYY')
                        : user.date_joined}
                    </Typography>
                  </Box>
                </Box>
              )}
              {user.is_active !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>
                    <Icon icon='tabler:user-check' fontSize='1.25rem' />
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {String(t('users.form.status') || 'Status')}
                    </Typography>
                    <Chip
                      label={
                        user.is_active
                          ? String(t('common.active') || 'Active')
                          : String(t('common.inactive') || 'Inactive')
                      }
                      color={user.is_active ? 'success' : 'default'}
                      size='small'
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Company Information */}
      {user.companies_detail && user.companies_detail.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                {String(t('users.form.companies') || 'Companies')}
              </Typography>
              <Grid container spacing={2}>
                {user.companies_detail.map(company => (
                  <Grid item xs={12} sm={6} md={4} key={company.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      {company.logo && (
                        <Avatar src={company.logo} alt={company.name} sx={{ width: 40, height: 40 }}>
                          {company.name.charAt(0)}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {company.name}
                        </Typography>
                        {company.code && (
                          <Typography variant='caption' color='text.secondary'>
                            {String(t('users.form.code') || 'Code')}: {company.code}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Attendance Table */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <MyProfileAttendanceTable />
      </Grid>
    </Grid>
  )
}

export default MyProfilePage
