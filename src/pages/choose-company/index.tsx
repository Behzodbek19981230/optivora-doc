import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
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

const ChooseCompanyPage = () => {
  const { user, setUser } = useAuth() as any
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  console.log(user)

  const companies = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.companies_detail) && user.companies_detail.length > 0) {
      return user.companies_detail
    }
    if (Array.isArray(user.companies) && user.companies.length > 0) {
      // fallback: only IDs
      return user.companies.map((id: number) => ({ id, name: `Company ${id}` }))
    }
    return []
  }, [user])

  const filtered = useMemo(() => {
    if (!query) return companies
    const q = query.toLowerCase()
    return companies.filter(
      (c: any) =>
        (c.name || '').toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q) || String(c.id).includes(q)
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
    const updated = { ...user, company_current: id, company_id: id }
    setUser(updated)
    window.localStorage.setItem('userData', JSON.stringify(updated))
    router.replace('/dashboards/analytics')
  }

  return (
    <Box sx={{ p: 6 }}>
      <Card>
        <CardHeader title='Select a Company' subheader='Pick the company you want to work with' />
        <CardContent>
          {loading ? (
            <Stack alignItems='center' sx={{ py: 6 }}>
              <Icon icon='tabler:loader-2' fontSize={24} className='spinner' />
              <Typography sx={{ mt: 2 }}>Loading companies…</Typography>
            </Stack>
          ) : companies.length === 0 ? (
            <Typography>No companies available for your account.</Typography>
          ) : (
            <Box>
              <TextField
                fullWidth
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Search companies by name, code or ID'
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
                        Choose
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={c.logo || undefined}>
                        <Icon icon='tabler:building' />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction='row' alignItems='center' spacing={2}>
                          <Typography variant='h6'>{c.name || `Company ${c.id}`}</Typography>
                          {c.is_active === false ? <Chip size='small' color='warning' label='Inactive' /> : null}
                        </Stack>
                      }
                      secondary={
                        <Stack direction='row' spacing={3} flexWrap='wrap'>
                          {c.code ? <Typography color='text.secondary'>Code: {c.code}</Typography> : null}
                          {c.phone ? <Typography color='text.secondary'>Phone: {c.phone}</Typography> : null}
                          {c.region_detail?.name ? (
                            <Typography color='text.secondary'>Region: {c.region_detail.name}</Typography>
                          ) : null}
                          {c.district_detail?.name ? (
                            <Typography color='text.secondary'>District: {c.district_detail.name}</Typography>
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
