import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CustomAvatar from 'src/@core/components/mui/avatar'
import Chip from '@mui/material/Chip'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Icon from 'src/@core/components/icon'

type User = {
  id: number
  username: string
  fullname: string
  is_active: boolean
  date_of_birthday?: string
  gender?: string
  phone_number?: string
  avatar?: string
  email: string
  date_joined: string
  roles: number[]
  roles_detail?: Array<{ id: number; name: string; description: string }>
  region: number
  region_detail?: {
    id: number
    code: string
    name: string
    name_en: string
    name_uz: string
    name_ru: string
  }
  district: number
  district_detail?: {
    id: number
    code: string
    name: string
    name_en: string
    name_uz: string
    name_ru: string
    region: number
  }
  address?: string
  companies: number[]
  companies_detail?: Array<{
    id: number
    code: string
    name: string
    is_active: boolean
    phone: string
    country: number
    region: number
    district: number
    address: string
    created_time: string
    logo: string
  }>
}

type Props = {
  open: boolean
  onClose: () => void
  user: User | null
}

const UserViewDialog = ({ open, onClose, user }: Props) => {
  const { t, i18n } = useTranslation()

  const getLocalizedLocationName = (detail?: {
    name?: string
    name_en?: string
    name_uz?: string
    name_ru?: string
  }) => {
    if (!detail) return '—'
    const lang = i18n.language
    if (lang.startsWith('uz')) return detail.name_uz || detail.name || '—'
    if (lang.startsWith('ru')) return detail.name_ru || detail.name || '—'
    if (lang.startsWith('en')) return detail.name_en || detail.name || '—'

    return detail.name || detail.name_uz || detail.name_ru || detail.name_en || '—'
  }

  const display = (val?: string | number | null) => {
    if (val === null || val === undefined) return '—'
    const s = String(val).trim()

    return s.length ? s : '—'
  }

  const genderLabel = (gender?: string) => {
    if (gender === 'male') return String(t('users.gender.male', { defaultValue: 'Male' }))
    if (gender === 'female') return String(t('users.gender.female', { defaultValue: 'Female' }))
    if (!gender) return '—'

    return gender
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ pr: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant='h6'>{String(t('users.view.title', { defaultValue: 'User details' }))}</Typography>
          <Tooltip title={String(t('common.close'))}>
            <IconButton onClick={onClose} aria-label='close'>
              <Icon icon='tabler:x' />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        {user ? (
          <Box sx={{ pb: 2 }}>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 4,
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
                <CustomAvatar
                  src={user.avatar}
                  variant='circular'
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    '& img': { width: '100%', height: '100%', objectFit: 'cover' }
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant='h6' sx={{ fontWeight: 700 }} noWrap>
                    {display(user.fullname || user.username)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' noWrap>
                    {display(user.email)}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' noWrap>
                    @{display(user.username)}
                  </Typography>
                </Box>
              </Box>

              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                <Chip
                  size='small'
                  color={user.is_active ? 'success' : 'default'}
                  variant={user.is_active ? 'filled' : 'outlined'}
                  label={user.is_active ? String(t('common.yes')) : String(t('common.no'))}
                />
                {user.roles_detail?.slice(0, 4).map(role => (
                  <Chip key={role.id} label={role.name} size='small' variant='outlined' />
                ))}
                {user.roles_detail && user.roles_detail.length > 4 ? (
                  <Chip
                    size='small'
                    variant='outlined'
                    label={`+${user.roles_detail.length - 4}`}
                    aria-label='more roles'
                  />
                ) : null}
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Details */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                  {String(t('users.view.sections.contact', { defaultValue: 'Contact' }))}
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon icon='tabler:mail' fontSize='1.25rem' />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {String(t('users.form.email'))}
                      </Typography>
                      <Typography variant='body1' noWrap>
                        {display(user.email)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon icon='tabler:phone' fontSize='1.25rem' />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {String(t('users.form.phone'))}
                      </Typography>
                      <Typography variant='body1' noWrap>
                        {display(user.phone_number)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Icon icon='tabler:map-pin' fontSize='1.25rem' />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {String(t('users.form.address'))}
                      </Typography>
                      <Typography variant='body1'>{display(user.address)}</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                  {String(t('users.view.sections.meta', { defaultValue: 'Details' }))}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('users.form.fullname'))}
                    </Typography>
                    <Typography variant='body1'>{display(user.fullname)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('users.form.username'))}
                    </Typography>
                    <Typography variant='body1'>{display(user.username)}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('users.form.gender'))}
                    </Typography>
                    <Typography variant='body1'>{genderLabel(user.gender)}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('users.form.birthDate'))}
                    </Typography>
                    <Typography variant='body1'>
                      {user.date_of_birthday ? moment(user.date_of_birthday).format('DD.MM.YYYY') : '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('users.form.region'))}
                    </Typography>
                    <Typography variant='body1'>{getLocalizedLocationName(user.region_detail)}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('users.form.district'))}
                    </Typography>
                    <Typography variant='body1'>{getLocalizedLocationName(user.district_detail)}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant='body2' color='text.secondary'>
                      {String(t('common.createdAt'))}
                    </Typography>
                    <Typography variant='body1'>{moment(user.date_joined).format('DD.MM.YYYY HH:mm')}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                  {String(t('users.form.role'))}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.roles_detail?.length ? (
                    user.roles_detail.map(role => <Chip key={role.id} label={role.name} size='small' />)
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      —
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>
                  {String(t('users.form.companies'))}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.companies_detail?.length ? (
                    user.companies_detail.map(company => <Chip key={company.id} label={company.name} size='small' />)
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      —
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Typography color='text.secondary'>{String(t('common.notFound'))}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{String(t('common.close'))}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserViewDialog
