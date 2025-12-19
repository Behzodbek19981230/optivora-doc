import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import CustomAvatar from 'src/@core/components/mui/avatar'
import Chip from '@mui/material/Chip'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

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
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{String(t('users.view.title'))}</DialogTitle>
      <DialogContent>
        {user ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CustomAvatar
                  src={user.avatar}
                  variant='circular'
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    '& img': { width: '100%', height: '100%', objectFit: 'contain' }
                  }}
                />
                <Typography variant='h6' sx={{ mt: 2 }}>
                  {user.fullname || user.username}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  @{user.username}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.fullname'))}
                  </Typography>
                  <Typography variant='body1'>{user.fullname}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.username'))}
                  </Typography>
                  <Typography variant='body1'>{user.username}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.email'))}
                  </Typography>
                  <Typography variant='body1'>{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.phone'))}
                  </Typography>
                  <Typography variant='body1'>{user.phone_number}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.active'))}
                  </Typography>
                  <Typography variant='body1'>
                    {user.is_active ? String(t('common.yes')) : String(t('common.no'))}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.gender'))}
                  </Typography>
                  <Typography variant='body1'>
                    {user.gender === 'male'
                      ? String(t('users.gender.male'))
                      : user.gender === 'female'
                      ? String(t('users.gender.female'))
                      : user.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.birthDate'))}
                  </Typography>
                  <Typography variant='body1'>
                    {user.date_of_birthday ? moment(user.date_of_birthday).format('DD.MM.YYYY') : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('common.createdAt'))}
                  </Typography>
                  <Typography variant='body1'>{moment(user.date_joined).format('DD.MM.YYYY HH:mm')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.region'))}
                  </Typography>
                  <Typography variant='body1'>{user.region_detail?.name_uz}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.district'))}
                  </Typography>
                  <Typography variant='body1'>{user.district_detail?.name_uz}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.address'))}
                  </Typography>
                  <Typography variant='body1'>{user.address}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.role'))}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.roles_detail?.map(role => (
                      <Chip key={role.id} label={role.name} size='small' />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('users.form.companies'))}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.companies_detail?.map(company => (
                      <Chip key={company.id} label={company.name} size='small' />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
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
