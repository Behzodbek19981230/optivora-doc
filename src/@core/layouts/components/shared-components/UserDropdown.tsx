// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'

// ** Utils
import { getInitials } from 'src/@core/utils/get-initials'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import useThemedToast from 'src/@core/hooks/useThemedToast'

interface Props {
  settings: Settings
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props
  const { user } = useAuth()
  const { t } = useTranslation()

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false)
  const [attendanceType, setAttendanceType] = useState<'input' | 'output' | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ** Hooks
  const router = useRouter()
  const { logout } = useAuth()
  const toast = useThemedToast()

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }

  const handleProfileOpen = () => {
    setProfileOpen(true)
    handleDropdownClose()
  }

  const handleProfileClose = () => {
    setProfileOpen(false)
  }

  const handleAttendanceOpen = (type: 'input' | 'output') => {
    setAttendanceType(type)
    setAttendanceModalOpen(true)
    handleDropdownClose()
  }

  const handleAttendanceClose = () => {
    setAttendanceModalOpen(false)
    setAttendanceType(null)
    setComment('')
  }

  const handleAttendanceSubmit = async () => {
    if (!user || !attendanceType) return

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const payload = {
        company: user.company_id || 0,
        employee: user.id,
        date: now,
        type: attendanceType,
        comment: comment || ''
      }

      await DataService.post(endpoints.employeeAccount, payload)

      if (attendanceType === 'input') {
        toast.success(String(t('attendance.inputSuccess') || 'Ishga kirish muvaffaqiyatli qayd etildi'))
      } else {
        toast.success(String(t('attendance.outputSuccess') || 'Ishdan chiqish muvaffaqiyatli qayd etildi'))

        // Chiqishda logout qilish
        setTimeout(() => {
          logout()
        }, 1000)
      }

      handleAttendanceClose()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || String(t('errors.generic'))
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Avatar
          alt='John Doe'
          src='/images/avatars/1.png'
          onClick={handleDropdownOpen}
          sx={{ width: 38, height: 38 }}
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4.75 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ py: 1.75, px: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <Avatar
                alt={user?.fullname}
                src={user?.avatar || '/images/avatars/1.png'}
                sx={{ width: '2.5rem', height: '2.5rem' }}
              />
            </Badge>
            <Box sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 500 }}>{user?.fullname}</Typography>
              <Typography variant='body2'>
                {user?.role_detail?.map(role => role.name).join(', ') || 'No Role'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleAttendanceOpen('input')}>
          <Box sx={styles}>
            <Icon icon='tabler:login' />
            {String(t('attendance.input') || 'Kirish')}
          </Box>
        </MenuItemStyled>
        <MenuItemStyled sx={{ p: 0 }} onClick={handleProfileOpen}>
          <Box sx={styles}>
            <Icon icon='tabler:user-check' />
            {String(t('common.myProfile') || 'My Profile')}
          </Box>
        </MenuItemStyled>

        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleAttendanceOpen('output')}>
          <Box sx={styles}>
            <Icon icon='tabler:logout' />
            {String(t('attendance.output') || 'Chiqish')}
          </Box>
        </MenuItemStyled>
      </Menu>

      {/* Profile Dialog */}
      <Dialog
        open={profileOpen}
        onClose={handleProfileClose}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant='h5'>{String(t('common.myProfile') || 'My Profile')}</Typography>
            <IconButton onClick={handleProfileClose} size='small'>
              <Icon icon='tabler:x' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {user && (
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
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Modal */}
      <Dialog
        open={attendanceModalOpen}
        onClose={isSubmitting ? undefined : handleAttendanceClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant='h5'>
              {attendanceType === 'input'
                ? String(t('attendance.inputTitle') || 'Ishga kirish')
                : String(t('attendance.outputTitle') || 'Ishdan chiqish')}
            </Typography>
            <IconButton onClick={handleAttendanceClose} size='small' disabled={isSubmitting}>
              <Icon icon='tabler:x' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {attendanceType === 'input'
                  ? String(
                      t('attendance.inputDescription') || 'Ishga kirishni tasdiqlash uchun izoh qoldiring (ixtiyoriy)'
                    )
                  : String(
                      t('attendance.outputDescription') ||
                        'Ishdan chiqishni tasdiqlash uchun izoh qoldiring (ixtiyoriy)'
                    )}
              </Typography>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={String(t('attendance.commentPlaceholder') || 'Izoh...')}
                disabled={isSubmitting}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAttendanceClose} disabled={isSubmitting}>
            {String(t('common.cancel') || 'Cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleAttendanceSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <Icon icon='mdi:loading' /> : null}
          >
            {isSubmitting
              ? String(t('common.saving') || 'Saving...')
              : attendanceType === 'input'
              ? String(t('attendance.confirmInput') || 'Tasdiqlash')
              : String(t('attendance.confirmOutput') || 'Tasdiqlash va chiqish')}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default UserDropdown
