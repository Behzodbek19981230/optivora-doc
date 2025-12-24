// ** MUI Imports
import Box from '@mui/material/Box'
import React, { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import { Button, Menu, MenuItem, Avatar, ListItemText, Typography } from '@mui/material'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const auth = useAuth()

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden && !settings.navHidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon fontSize='1.5rem' icon='tabler:menu-2' />
          </IconButton>
        ) : null}
        {auth.user && <CompanyDropdown auth={auth} />}
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <LanguageDropdown settings={settings} saveSettings={saveSettings} />
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        {auth.user && (
          <>
            {/* <ShortcutsDropdown settings={settings} shortcuts={shortcuts} /> */}
            {/* <NotificationDropdown settings={settings} notifications={notifications} /> */}
            <UserDropdown settings={settings} />
          </>
        )}
      </Box>
    </Box>
  )
}

export default AppBarContent

// Company dropdown component for prettier UI than Select
const CompanyDropdown = ({ auth }: any) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const allCompaniesDetail = auth.user?.companies_detail || []
  const companiesDetail = allCompaniesDetail.filter((c: any) => c.is_active) || []
  const companiesIds = auth.user?.companies || []
  const selectedId = auth.user?.company_id ?? auth.user?.company_current ?? null
  const selectedCompany = selectedId ? allCompaniesDetail.find((c: any) => c.id === selectedId) : null
  const selected =
    companiesDetail.find((c: any) => c.id === selectedId) ||
    (selectedId ? { id: selectedId, name: `Company ${selectedId}` } : null)

  useEffect(() => {
    // If current company becomes inactive, immediately logout.
    if (selectedCompany && selectedCompany.is_active === false) {
      try {
        setAnchorEl(null)
      } catch {}
      auth.logout?.()
    }
  }, [auth, selectedCompany])

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  const choose = (id: number) => {
    const updated = { ...auth.user, company_current: id, company_id: id }
    auth.setUser(updated)
    window.localStorage.setItem('userData', JSON.stringify(updated))
    handleClose()
    router.reload()
  }

  return (
    <>
      <Button onClick={handleOpen} color='primary' variant='outlined' size='small' className=''>
        {selected ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selected.logo && (
              <Avatar
                src={`${process.env.NEXT_PUBLIC_FILE_URL}${selected.logo}`}
                alt={selected.name}
                sx={{ width: 20, height: 20, mr: 1, bgcolor: 'background.default', objectFit: 'contain' }}
              />
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <span>{selected.name}</span>
              <Typography variant='caption' color='text.secondary'>
                {selected.region_detail?.name},{selected.district_detail?.name}
              </Typography>
            </Box>
          </Box>
        ) : (
          'Select Company'
        )}
        <Icon
          icon='tabler:chevron-down'
          fontSize='1.25rem'
          style={{
            marginLeft: 8,
            transition: 'transform 0.25s ease-in-out',
            transform: open ? 'rotate(180deg)' : 'none'
          }}
        />
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        {companiesDetail.length > 0
          ? companiesDetail.map((c: any) => (
              <MenuItem
                key={c.id}
                selected={c.id === selectedId}
                onClick={() => choose(c.id)}
                sx={{
                  width: 300
                }}
              >
                {c.logo && (
                  <Avatar
                    src={`${process.env.NEXT_PUBLIC_FILE_URL}${c.logo}`}
                    alt={c.name}
                    sx={{ width: 20, height: 20, mr: 1, bgcolor: 'background.default' }}
                  />
                )}
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <span>{c.name}</span>
                      <Typography variant='caption' color='text.secondary'>
                        {c.region_detail?.name},{c.district_detail?.name}
                      </Typography>
                    </Box>
                  }
                />
                <Typography variant='caption' sx={{ marginLeft: 'auto', color: 'text.disabled' }}>
                  CODE: {c.code}
                </Typography>
              </MenuItem>
            ))
          : companiesIds.map((id: number) => (
              <MenuItem key={id} selected={id === selectedId} onClick={() => choose(id)}>
                <ListItemText primary={`Company ${id}`} />
              </MenuItem>
            ))}
      </Menu>
    </>
  )
}
