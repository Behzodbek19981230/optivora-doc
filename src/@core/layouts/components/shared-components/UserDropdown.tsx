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
import Button from '@mui/material/Button'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'

// ** Utils
import { useTranslation } from 'react-i18next'
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
          src={user?.avatar || '/images/avatars/1.png'}
          onClick={handleDropdownOpen}
          sx={{ width: 38, height: 38 }}
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 260, mt: 4.75 } }}
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

        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/my-profile')}>
          <Box sx={styles}>
            <Icon icon='tabler:user-check' />
            {String(t('common.myProfile') || 'My Profile')}
          </Box>
        </MenuItemStyled>
        <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant='contained'
            color='success'
            size='small'
            startIcon={<Icon icon='tabler:login' />}
            onClick={() => handleAttendanceOpen('input')}
          >
            {String(t('attendance.input') || 'Keldi')}
          </Button>
          <Button
            fullWidth
            variant='contained'
            color='error'
            size='small'
            startIcon={<Icon icon='tabler:logout' />}
            onClick={() => handleAttendanceOpen('output')}
          >
            {String(t('attendance.output') || 'Ketdi')}
          </Button>
        </Box>
      </Menu>

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
