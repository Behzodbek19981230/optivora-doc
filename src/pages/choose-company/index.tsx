import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  InputAdornment,
  Stack,
  Chip
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import authConfig from 'src/configs/auth'
import { DataService } from 'src/configs/dataService'
import { UserDataType } from 'src/context/types'
import { useTranslation } from 'react-i18next'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

const ChooseCompanyPage = () => {
  const { user, setUser } = useAuth() as any
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const { t } = useTranslation()

  const companies = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.companies_detail) && user.companies_detail.length > 0) {
      return user.companies_detail.filter((c: any) => c.is_active)
    }

    return []
  }, [user])

  const filtered = useMemo(() => {
    if (!query) return companies
    const q = query.toLowerCase()

    return companies.filter(
      (c: any) =>
        (c.is_active && (c.name || '').toLowerCase().includes(q)) ||
        (c.code || '').toLowerCase().includes(q) ||
        String(c.id).includes(q)
    )
  }, [companies, query])

  // Ensure we have the latest profile with companies_detail
  useEffect(() => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
    if (!user && token) {
      setLoading(true)
      DataService.get(authConfig.meEndpoint)
        .then(async response => {
          setLoading(false)
          const userData = response.data as UserDataType
          setUser({ ...userData })
          if (!localStorage.getItem('userData')) window.localStorage.setItem('userData', JSON.stringify(userData))
        })
        .finally(() => setLoading(false))
    }
  }, [user, setUser])

  const handleSelect = (id: number) => {
    const updated: UserDataType = { ...(user as UserDataType), company_current: id, company_id: id }
    setUser(updated)
    window.localStorage.setItem('userData', JSON.stringify(updated))
    const roleNames = updated?.role_detail?.map(role => role.name) || []
    const homeRoute = getHomeRoute(roleNames)
    router.replace(homeRoute)
  }

  return (
    <Box sx={{ p: 6 }}>
      <Card>
        <CardHeader title={t('chooseCompany.title')} subheader={t('chooseCompany.subtitle')} />
        <CardContent>
          {loading ? (
            <Stack alignItems='center' sx={{ py: 6 }}>
              <Icon icon='tabler:loader-2' fontSize={24} className='spinner' />
              <Typography sx={{ mt: 2 }}>{t('chooseCompany.loading')}</Typography>
            </Stack>
          ) : companies.length === 0 ? (
            <Typography>{t('chooseCompany.empty')}</Typography>
          ) : (
            <Box>
              <TextField
                fullWidth
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={String(t('chooseCompany.searchPlaceholder'))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:search' />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 4 }}
              />
              <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                {filtered.map((c: any) => (
                  <ListItem
                    key={c.id}
                    sx={{
                      border: theme => `1px solid ${theme.palette.divider}`,
                      mb: 2,
                      borderRadius: 2
                    }}
                    secondaryAction={
                      <Button variant='contained' onClick={() => handleSelect(c.id)}>
                        {t('chooseCompany.choose')}
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={`${process.env.NEXT_PUBLIC_FILE_URL}${c.logo}` || undefined}>
                        {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction='row' alignItems='center' spacing={2}>
                          <Typography variant='h6'>{c.name || `Company ${c.id}`}</Typography>
                          {c.is_active === false ? (
                            <Chip size='small' color='warning' label={t('chooseCompany.inactive')} />
                          ) : null}
                        </Stack>
                      }
                      secondary={
                        <Stack direction='row' spacing={3} flexWrap='wrap'>
                          {c.code ? (
                            <Typography color='text.secondary'>
                              {t('chooseCompany.code')}: {c.code}
                            </Typography>
                          ) : null}
                          {c.phone ? (
                            <Typography color='text.secondary'>
                              {t('chooseCompany.phone')}: {c.phone}
                            </Typography>
                          ) : null}
                          {c.region_detail?.name ? (
                            <Typography color='text.secondary'>
                              {t('chooseCompany.region')}: {c.region_detail.name}
                            </Typography>
                          ) : null}
                          {c.district_detail?.name ? (
                            <Typography color='text.secondary'>
                              {t('chooseCompany.district')}: {c.district_detail.name}
                            </Typography>
                          ) : null}
                          {c.address ? <Typography color='text.secondary'>{c.address}</Typography> : null}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

// Render without auth redirect
ChooseCompanyPage.getLayout = (page: React.ReactNode) => page
ChooseCompanyPage.authGuard = true
ChooseCompanyPage.acl = { action: 'manage', subject: 'all' }

export default ChooseCompanyPage
