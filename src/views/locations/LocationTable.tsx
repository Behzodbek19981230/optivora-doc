import { useState } from 'react'
import Card from '@mui/material/Card'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import CountryTable from './tables/CountryTable'
import RegionTable from './tables/RegionTable'
import DistrictTable from './tables/DistrictTable'
import { useTranslation } from 'react-i18next'

const LocationTable = () => {
  const [tab, setTab] = useState(0)
  const { t } = useTranslation()
  return (
    <Card>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={String(t('locations.tabs.countries'))} />
        <Tab label={String(t('locations.tabs.regions'))} />
        <Tab label={String(t('locations.tabs.districts'))} />
      </Tabs>
      <Box sx={{ p: 2 }}>
        {tab === 0 && <CountryTable />}
        {tab === 1 && <RegionTable />}
        {tab === 2 && <DistrictTable />}
      </Box>
    </Card>
  )
}

export default LocationTable
