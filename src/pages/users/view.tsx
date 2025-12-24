import { useRouter } from 'src/spa/router/useRouter'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, Grid, Typography, CircularProgress, Box, Chip } from '@mui/material'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { getInitials } from 'src/@core/utils/get-initials'
import { useTranslation } from 'react-i18next'

interface User {
  id: number
  username: string
  fullname: string
  is_active: boolean
  date_of_birthday?: string
  gender?: string
  phone_number?: string
  avatar?: string
  email: string
  role: string
  region: number
  district: number
  address?: string
  companies: any[]
  companies_detail?: Array<{ id?: number; name?: string; title?: string } | string | number>
}

const UserViewPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const res = await DataService.get<User>(endpoints.userById(id))
        setUser(res.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (!id) return null

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader title={String(t('users.view.title'))} />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ pt: 8, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  {user.avatar ? (
                    <CustomAvatar
                      src={user.avatar}
                      variant='rounded'
                      alt={user.fullname}
                      sx={{ width: 100, height: 100, mb: 4, '& img': { objectFit: 'cover' } }}
                    />
                  ) : (
                    <CustomAvatar
                      skin='light'
                      variant='rounded'
                      color='primary'
                      sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                    >
                      {getInitials(user.fullname || user.username)}
                    </CustomAvatar>
                  )}
                  <Typography variant='h4' sx={{ mb: 2 }}>
                    {user.fullname || user.username}
                  </Typography>
                  <CustomChip rounded skin='light' size='small' label={user.role} color='primary' />
                </CardContent>

                <CardContent sx={{ pt: 2 }}>
                  <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                    {String(t('users.view.details'))}
                  </Typography>
                  <Box sx={{ pt: 4 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.username'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>@{user.username}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.email'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.active'))}:
                      </Typography>
                      <CustomChip
                        rounded
                        skin='light'
                        size='small'
                        label={user.is_active ? String(t('common.yes')) : String(t('common.no'))}
                        color={user.is_active ? 'success' : 'secondary'}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.phone'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.phone_number || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.gender'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.gender || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.birthDate'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.date_of_birthday || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.region'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.region}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.district'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.district}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.address'))}:
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.address || '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography sx={{ mr: 2, mt: 0.6, fontWeight: 500, color: 'text.secondary' }}>
                        {String(t('users.form.companies'))}:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Array.isArray(user.companies_detail) && user.companies_detail.length > 0
                          ? user.companies_detail.map((c, idx) => {
                              let label: string
                              if (typeof c === 'string' || typeof c === 'number') label = String(c)
                              else label = c.name || (c as any).company_name || c.title || `#${(c as any).id}`
                              return <Chip key={idx} size='small' label={label} />
                            })
                          : Array.isArray(user.companies)
                          ? user.companies.map((c: any, idx: number) => (
                              <Chip key={idx} size='small' label={String(c)} />
                            ))
                          : '-'}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography color='text.secondary'>{String(t('common.notFound'))}</Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default UserViewPage
